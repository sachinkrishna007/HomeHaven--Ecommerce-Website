const User = require("../models/userModel")
const Product = require("../models/productModel")
const Order = require('../models/orderModel')


const loadAddress = async (req,res) =>{
    try {

        res.render('address')
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
      res.redirect('/loadAddress')
      
    } catch (error) {
      console.log(error.message);
    }
  }

  const orderHistory = async (req,res) =>{
    try {
      const userId = req.session.user_id;
      const orders = await Order.find({ user: userId }).sort({ createdAt: 'desc' }).populate('items.productId');
      console.log(orders);
      res.render('order-history',{orders})
    } catch (error) {
      res.status(500).json({ error: 'Error fetching order history' });
    }
  };
   
  
  const selectAddress = async (req,res) =>{
    try {
      const userId = req.session.user_id;
    const selectedAddressId = req.body.selectedAddress; // Get the selected address ID from the form
    console.log(selectedAddressId);
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    user.selectedAddress = selectedAddressId;
    // Find the user by ID and update the selected address ID
    await user.save();
    

    // Redirect to the checkout page or any other page you want after selecting the address
    res.redirect('/checkout');
  } catch (error) {
    console.log(error.message);
    res.redirect('/checkout'); // Handle the error and redirect to the checkout page with an error message if needed
  }
}

const orderDetails = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId).populate('items.productId');
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const userId = req.session.user_id;
    const user = await User.findById(userId);

    // Pass the selectedAddress data along with other order details
    res.render('view_order', { order: order, selectedAddress: user.selectedAddress });
  } catch (error) {
    console.log(error.message);
    res.redirect('/'); // Redirect to the homepage or handle the error accordingly
  }
};

  
  module.exports ={
    loadAddress,
    addAddress,
    orderHistory,
    selectAddress,
    orderDetails
   
  }