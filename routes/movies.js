const express = require('express');

const moviesRoutes = require('express').Router();
const { validateCreateMovie, validateDeleteMovie } = require('../middlewares/validation');

const {
  getMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/moviesController');

moviesRoutes.use(express.json());
moviesRoutes.get('/api/movies', getMovies);
moviesRoutes.post('/api/movies', validateCreateMovie, createMovie);
moviesRoutes.delete('/api/movies/:movieId', validateDeleteMovie, deleteMovie);

module.exports = moviesRoutes;
