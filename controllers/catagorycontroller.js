
const User=require("../models/userModel")
const Admin=require("../models/adminModel")
const Product=require('../models/productModel')
const Category=require('../models/catagoryModel')


//  function to create a new category
const createCategory = async (req, res) => {
    try {
      const { name } = req.body;
      const newCategory = new Category({
        name,
      });
      await newCategory.save();
      res.redirect('/admin/loadcategory');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };
  
const loadCategory=async(req,res)=>{
    try {
      const categoriesData = await Category.find({});
        res.render('catagory',{categoriesData})
    } catch (error) {
        console.log(error.message);
    }
}
module.exports = {
  createCategory,
  loadCategory
};
