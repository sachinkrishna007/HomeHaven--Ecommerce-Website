
const User = require('../models/userModel')
const Cart = require('../models/cart')
const sessionCheck = (req, res, next) => {
  const isAuthenticated = req.session.user_id ? true : false;
  res.locals.isAuthenticated = isAuthenticated;
  res.locals.userName = req.session.name;
next();
}



const isloggedIn = (req, res, next) => {
  if (req.session.user_id) {
      res.redirect("/")
  }else{
      next();
  }
}
const isloggedout = (req,res,next) =>{
  if(req.session.user_id){
    next()
  }else{
    res.redirect('/login')
  }
}



// Middleware function to check if the user is blocked
const checkBlockedUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.user_id);
     
    if (!user) {
      return next();
    }
    if ( user.is_blocked) {
      return res.redirect('/block');
    }

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const checkoutMiddleware = async (req, res, next) => {
  try {
    const user = req.session.user_id;

    if (user) {
      const userId = req.session.user_id;
      

      const cart = await Cart.findOne({ user: userId });
      

      if (!cart || cart.cartItems.length === 0) {
      
        return res.render('error-message',{message:"NO ITEMS IN CART"});
      }
    }

    next();
  } catch (error) {
    console.log(error.message);
    next(error); // Pass the error to the error handling middleware
  }
};


const restrict = async (req,res,next)=>{
  // req.session.previousUrl = '/'
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');

  
}

module.exports={sessionCheck,isloggedIn,checkBlockedUser,isloggedout,checkoutMiddleware,restrict}