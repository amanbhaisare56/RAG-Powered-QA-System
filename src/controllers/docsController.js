const Document = require('../models/Document');

const getAllDocs = async (req, res, next) => {
  try {
    const docs = await Document.find({}).select('title tags createdAt');
    res.json({ 
      count: docs.length,
      documents: docs 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllDocs };  