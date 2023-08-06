const User=require("../models/userModel")
const Admin=require("../models/adminModel")
const bcrypt=require('bcrypt');
const Category=require('../models/catagoryModel')


// load the loginpage 
const loadLogin=async(req,res)=>{
    try{
        res.render('adminlogin',{layout:false})

    }
    catch(error){
        console.log(error.message);
    }
}

//load dashboard
const loadDashboard=async(req,res)=>{
    try{
    
        res.render('dashboard')
    }catch(error){
        console.log(error.message);
    }
}

//verify admin login
const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const adminData = await Admin.findOne({ email: email });
        if (adminData) {
            
            const passwordMatch = await bcrypt.compare(password, adminData.password);
                  
            if (passwordMatch) {
                req.session.admin_id = adminData._id;
                res.redirect('/admin/dashboard');
            } else {
                
                
                res.render("adminlogin",{layout:false,message:"error"});
            }
        } else {
           
            res.render("adminlogin",{layout:false,message:"error"});
        }
    } catch (error) {
        console.log(error.message);
    }
};

//logout
const logout=async(req,res)=>{
    try {
        req.session.admin_id=null
        res.redirect('/admin')
    } catch (error) {
        
    }
}

//lode userlist
 const userList=async(req,res)=>{
    try {
        res.render('user-list')
    } catch (error) {
        console.log(error.message);   
    }
 }

// get user and view in admin panel
 const userView=async(req,res)=>{
    try {
        
        const userData=await User.find({})
        
        
        res.render('user-list',{user:userData})
    } catch (error) {
        
    }
 }

// block the user
 const blockUser = async(req,res)=>{
    try {
      const id = req.query.id
      await User.findByIdAndUpdate({_id:id},{$set:{is_blocked:true}})
      res.redirect('/admin/userView')
    } catch (error) {
      console.log(error)
    }
  }
 
//unblock the user
  const unblockUser = async(req,res)=>{
    try {
      const id = req.query.id
      await User.findByIdAndUpdate({_id:id},{$set:{is_blocked:false}})
      res.redirect('/admin/userView')
    } catch (error) {
      console.log(error)
    }
  }
 


module.exports={
    loadLogin,
    verifyLogin,
    loadDashboard,
    logout,
    userList,
    userView,
    blockUser,
    unblockUser
}