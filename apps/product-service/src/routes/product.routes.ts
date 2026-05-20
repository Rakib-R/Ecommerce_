import express, { Router } from 'express';
import {
  createDiscountCodes,
  createProduct,
  deleteDiscountCode,
  deleteProduct,
  deleteProductImage,
  getAllProducts,
  getCategories,
  getDiscountCodes,
  getEffectivePrice,

  // getFilteredEvents,
  getFilteredOffer,
  getFilteredProducts,
  getFilteredShops,
  getProductDetails,
  getShopProducts,
  getTopShops,
  restoreProduct,
  searchProducts,
  uploadProductImage,
  uploadSellerImage,
  uploadShopImage,
} from '../controllers/product.controller';
// import { isAuthenticated } from "@packages/middleware";

const router: Router = express.Router();

router.get('/get-categories', getCategories);

router.post('/create-discount-code', createDiscountCodes);

// router.get("/get-discount-codes", isAuthenticated, getDiscountCodes);
router.get('/get-discount-codes', getDiscountCodes);

// router.post("/delete-discount-code/:id", isAuthenticated, deleteDiscountCode);
router.post('/delete-discount-code/:id', deleteDiscountCode);

// router.post("/upload-product-image", isAuthenticated, uploadProductImage);
router.post('/upload-product-image', uploadProductImage);

router.post('/upload-seller-image', uploadSellerImage);

router.post('/upload-shop-image', uploadShopImage);

router.delete('/delete-product-image', deleteProductImage);

router.post('/create-product', createProduct);

router.get('/get-shop-products', getShopProducts);

router.delete('/delete-product/:productId', deleteProduct);

router.put('/restore-product/:productId', restoreProduct);

router.get('/get-all-products', getAllProducts);

router.get('/get-product/:slug', getProductDetails);

router.get('/get-filtered-products', getFilteredProducts);

router.get('/get-filtered-offers', getFilteredOffer);

router.get('/get-filtered-shops', getFilteredShops);

router.get('/search-products', searchProducts);

router.get('/top-shops', getTopShops);

router.get('/getEffectivePrice/:productId', getEffectivePrice);

export default router;
