const User = require("../models/userModel")
const Admin = require("../models/adminModel")
const Product = require('../models/productModel')
const Category = require('../models/catagoryModel')
const Order = require('../models/orderModel')
const path = require('path')


const multer = require('multer')


const addBanner = async(req,res)=>{
    try {
        res.render('add-banner')
    }
    catch (error) {
        console.log(error.message)
    }
}



module.exports={
    addBanner
}