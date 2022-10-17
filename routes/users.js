const express = require('express');

const userRoutes = require('express').Router();
const { validateUpdateUserProfile } = require('../middlewares/validation');

const {
  getUserProfile,
  updateUserProfile,
} = require('../controllers/usersController');

userRoutes.use(express.json());

userRoutes.get('/api/users/me', getUserProfile);
userRoutes.patch('/api/users/me', validateUpdateUserProfile, updateUserProfile);

module.exports = userRoutes;
