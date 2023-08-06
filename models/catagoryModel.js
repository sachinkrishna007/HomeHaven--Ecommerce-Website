
const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
  name: {
    type: String,
    required:false,
    unique: true,
  },
  
});

module.exports = mongoose.model('Category', categorySchema);
