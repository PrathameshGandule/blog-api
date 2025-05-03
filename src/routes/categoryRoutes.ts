import { Router } from "express"
const router = Router();

import { 
	addCategory,
	updateCategory,
	getCategories
} from "../controllers/categoryController.js";

router.post('/', addCategory);
router.put('/:id', updateCategory);
router.get('/', getCategories);

export default router;