const Movie = require('../models/movie');

const ErrorBadRequest = require('../errors/ErrorBadRequest'); /** Ошбика 400. */
const ErrorNotFound = require('../errors/ErrorNotFound'); /** Ошибка 404. */
const ErrorServer = require('../errors/ErrorServer'); /** Ошибка 500. */
const ErrorForbidden = require('../errors/ErrorForbidden'); /** Ошибка 403. */

const getMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find({});
    return res.send(movies.reverse());
  } catch (err) {
    return next(new ErrorServer('Ошибка на сервере'));
  }
};

const createMovie = async (req, res, next) => {
  const owner = req.user._id;
  const {
    country, director, duration, year, description,
    image, trailerLink, thumbnail, movieId, nameRU, nameEN,
  } = req.body;
  try {
    const movie = await Movie.create({
      country,
      director,
      duration,
      year,
      description,
      image,
      trailerLink,
      thumbnail,
      movieId,
      nameRU,
      nameEN,
      owner,
    });
    return res.send(movie);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return next(new ErrorBadRequest('Переданные данные невалидны'));
    }
    return next(new ErrorServer('Ошибка на сервере'));
  }
};

const deleteMovie = async (req, res, next) => {
  const owner = req.user._id;
  const { movieId } = req.params;
  try {
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return next(new ErrorNotFound('Указанный фильм не найден'));
    }
    if (owner !== movie.owner.toString()) {
      return next(new ErrorForbidden('Вы не можете удалить чужой фильм'));
    }
    await Movie.findByIdAndRemove(movieId);
    return res.send({ message: 'Указанный фильм удален' });
  } catch (err) {
    if (err.name === 'CastError') {
      return next(new ErrorBadRequest('Переданы невалидные данные для удаления фильма'));
    }
    return next(new ErrorServer('Ошибка на сервере'));
  }
};

module.exports = {
  getMovies,
  createMovie,
  deleteMovie,
};
