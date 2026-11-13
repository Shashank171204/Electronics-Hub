import productModel from "../models/productModel.js";

const showProducts = async (req, res, next) => {
  try {
    const { q, search } = req.query;
    const searchTerm = (q || search || "").trim();
    let query = {};
    if (searchTerm) {
      const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query = {
        $or: [{ name: regex }, { desc: regex }],
      };
    }
    const products = await productModel.find(query);
    res.status(200).json(products);
  } catch (err) {
    next(err);
  }
};

const searchProducts = async (req, res, next) => {
  try {
    const { q, search } = req.query;
    const searchTerm = (q || search || "").trim();
    let query = {};
    if (searchTerm) {
      const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query = {
        $or: [{ name: regex }, { desc: regex }],
      };
    }
    const products = await productModel.find(query);
    res.status(200).json(products);
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await productModel.findByIdAndDelete(id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    const body = req.body;
    const result = await productModel.findByIdAndUpdate(id, { $set: body }, { runValidators: true });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
const createproduct = async(req,res,next) => {
  try{
    const body=req.body;
    const result =await productModel.create(body);
    res.status(200).json(result)

  }
  catch(err){
    next(err);
  }
};

export { showProducts, searchProducts, deleteProduct, updateProduct, createproduct };
