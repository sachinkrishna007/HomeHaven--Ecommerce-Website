const User=require('../models/userModel')
const bcrypt=require('bcrypt')
require('dotenv').config();
const otpHelper = require("../Helper/otphelper");
const Product=require("../models/productModel")
const path = require('path')

//bcrypt
const securePassword = async(password)=>{
    try {
        
        const passwordHash =await bcrypt.hash(password,10)
        return passwordHash
    } catch (error) {
        console.log(error.message);
    }
}

//load the homepage
const loadhome=async(req,res)=>{
    try{
        res.render('home',{user:res.locals.user})
    }catch(error){
        console.log(error.message);
    }
}

//load the loginpage
const loadlogin=async(req,res)=>{
    try{
        res.render('login')
    }catch(error){
        console.log(error.message);
    }
}

//load registration page
const loadRegister=async(req,res)=>{
    try{
        res.render('registration')
    }catch(error){
        console.log(error.message);
    }
}
//signup validation
const validation = async(req,res)=>{
    const email = req.body.email;
    const mobileNumber = req.body.mobile
    const existingUser = await User.findOne({email:email})
    if (!req.body.name || req.body.name.trim().length === 0) {
        return res.render("registration", { message: "Name is required" });
    }
    if (/\d/.test(req.body.name) || /\d/.test(req.body.name)) {
        return res.render("registration", { message: "Numbers not allowed in nam" });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)){
        return res.render("registration", { message: "Email Not Valid" });
    }
    if(existingUser){
      return res.render("registration",{message:"Email already exists"})
    }
    const mobileNumberRegex = /^\d{10}$/;
    if (!mobileNumberRegex.test(mobileNumber)) {
        return res.render("registration", { message: "Mobile Number should be 10 digit" });

    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if(!passwordRegex.test(req.body.password)){
        return res.render("registration", { message: "Password Should Contain atleast 8 characters,one number and a special character" });
    }
    // console.log(req.body.password)
    // console.log(req.body.confirmpassword)


    // if(req.body.password!=req.body.confirmPassword){
    //     return res.render("registration", { message: "Password and Confirm Password must be same" });
    // }

    const otp = otpHelper.generateOtp()
    // const oyy= otpHelper.sendOtp(mobileNumber,otp)
      console.log(`Otp is ${otp}`)
    try {
        req.session.otp = otp;
        req.session.userData = req.body;
        req.session.mobile = mobileNumber 
        res.render('verifyOtp')     
    } catch (error) {
        console.log(error.message); 
    }

}
//verify oto and add user in signup
    const verifyOtp =async(req,res)=>{
        const otp = req.body.otp
        try {
        const sessionOTP = req.session.otp;
        const userData = req.session.userData;
    
        if (!sessionOTP || !userData) {
            res.render('verifyOtp',{ message: 'Invalid Session' });
        }else if (sessionOTP !== otp) {
            res.render('verifyOtp',{ message: 'Invalid OTP' });
        }else{
        const spassword =await securePassword(userData.password)
            const user = new User({
                name:userData.name,
                email:userData.email,
                mobile:userData.mobile,
                password:spassword,
                is_admin:0
            })
            const userDataSave = await user.save()
            if(userDataSave){
                
                res.redirect('/')
            }else{
                res.render('registration',{message:"Registration Failed"})
            }
        }
    
    
        } catch (error) {
            console.log(error.message);     
        }
    }

//verifylogin normal

const verifyLogin =async(req,res)=>{
    try{
    const email=req.body.email;
    const password=req.body.password;
    const userData= await User.findOne({email:email})

    if(userData){
        const passwordMatch= await bcrypt.compare(password,userData.password)
        if(passwordMatch){
            req.session.user_id=userData._id;
            console.log(req.session.user_id)
            console.log("sucessfully signed in")
            res.redirect('/')
        }else{
            res.render('login',{message:"password incorrect"})
        }
        
    }else{
        res.render('login',{message:"Email Incorrect "})
    }
}catch(error){
    console.log(error.message)
}
}


// verify the mobile number in otp login
const verifynumber=async(req,res)=>{
    try{
        const mobileNumber=req.body.mobile
        const userData=await User.findOne({mobile:mobileNumber})
        if(userData){
            const otp = otpHelper.generateOtp()
            // const oyy= otpHelper.sendOtp(mobileNumber,otp)
              console.log(`Otp is ${otp}`)
            try {
                req.session.otp = otp;
                req.session.userData = req.body;
                req.session.mobile = mobileNumber 
                res.render('loginotp')     
            } catch (error) {
                console.log(error.message); 
            }


        }
    }catch(error){
        console.log(error.message);
    }
}

const verifyOtpLogin=async(req,res)=>{
    const otp=req.body.otp
    
    try{
        
        const sessionOTP=req.session.otp;
        const userData=req.session.userData;
        
        if (!sessionOTP || !userData) {
            res.render('loginotp',{ message: 'Invalid Session' });
        }else if (sessionOTP !== otp) {
            res.render('loginotp',{ message: 'Invalid OTP' });
        }else{

            req.session.user_id=userData;
            console.log("sucess signed in using otp");
            res.redirect('/')
        }
        
    }catch(error){
        console.log(error.message);

    }
}


const logout = async(req,res)=>{
    try{

        req.session.destroy()
        res.redirect('/')
    }
    catch(error){
        console.log(error.message);

    }
   }


const listProduct = async(req,res)=>{
    try {
        const productData = await Product.find({})
        console.log(productData);
        res.render('products',{productData})
    } catch (error) {
        error.message
    }
}




module.exports={
    loadhome,
    loadlogin,
    loadRegister,
    verifyOtp,
    validation,
    verifyLogin,
    verifynumber,
    verifyOtpLogin,
    logout,
    listProduct

}