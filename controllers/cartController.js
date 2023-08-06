const User = require("../models/userModel")
const Admin = require("../models/adminModel")
const Product = require('../models/productModel')
const Category = require('../models/catagoryModel')
const Cart = require('../models/cart')
const cartHelper = require('../Helper/cartHelper')
const mongoose = require('mongoose');

const addToCart = async (req, res) => {
    try {
        cartHelper.addCart(req.params.id, req.session.user_id)
            .then((response) => {
                res.send(response)
            })
            
    } catch (error) {
        console.log(error.message);
    }
}

const loadCart = async (req, res) => {
    try {
      
      const user =req.session.user_id ;

      const count = await cartHelper.getCartCount(user);
    
      let cartTotal = 0;
  
      const total = await Cart.findOne({user:user});
    
      if (total) {
        cartTotal = total.cartTotal;
  
        const cart = await Cart.aggregate([
          {
            $match: {user: new mongoose.Types.ObjectId(user)}
          },
          
          {
            $unwind: "$cartItems"
          },
          {
            $project:{
              item:{$toObjectId:("$cartItems.productId")},
              quantity:"$cartItems.quantity",
              total:"$cartItems.total"
            }
          },
          {
            $lookup: {
              from: "products",
              localField: "item",
              foreignField: "_id",
              as: "carted"
            }
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              total: 1,
              carted: { $arrayElemAt: ["$carted", 0] }
            }
          }
        ]);
        
           
        res.render("cart", { cart, user, count, cartTotal });
      } else {
        res.render("cart", { user, count, cartTotal, cart: [],address });
      }
    } catch (error) {
      console.log(error); 
      res.send({ success: false, error: error.message });
    }
  };


  
const editQuantity = (req, res) => {

    const userId = req.session.user_id;
  
    cartHelper.updateQuantity(req.body).then(async (response) => {
      res.json(response);
    });
  }



  const deleteProduct = (req, res) => {
  
    cartHelper.deleteProduct(req.body).then((response) => {
      res.send(response);
    });
  }
  
module.exports = {
    addToCart,
    loadCart,
    editQuantity,
    deleteProduct

}