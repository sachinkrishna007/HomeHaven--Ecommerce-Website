const Coupon = require("../models/couponModel")
const voucherCode = require("voucher-code-generator");
const User = require('../models/userModel')
const Cart = require('../models/cart')
const mongoose = require('mongoose');
const{objectId} = mongoose.Types.ObjectId

//admin sidee
 const addCoupons = async(req,res)=>{
    try {
        res.render('add-coupon')
    } catch (error) {
        console.log(error.message);
    }
}

const generateCouponCode = async (req, res) => {
    try {
      const couponCode = await generateCoupon();
      res.send(couponCode);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error generating coupon code");
    }
  };
  
  const generateCoupon = async () => {
    try {
      let couponCode = voucherCode.generate({
        length: 6,
        count: 1,
        charset: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        prefix: "HomeHaven-",
      });
      console.log(couponCode);
  
      return { status: true, couponCode: couponCode[0] };
    } catch (error) {
      throw error;
    }
  };


  const postCoupon = async (req, res) => {
    try {
      
      const existingCoupon = await Coupon.find({})
        const {
            couponCode,
            validity,
            minPurchase,
            minDiscountPercentage,
            maxDiscountValue,
            description
        } = req.body;

        const newCoupon = new Coupon({
            couponCode,
            validity,
            minPurchase,
            minDiscountPercentage,
            maxDiscountValue,
            description
        });

        await newCoupon.save();
        res.json({ status: true }); // Send a JSON response to the AJAX request
    } catch (error) {
        console.error(error);
        res.json({ status: false }); // Send a JSON response to the AJAX request
    }
};





const listCoupon = async(req,res)=>{
  try {
      const couponList = await Coupon.find()
      res.render('list-coupon',{couponList})
  } catch (error) {
      
  }
}



const removeCoupon = async(req,res)=>{
  try {
      const id = req.body.couponId
      await Coupon.deleteOne({_id:id})
      res.json({status:true})
      
  } catch (error) {
      
  }
}


//user side


const applyCoupon =  async (req, res) => {
  const couponCode = req.params.id 
  const userId = req.session.user_id
  const cart = await Cart.findOne({user:userId})
  console.log(cart);
  const total =  cart.cartTotal
  
 console.log(total);
  applyCouponUser(couponCode, total).then((response) => {
      res.send(response)
  }) 
}







const verifyCoupon = async (req, res) => {
  const couponCode = req.params.id;
  const userId = req.session.user_id;
  
  try {
    const couponExist = await Coupon.find({ couponCode: couponCode });

    if (couponExist.length > 0) {
      //  
      if (new Date(couponExist[0].validity) - new Date() > 0) {
      
        const usersCoupon = await User.findOne({
          _id: userId,
          coupons: { $in: [couponCode] },
        });

        if (usersCoupon) {
          res.send({ status: false, message: "Coupon already used by the user" });
        } else {
          res.send({ status: true, message: "Coupon added successfully" });
        }
      } else {
        res.send({ status: false, message: "Coupon has expired" });
      }
    } else {
      res.send({ status: false, message: "Coupon doesn't exist" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ status: false, message: "An error occurred" });
  }
};


const applyCouponUser = (couponCode, total) => {
  try {
    return new Promise((resolve, reject) => {
      console.log('reached');
      Coupon.findOne({ couponCode: couponCode }).then(
        (couponExist) => {
          if (couponExist) {
            if (new Date(couponExist.validity) - new Date() > 0) {
              if (total >= couponExist.minPurchase) {
                let discountAmount =
                  (total * couponExist.minDiscountPercentage) / 100;
                if (discountAmount > couponExist.maxDiscountValue) {
                  discountAmount = couponExist.maxDiscountValue;
                  resolve({
                    status: true,
                    discountAmount: discountAmount,
                    discount: couponExist.minDiscountPercentage,
                    couponCode: couponCode,
                  });
                } else {     
                  resolve({
                    status: true,
                    discountAmount: discountAmount,
                    discount: couponExist.minDiscountPercentage,
                    couponCode: couponCode,
                  });
                }
              } else {
                resolve({
                  status: false,
                  message: `Minimum purchase amount is ${couponExist.minPurchase}`,
                });
              }
            } else {
              resolve({
                status: false,
                message: "Counpon expired",
              });
            }
          } else {
            resolve({
              status: fasle,
              message: "Counpon doesnt Exist",
            });
          }
        }
      );
    });
  } catch (error) {
    console.log(error.message);
  }
}



module.exports = {
    addCoupons,
    generateCouponCode,
    postCoupon,
    listCoupon,
    removeCoupon,
    applyCoupon,
    applyCouponUser,
    verifyCoupon,
    
}



