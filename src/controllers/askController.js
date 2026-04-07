const { askQuestion } = require('../services/ragService');
const QAHistory = require('../models/QAHistory');
const logger = require('../utils/logger');

const ask = async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    const { question } = req.body;
    
    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question is required' });
    }
    
    const result = await askQuestion(question.trim());
    
    // Log the request details (Task 4 requirement)
    logger.info('ASK request completed', {
      userId: req.user.userId,
      question: question.substring(0, 50) + (question.length > 50 ? '...' : ''),
      latencyMs: result.latencyMs,
      confidence: result.confidence,
      sourcesCount: result.sources.length
    });
    
    // Save to history (Bonus feature)
    await QAHistory.create({
      userId: req.user.userId,
      question,
      answer: result.answer,
      sources: result.sources,
      confidence: result.confidence,
      latencyMs: result.latencyMs
    });
    
    res.json({
      answer: result.answer,
      sources: result.sources,
      confidence: result.confidence
    });
    
  } catch (error) {
    logger.error('ASK request failed', {
      userId: req.user?.userId,
      error: error.message,
      latencyMs: Date.now() - startTime
    });
    next(error);
  }
};

// Bonus: Get history
const getHistory = async (req, res, next) => {
  try {
    const history = await QAHistory.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('-userId');
      
    res.json({ history });
  } catch (error) {
    next(error);
  }
};

module.exports = { ask, getHistory };