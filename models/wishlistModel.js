const mongoose = require('mongoose')
const wishListSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    wishList: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
  
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  });

  module.exports = mongoose.model('wishList',wishListSchema)