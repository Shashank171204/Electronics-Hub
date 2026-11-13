import { auth, requireAdmin } from "../middleware/auth.js";
import { validateProduct, validateId, validateSearch } from "../middleware/validate.js";
import { showProducts, searchProducts, deleteProduct, updateProduct, createproduct } from "../controllers/productController.js";
import express from "express";
const router = express.Router();
router.get("/showproducts", validateSearch, showProducts);
router.get("/search", validateSearch, searchProducts);
router.delete("/deleteproduct/:id", auth, requireAdmin, validateId, deleteProduct)
router.patch("/updateproduct/:id", auth, requireAdmin, validateId, validateProduct(true), updateProduct)
router.post("/createproduct", auth, requireAdmin, validateProduct(), createproduct)
export default router;
