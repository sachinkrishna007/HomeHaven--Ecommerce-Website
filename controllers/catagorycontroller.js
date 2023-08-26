
const User=require("../models/userModel")
const Admin=require("../models/adminModel")
const Product=require('../models/productModel')
const Category=require('../models/catagoryModel')



const createCategory = async (req, res) => {
  try {
      const { name } = req.body;

      
      const existingCategory = await Category.findOne({ name });
      

      if (existingCategory) {
          return res.render('display-error', { layouts:false,message: "Category already added" });
      }

     
      const newCategory = new Category({
          name,
      });

      await newCategory.save();
      res.redirect('/admin/loadcategory');
  } catch (error) {
      console.error(error);
      return res.render('display-error', { message: "An error occurred" });
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
const editCategory=async(req,res)=>{
    try {
      const id = req.params.id
      const categoriesData = await Category.findById({_id:id});
        res.render('edit-category',{categoriesData})
    } catch (error) {
        console.log(error.message);
    }
}

const updateCategory = async (req, res) => {
  try {
    const id = req.params.id;
   
    const name= req.body.updatedname;
 
  

    const updatedCategory = await Category.findByIdAndUpdate(
      {_id:id},
      { $set: { name: name } },
     
    );
   
    if (!updatedCategory) {
      
      return res.status(404).json({ message: "Category not found" });
    }

    res.redirect('/admin/loadCategory');
  } catch (error) {
    console.log(error.message);
  }
};


const deleteCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { editCategory, updateCategory, deleteCategory };

module.exports = {
  createCategory,
  loadCategory,
  editCategory,
  updateCategory,deleteCategory
};
