import express from 'express';
import {
  getCategories,
  getCategoryById,
  getCategoryServices,
  getExploreProviders,
} from '../controllers/exploreController';

const router = express.Router();

// Public routes
router.get('/categories', getCategories);
router.get('/categories/:id', getCategoryById);
router.get('/category-services', getCategoryServices);
router.get('/providers', getExploreProviders);

export default router;
