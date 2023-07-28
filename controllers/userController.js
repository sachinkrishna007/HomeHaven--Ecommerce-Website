const User = require('../models/userModel')
const bcrypt = require('bcrypt')
require('dotenv').config();
const otpHelper = require("../Helper/otphelper");
const Product = require("../models/productModel")
const path = require('path');
const { error } = require('console');

const accountSid = "ACed90d087c6b517767eb6dd3faa7ab484";
const authToken = "30cb029b74a7a96ee6419c1d038aa328";
const verifySid = "VAaca0ce8735bf40622afbe6155952c423";
const client = require("twilio")(accountSid, authToken);

//bcrypt
const securePassword = async (password) => {
    try {

        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
    } catch (error) {
        console.log(error.message);
    }
}

//load the homepage
const loadhome = async (req, res) => {
    try {
        res.render('home', { user: res.locals.user })
    } catch (error) {
        console.log(error.message);
    }
}

//load the loginpage
const loadlogin = async (req, res) => {
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message);
    }
}

//load registration page
const loadRegister = async (req, res) => {
    try {
        res.render('registration')
    } catch (error) {
        console.log(error.message);
    }
}
//signup validation
const validation = async (req, res) => {
    const email = req.body.email;
    const mobileNumber = req.body.mobile
    const existingUser = await User.findOne({ email: email })
    if (!req.body.name || req.body.name.trim().length === 0) {
        return res.render("registration", { message: "Name is required" });
    }
    if (/\d/.test(req.body.name) || /\d/.test(req.body.name)) {
        return res.render("registration", { message: "Numbers not allowed in nam" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.render("registration", { message: "Email Not Valid" });
    }
    if (existingUser) {
        return res.render("registration", { message: "Email already exists" })
    }
    const mobileNumberRegex = /^\d{10}$/;
    if (!mobileNumberRegex.test(mobileNumber)) {
        return res.render("registration", { message: "Mobile Number should be 10 digit" });

    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(req.body.password)) {
        return res.render("registration", { message: "Password Should Contain atleast 8 characters,one number and a special character" });
    }


    client.verify.v2
        .services(verifySid)
        .verifications.create({ to: `+91${mobileNumber}`, channel: "sms", })
        .then((verification) => {
            console.log(verification.status)
            req.session.userData = req.body;
            res.render('verifyOtp')
        })
        .catch((error) => {
            console.log(error.message)
        })
    

}
//verify oto and add user in signup
const verifyOtp = async (req, res) => {
    const { otp } = req.body;
    try {
        const userData = req.session.userData;

        if (!userData) {
            res.render('verifyOtp', { message: 'Invalid Session' });
        } else {
            client.verify.v2
                .services(verifySid)
                .verificationChecks.create({ to: `+91${userData.mobile}`, code: otp })
                .then(async (verification_check) => { // Mark the callback function as async
                    console.log(verification_check.status);
                    const spassword = await securePassword(userData.password);
                    const user = new User({
                        name: userData.name,
                        email: userData.email,
                        mobile: userData.mobile,
                        password: spassword,
                        is_admin: 0
                    });
                    try {
                        const userDataSave = await user.save();
                        if (userDataSave) {
                            res.redirect('/');
                        } else {
                            res.render('registration', { message: "Registration Failed" });
                        }
                    } catch (error) {
                        console.log(error.message);
                        res.render('registration', { message: "Registration Failed" });
                    }
                }).catch((error) => {
                    console.log(error.message);
                });
        }
    } catch (error) {
        console.log(error.message);
    }
};


//verifylogin normal

const verifyLogin = async (req, res) => {

    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email })

        if (userData) {

            if (userData.is_blocked) {
                res.render('login', { message: "Your account is blocked. Please contact support." });
                return;
            }

            const passwordMatch = await bcrypt.compare(password, userData.password)
            if (passwordMatch) {
                req.session.user_id = userData._id;
                req.session.user = await User.findOne({ _id: req.session.user_id });
                console.log(req.session.user_id)
                console.log("sucessfully signed in")
                res.redirect('/')
            } else {
                res.render('login', { message: "password incorrect" })
            }

        } else {
            res.render('login', { message: "Email Incorrect " })
        }
    } catch (error) {
        console.log(error.message)
    }
}


// verify the mobile number in otp login
const verifynumber = async (req, res) => {
    try {
        const mobileNumber = req.body.mobile
        const userData = await User.findOne({ mobile: mobileNumber })
        if (userData) {
            const otp = otpHelper.generateOtp()
            const oyy = otpHelper.sendOtp(mobileNumber, otp)
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
    } catch (error) {
        console.log(error.message);
    }
}

const verifyOtpLogin = async (req, res) => {
    const otp = req.body.otp

    try {

        const sessionOTP = req.session.otp;
        const userData = req.session.userData;

        if (!sessionOTP || !userData) {
            res.render('loginotp', { message: 'Invalid Session' });
        } else if (sessionOTP !== otp) {
            res.render('loginotp', { message: 'Invalid OTP' });
        } else {

            req.session.user_id = userData;
            console.log("sucess signed in using otp");
            res.redirect('/')
        }

    } catch (error) {
        console.log(error.message);

    }
}


const logout = async (req, res) => {
    try {

        req.session.destroy()
        res.redirect('/')
    }
    catch (error) {
        console.log(error.message);

    }
}


const listProduct = async (req, res) => {
    try {
        const productData = await Product.find({})

        res.render('products', { productData })
    } catch (error) {
        error.message
    }
}

const productDetail = async (req, res) => {
    try {
        const ProductId = req.params.id;
        const product = await Product.findById(ProductId)

        if (!product) {
            return res.status(404).send('product not found')
        }

        res.render('detailproduct', { product })


    } catch (error) {
        console.log(error.message);

    }
}


const errorpage = async (req, res) => {
    try {
        res.render('error-page')
    } catch (error) {
        console.log(error);
    }
}
const blockpage = async (req, res) => {
    try {
        res.render('block')
    } catch (error) {
        console.log(error);
    }
}

const loadProfile = async(req,res) =>{
    try{
        const user = req.session.user;
       
        res.render('user-profile',{user})
    }catch(error){
      
        console.log(error.message);
    }
}

const emptyCart = async(req,res) =>{
    try{
       
       
        res.render('empty-cart')
    }catch(error){
      
        console.log(error.message);
    }
}


module.exports = {
    loadhome,
    loadlogin,
    loadRegister,
    verifyOtp,
    validation,
    verifyLogin,
    verifynumber,
    verifyOtpLogin,
    logout,
    listProduct,
    productDetail,
    errorpage,
    loadProfile,
    blockpage,
    

}