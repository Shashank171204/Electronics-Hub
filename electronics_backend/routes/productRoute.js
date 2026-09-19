import { showProducts, searchProducts, deleteProduct, updateProduct, createproduct } from "../controllers/productController.js";
import express from "express";
const router = express.Router();
router.get("/showproducts", showProducts);
router.get("/search", searchProducts);
router.delete("/deleteproduct/:id",deleteProduct)
router.patch("/updateproduct/:id",updateProduct)
router.post("/createproduct",createproduct)
export default router;
