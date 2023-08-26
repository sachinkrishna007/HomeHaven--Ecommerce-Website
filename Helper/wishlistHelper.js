const wishList = require('../models/wishlistModel')
const{ObjectId} = require('mongodb')
const mongoose = require('mongoose');




const WishListCount = async (userId) => {
    try {
      const userWishlist = await wishList.findOne({ user: userId });
      let count = 0;
  
      if (userWishlist) {
        count = userWishlist.length;
      }
  
      return count;
    } catch (error) {
      console.log(error.message);
    }
  }


  const WishListProducts = async (userId) => {
    try {
      return new Promise((resolve, reject) => {
        wishList.aggregate([
          {
            $match: {
              user:  new mongoose.Types.ObjectId(userId),
            },
          },
          {
            $unwind: "$wishList",
          },
          {
            $project: {
              productId: "$wishList.productId",
              createdAt: "$wishList.createdAt",
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "productId",
              foreignField: "_id",
              as: "wishListed",
            },
          },
          {
            $project: {
              productId: 1,
              createdAt: 1,
              wishListed: { $arrayElemAt: ["$wishListed", 0] },
            },
          },
        ]).then((wishListed) => {
            console.log(wishListed);
          resolve(wishListed);
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  const addWishList = async (userId, proId) => {
    try {
      const userWishList = await wishList.findOne({ user: new ObjectId(userId) });
  
      if (userWishList) {
        const productExist = userWishList.wishList.findIndex(wishList => wishList.productId == proId);
  
        if (productExist !== -1) {
          
          return { status: false };
        } else {
          await wishList.updateOne(
            { user: new ObjectId(userId) },
            {
              $push: {
                wishList: { productId: new ObjectId(proId) },
              },
            }
          );
          return { status: true };
        }
      } else {
        const wishListData = {
          user: new ObjectId(userId),
          wishList: [{ productId: new ObjectId(proId) }],
        };
        const newWishList = new wishList(wishListData);
        await newWishList.save();
        return { status: true };
      }
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  };
  const removeProductWishlist = async (proId, userId) => {
    try {
      const response = await wishList.updateOne(
        { user: userId },
        {
          $pull: { wishList: { productId: proId } },
        }
      );
      console.log(response);
      return response;
    } catch (error) {
      console.log(error.message);
    }
  };


  

  module.exports={
    WishListCount,
    WishListProducts,
    addWishList,
    removeProductWishlist
  }