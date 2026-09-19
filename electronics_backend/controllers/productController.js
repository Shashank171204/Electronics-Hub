import productModel from "../models/productModel.js";

const showProducts = async (req, res) => {
  try {
    const { q, search } = req.query;
    const searchTerm = (q || search || "").trim();
    let query = {};
    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i");
      query = {
        $or: [{ name: regex }, { desc: regex }],
      };
    }
    const products = await productModel.find(query);
    res.status(200).json(products);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const searchProducts = async (req, res) => {
  try {
    const { q, search } = req.query;
    const searchTerm = (q || search || "").trim();
    let query = {};
    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i");
      query = {
        $or: [{ name: regex }, { desc: regex }],
      };
    }
    const products = await productModel.find(query);
    res.status(200).json(products);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await productModel.findByIdAndDelete(id);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
  }
};

const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;
    const result = await productModel.findByIdAndUpdate(id, body);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
  }
};
const createproduct = async(req,res) => {
  try{
    const body=req.body;
    const result =await productModel.create(body);
    res.status(200).json(result)

  }
  catch(err){
    console.log(err);
  }
};

export { showProducts, searchProducts, deleteProduct, updateProduct, createproduct };
