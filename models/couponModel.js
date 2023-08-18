const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
    couponCode:{
        type:String,
    },
    validity:{
        type:Date,
        default:new Date()
    },
    minPurchase: { type: Number },
    minDiscountPercentage: { type: Number },
    maxDiscountValue: { type: Number },
    description: { type: String },
    createdAt: {
      type: Date,
      default: new Date(),
    }

})
module.exports = mongoose.model('Coupon', couponSchema);