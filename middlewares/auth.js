

const sessionCheck = (req, res, next) => {
  const isAuthenticated = req.session.user_id ? true : false;
  res.locals.isAuthenticated = isAuthenticated;
  // res.locals.userName = req.session.userName;
next();
}

module.exports={sessionCheck}