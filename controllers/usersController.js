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

const {
  BAD_REQUEST_ERR_TEXT,
  NOT_FOUND_USER_ERR_TEXT,
  SERVER_ERR_TEXT,
  NOT_FOUND_USER_EMAIL_ERR_TEXT,
  UNAUTHORIZED_ERR_TEXT,
  USER_SIGNOUT_SUCCESS_TEXT,
} = require('../utils/constants');

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
      return next(new ErrorBadRequest(BAD_REQUEST_ERR_TEXT));
    }
    if (err.code === 11000) {
      return next(new ErrorConflict(NOT_FOUND_USER_EMAIL_ERR_TEXT));
    }
    return next(new ErrorServer(SERVER_ERR_TEXT));
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorNotFound(NOT_FOUND_USER_ERR_TEXT));
    }
    return res.send(user);
  } catch (err) {
    return next(new ErrorServer(SERVER_ERR_TEXT));
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
      return next(new ErrorNotFound(NOT_FOUND_USER_ERR_TEXT));
    }
    return res.send(user);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return next(new ErrorBadRequest(BAD_REQUEST_ERR_TEXT));
    }
    if (err.code === 11000) {
      return next(new ErrorConflict(NOT_FOUND_USER_EMAIL_ERR_TEXT));
    }
    return next(new ErrorServer(SERVER_ERR_TEXT));
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new ErrorUnauthorized(UNAUTHORIZED_ERR_TEXT));
    }
    const userValid = await bcrypt.compare(password, user.password);
    if (!userValid) {
      return next(new ErrorUnauthorized(UNAUTHORIZED_ERR_TEXT));
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
    return res.status(200).send(user);
  } catch (err) {
    return next(new ErrorServer(SERVER_ERR_TEXT));
  }
};

const signout = (req, res, next) => {
  try {
    res.clearCookie('jwt');
    return res.status(200).send({ message: USER_SIGNOUT_SUCCESS_TEXT });
  } catch (err) {
    return next(new ErrorServer(SERVER_ERR_TEXT));
  }
};

module.exports = {
  createUser,
  getUserProfile,
  updateUserProfile,
  login,
  signout,
};
