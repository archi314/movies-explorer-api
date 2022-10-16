const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

require('dotenv').config();

const { NODE_ENV, JWT_SECRET } = process.env;

const ErrorBadRequest = require('../errors/ErrorBadRequest'); /** Ошбика 400. */
const ErrorNotFound = require('../errors/ErrorNotFound'); /** Ошибка 404. */
const ErrorServer = require('../errors/ErrorServer'); /** Ошибка 500. */
const ErrorConflict = require('../errors/ErrorConflict'); /** Ошибка 409. */
const ErrorUnauthorized = require('../errors/ErrorUnauthorized'); /** Ошибка 401. */

const createUser = async (req, res, next) => {
  const {
    name,
    email,
    password,
  } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    return res.send(user);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return next(new ErrorBadRequest('Переданы невалидные данные'));
    }
    if (err.code === 11000) {
      return next(new ErrorConflict('Пользователь с указанным email не найден'));
    }
    return next(new ErrorServer('Ошибка на сервере'));
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorNotFound('Указанный пользователь не найден'));
    }
    return res.send(user);
  } catch (err) {
    return next(new ErrorServer('Ошибка на сервере'));
  }
};

const updateUserProfile = async (req, res, next) => {
  const { name, email } = req.body;
  const owner = req.user._id;
  try {
    const user = await User.findByIdAndUpdate(
      owner,
      { name, email },
      { new: true, runValidators: true },
    );
    if (!user) {
      return next(new ErrorNotFound('Указанный пользователь не найден'));
    }
    return res.send(user);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return next(new ErrorBadRequest('Переданы невалидные данные'));
    }
    return next(new ErrorServer('Ошибка на сервере'));
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new ErrorUnauthorized('Неверно введена почта или пароль'));
    }
    const userValid = await bcrypt.compare(password, user.password);
    if (!userValid) {
      return next(new ErrorUnauthorized('Неверно введена почта или пароль'));
    }

    const token = jwt.sign({
      _id: user._id,
    }, NODE_ENV === 'production' ? JWT_SECRET : 'SECRET');
    res.cookie('jwt', token, {
      maxAge: 3600000,
      domain: 'artemst.nomoredomains.icu',
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
    return res.status(200).send(user.toJSON());
  } catch (err) {
    return next(new ErrorServer('Ошибка на сервере'));
  }
};

const signout = (req, res, next) => {
  try {
    res.clearCookie('jwt');
    return res.status(200).send({ message: 'Выполнен выход' });
  } catch (err) {
    return next(new ErrorServer('Ошибка на сервере'));
  }
};

module.exports = {
  createUser,
  getUserProfile,
  updateUserProfile,
  login,
  signout,
};
