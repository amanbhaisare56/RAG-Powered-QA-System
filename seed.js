require('dotenv').config();
const mongoose = require('mongoose');
const Document = require('./src/models/Document');

const sampleDocuments = [
  {
    title: "Refund Policy",
    content: "Our refund policy allows customers to request a full refund within 30 days of purchase. Refunds are processed within 5-7 business days. Digital products are non-refundable after download. To initiate a refund, contact support@company.com with your order ID. Partial refunds may be issued for used services.",
    tags: ["refund", "policy", "payment", "returns"],
    createdAt: new Date()
  },
  {
    title: "Shipping Information",
    content: "We offer standard shipping (5-7 business days) and express shipping (2-3 business days). Free shipping is available on orders over $50. International shipping is available to 50+ countries with delivery times of 10-14 business days. All orders are tracked and a tracking number is emailed upon dispatch.",
    tags: ["shipping", "delivery", "orders", "tracking"],
    createdAt: new Date()
  },
  {
    title: "Account Security Guidelines",
    content: "To keep your account secure, use a password with at least 12 characters including uppercase, lowercase, numbers and symbols. Enable two-factor authentication (2FA) for extra protection. Never share your password. Log out from shared devices. We will never ask for your password via email. Report suspicious activity immediately to security@company.com.",
    tags: ["security", "account", "password", "2FA"],
    createdAt: new Date()
  },
  {
    title: "Subscription Plans",
    content: "We offer three subscription tiers: Basic ($9.99/month) with 10GB storage and email support, Pro ($24.99/month) with 100GB storage, priority support and API access, and Enterprise ($99.99/month) with unlimited storage, dedicated support and custom integrations. All plans include a 14-day free trial. Cancel anytime without penalty.",
    tags: ["subscription", "pricing", "plans", "billing"],
    createdAt: new Date()
  },
  {
    title: "Technical Support Process",
    content: "Our technical support is available 24/7. For urgent issues, call our hotline at 1-800-SUPPORT. For non-urgent issues, submit a ticket at support.company.com and expect a response within 24 hours. Priority support users receive responses within 2 hours. Include screenshots and error messages in your ticket for faster resolution.",
    tags: ["support", "technical", "help", "ticket"],
    createdAt: new Date()
  },
  {
    title: "Privacy Policy Overview",
    content: "We collect only necessary data including name, email, and usage analytics. Your data is never sold to third parties. We use AES-256 encryption for stored data and TLS for data in transit. Users can request data export or deletion at any time by contacting privacy@company.com. We comply with GDPR and CCPA regulations.",
    tags: ["privacy", "data", "GDPR", "security"],
    createdAt: new Date()
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    await Document.deleteMany({});
    console.log('Cleared existing documents');
    
    const inserted = await Document.insertMany(sampleDocuments);
    console.log(`Seeded ${inserted.length} documents successfully!`);
    
    inserted.forEach(doc => {
      console.log(`${doc.title} [${doc._id}]`);
    });
    
  } catch (error) {
    console.error('Seed failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

seed();