const User = require("../models/userModel")
const Product = require("../models/productModel")
const Order = require('../models/orderModel')
const bcrypt = require('bcrypt')
const Contact = require('../models/contactModel')


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
      
      return res.render('password-update', { message: "Password reset failed" });
  }
};


const LoadWallet = async (req,res) =>{
  try {
    const UserId = req.session.user_id
    const user = await User.findOne({_id:UserId})
   console.log(user);
    res.render('user-wallet',{user})
    
  } catch (error) {
    console.log(error.message);
    
  }
}

const editAddress = async(req,res)=>{
  try{
    const id= req.params.id
    const userid = req.session.user_id
    const user = await User.findOne({_id:userid})
    if (!user) {
      
      return res.render('error-message', { message: 'User not found' });

    }
    const address = user.address.id(id);
    if (!address) {
      
      return res.render('error-message', { message: 'Address not found' });
    }
    res.render('edit-Address', { address });



  }catch(error){
    console.log(error.message);
  }
}
const updateAddress = async (req,res)=>{
  try {
    const id= req.params.id
    console.log(id);
    const userid = req.session.user_id
    const user = await User.findOne({_id:userid})
    const { name, mobile, landmark, city, state, pincode, district, address } = req.body;

    const addressToUpdate = user.address.id(id);
    if (!addressToUpdate) {
     
      return res.render('error-message', { message: 'Address not found' });
    }

    addressToUpdate.name = name;
    addressToUpdate.mobile = mobile;
    addressToUpdate.landmark = landmark;
    addressToUpdate.city = city;
    addressToUpdate.state = state;
    addressToUpdate.pincode = pincode;
    addressToUpdate.district = district;
    addressToUpdate.address = address;

    await user.save();
    res.redirect('/profile');
    
  } catch (error) {
    console.log(error.message);
  }
}

const deleteAddress = async(req,res)=>{
  const addressId = req.params.id;
  try {
    const userid = req.session.user_id
    const user = await User.findOne({_id:userid})
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
  }
  const addressIndex = user.address
  
  if (addressIndex === -1) {
    return res.status(404).json({ error: 'Address not found' });
}
if (user.selectedAddress && user.selectedAddress.toString() === addressId) {
  user.selectedAddress = null;
}

user.address.splice(addressIndex, 1);
await user.save();
res.redirect('/profile')


  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: 'An error occurred while deleting the address' });
    
  }
}

const postContact = async(req,res)=>{
  try {
    
    const { name, email, subject, message } = req.body; 
  
  const savedContact = await Contact.create({
    name,
    email,
    subject,
    message,
  });

res.render("contact",{message:"Message Sent SuccessFully"})
    
    
  } catch (error) {
    console.log(error.message);
  }
}

  
  module.exports ={
    loadAddress,
    addAddress,
    orderHistory,
    selectAddress,
    orderDetails,
    updatePassword,
    updatePasswordLoad,
    verifyOldPassword,
    LoadWallet,
    editAddress,
    updateAddress,
    deleteAddress,
    postContact
  
   
  }