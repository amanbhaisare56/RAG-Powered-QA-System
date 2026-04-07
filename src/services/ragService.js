const { ChatGroq } = require('@langchain/groq');
const { PromptTemplate } = require('@langchain/core/prompts');
const { z } = require('zod');
const Document = require('../models/Document');
const logger = require('../utils/logger');

// 1. Define the shape of the AI response using Zod
const answerSchema = z.object({
  answer: z.string().describe("The answer based strictly on provided context"),
  sources: z.array(z.string()).describe("Array of document IDs used to answer"),
  confidence: z.enum(["high", "medium", "low"]).describe("Confidence based on relevance score")
});

// 2. Initialize the LLM
const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.1-8b-instant",
  temperature: 0.1
});

// 3. Create the prompt template
const promptTemplate = PromptTemplate.fromTemplate(`
You are a helpful assistant that answers questions STRICTLY based on the provided context documents.

IMPORTANT RULES:
- Answer ONLY from the context provided below
- If the answer is not in the context, say: "I don't have information about this in the available documents."
- Never make up information
- Be concise and accurate

CONTEXT DOCUMENTS:
{context}

USER QUESTION: {question}

Respond with a JSON object in this exact format:
{{
  "answer": "your answer here based only on context",
  "sources": ["doc_id_1", "doc_id_2"],
  "confidence": "high" or "medium" or "low"
}}

Only respond with the JSON object, no extra text.
`);

// 4. Keyword-based document retrieval
async function retrieveRelevantDocs(question, topN = 3) {
  // Extract keywords from question (remove common words)
  const stopWords = ['what', 'is', 'the', 'how', 'do', 'i', 'can', 'a', 'an', 'for', 'about', 'tell', 'me'];
  const keywords = question
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .split(' ')
    .filter(word => word.length > 2 && !stopWords.includes(word));

  logger.info('Extracted keywords for retrieval', { keywords });

  // Search MongoDB using text match on keywords
  const allDocs = await Document.find({});
  
  // Score each document by keyword matches
  const scoredDocs = allDocs.map(doc => {
    const docText = `${doc.title} ${doc.content} ${doc.tags.join(' ')}`.toLowerCase();
    let score = 0;
    
    keywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = docText.match(regex);
      if (matches) score += matches.length;
    });
    
    return { doc, score };
  });

  // Sort by score and take top N
  const topDocs = scoredDocs
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  return topDocs;
}

// 5. Derive confidence from retrieval scores
function deriveConfidence(scoredDocs) {
  if (scoredDocs.length === 0) return 'low';
  const topScore = scoredDocs[0].score;
  if (topScore >= 5) return 'high';
  if (topScore >= 2) return 'medium';
  return 'low';
}

// 6. Main RAG function
async function askQuestion(question) {
  const startTime = Date.now();
  
  // Retrieve relevant documents
  const scoredDocs = await retrieveRelevantDocs(question);
  
  if (scoredDocs.length === 0) {
    return {
      answer: "I don't have information about this in the available documents.",
      sources: [],
      confidence: "low",
      latencyMs: Date.now() - startTime
    };
  }

  // Build context string from top docs
  const context = scoredDocs.map(({ doc }) => 
    `[ID: ${doc._id}] Title: ${doc.title}\nContent: ${doc.content}`
  ).join('\n\n---\n\n');

  // Derive confidence BEFORE sending to LLM (not by LLM!)
  const confidence = deriveConfidence(scoredDocs);

  // Format the prompt
  const formattedPrompt = await promptTemplate.format({
    context,
    question
  });

  // Call the LLM
  const response = await llm.invoke(formattedPrompt);
  const rawText = response.content;

  // Parse the JSON response
  let parsed;
  try {
    // Remove markdown code blocks if present
    const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch (e) {
    logger.error('Failed to parse LLM JSON response', { rawText });
    throw new Error('LLM returned invalid JSON response');
  }

  // Validate with Zod schema
  const validated = answerSchema.parse({
    answer: parsed.answer,
    sources: scoredDocs.map(({ doc }) => doc._id.toString()),
    confidence  // Use our calculated confidence, not LLM's
  });

  return {
    ...validated,
    latencyMs: Date.now() - startTime
  };
}

module.exports = { askQuestion };