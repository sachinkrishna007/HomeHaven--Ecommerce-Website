const User = require("../models/userModel")
const Product = require("../models/productModel")
const Order = require('../models/orderModel')
const bcrypt = require('bcrypt')


const loadAddress = async (req,res) =>{
    try {

        res.render('address')
    } catch (error) {
        console.log(error.message);
    }
}

const securePassword = async (password) => {
  try {

      const passwordHash = await bcrypt.hash(password, 10)
      return passwordHash
  } catch (error) {
      console.log(error.message);
  }
}



const addAddress = async (req, res) => {


    try {
       const user = req.session.user_id
      let users = await User.findOne({_id:user})
    
      if (users === null) throw 'User not found'
  
      const newAddress = {
        name: req.body.name,
        mobile: req.body.mobile,
        pincode: req.body.pincode,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        landmark: req.body.landmark,
        district: req.body.district
      }
  
      users.address.push(newAddress)
  
      await users.save()
      res.json({ success: true, message: 'Address added successfully' });
    
      
    } catch (error) {
      console.log(error.message);
    }
  }

  const orderHistory = async (req,res) =>{
    try {
      const userId = req.session.user_id;
      const orders = await Order.find({ user: userId }).sort({ createdAt: 'desc' }).populate('items.productId');
      
      res.render('order-history',{orders})
    } catch (error) {
      res.status(500).json({ error: 'Error fetching order history' });
    }
  };
   
  
  const selectAddress = async (req, res) => {
    try {
      const userId = req.session.user_id;
      const selectedAddressId = req.body.selectedAddress;
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }
  
      user.selectedAddress = selectedAddressId;
      await user.save();
  
      res.json({ message: "Address selected successfully!" });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Failed to select address." });
    }
  };
  

const orderDetails = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId).populate('items.productId');
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const userId = req.session.user_id;
    const user = await User.findById(userId);
    const selectedAddressId = user.selectedAddress;
    let selectedAddress;
    if (selectedAddressId) {
      selectedAddress = user.address.find((address) => address._id.equals(selectedAddressId));
    }
 
    res.render('order-details', { order: order, selectedAddress: selectedAddress });
  } catch (error) {
    console.log(error.message);
    res.redirect('/'); 
  }
};

const updatePasswordLoad = async (req,res)=>{
  try {
    res.render('confirmPassword')
  } catch (error) {
    console.log(error.message);
  }
}

const verifyOldPassword = async (req,res)=>{
  try {
    const user = req.session.user_id;
    const { oldPassword } = req.body;

    const existingUser = await User.findById(user);
    const isMatch = await bcrypt.compare(oldPassword, existingUser.password);
    if (!isMatch) {
      return res.render('confirmPassword', { message: "Old password is incorrect" });
    }
    res.render('password-update');
  } catch (error) {
    console.log(error.message);
    // Handle any errors that may occur during the verification process
    return res.render('confirmPassword', { message: "Error verifying old password" });
  }
}



const updatePassword = async (req, res) => {
  try {
    const user = req.session.user_id
      const { password, confirmPassword, mobile } = req.body;

      // Check if the passwords match
      if (password !== confirmPassword) {
          return res.render('password-update', {
              mobile: mobile,
              message: "Passwords do not match",
          });
      }

      
      const hashedPassword = await securePassword(password);
      await User.updateOne(
        { _id: user },
        { password: hashedPassword }
    );

      return res.render('password-update', { message: "Password update successful" });

  } catch (error) {
      console.log(error.message);
      // Handle any errors that may occur during the password reset process
      return res.render('password-update', { message: "Password reset failed" });
  }
};





  
  module.exports ={
    loadAddress,
    addAddress,
    orderHistory,
    selectAddress,
    orderDetails,
    updatePassword,
    updatePasswordLoad,
    verifyOldPassword,
  
   
  }