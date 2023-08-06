
const User = require('../models/userModel')
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

module.exports={sessionCheck,isloggedIn,checkBlockedUser}