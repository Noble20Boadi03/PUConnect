import express from 'express';
import {
  getCategories,
  getCategoryById,
  getCategoryServices,
  getExploreProviders,
  searchProviders,
  getPopularServices,
} from '../controllers/exploreController';

const router = express.Router();

// Public routes
router.get('/categories', getCategories);
router.get('/categories/popular-services', getPopularServices);
router.get('/categories/:id', getCategoryById);
router.get('/category-services', getCategoryServices);
router.get('/providers', getExploreProviders);
router.get('/search', searchProviders);

export default router;
