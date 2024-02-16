const wishList = require('../models/wishlistModel')
const wishListHelper = require('../Helper/wishlistHelper')

const loadWishlist = async(req,res)=>{
    let user = req.session.user_id
    const wishlistCount = await wishListHelper.WishListCount(user);
    wishListHelper.WishListProducts(user).then((wishlistProducts) => {
        
 
        res.render("wishlist", {
          user,
          wishlistProducts,   
          wishlistCount,
        });   
      });
}
const addWishList = async (req, res) => {

    let proId = req.body.proId;
    let userId = req.session.user_id;
  
    wishListHelper.addWishList(userId, proId).then((response) => {
    res.send(response);
    });
  }

  
  const removeProductWishlist = async (req, res) => {
    

    const userId=req.session.user_id

    const proId = req.body.proId;

    wishListHelper
      .removeProductWishlist(proId, userId)
      .then((response) => {
        res.send(response);
      });
  }  


module.exports={
    loadWishlist,
    addWishList,
    removeProductWishlist
}