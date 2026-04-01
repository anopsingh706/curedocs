import asyncHandler from 'express-async-handler';
import slugify from 'slugify';
import Category from '../models/Category.js';

// @route GET /api/categories
export const getCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find().sort({ isDefault: -1, name: 1 });
  res.json(categories);
});

// @route POST /api/categories  [admin]
export const createCategory = asyncHandler(async (req, res) => {
  const { name, color, icon } = req.body;
  if (!name) { res.status(400); throw new Error('Category name required'); }

  const slug = slugify(name, { lower: true, strict: true });
  const category = await Category.create({ name, slug, color, icon, createdBy: req.user._id });
  res.status(201).json(category);
});

// @route PUT /api/categories/:id  [admin]
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) { res.status(404); throw new Error('Category not found'); }

  const { name, color, icon } = req.body;
  if (name) { category.name = name; category.slug = slugify(name, { lower: true, strict: true }); }
  if (color) category.color = color;
  if (icon)  category.icon  = icon;

  const updated = await category.save();
  res.json(updated);
});

// @route DELETE /api/categories/:id  [admin]
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) { res.status(404); throw new Error('Category not found'); }
  if (category.isDefault) { res.status(400); throw new Error('Cannot delete a default category'); }

  await category.deleteOne();
  res.json({ message: 'Category deleted' });
});
