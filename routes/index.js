const router = require('express').Router();

const auth = require('../middlewares/auth');
const ErrorNotFound = require('../errors/ErrorNotFound'); /** Ошибка 404. */

const {
  login,
  createUser,
  signout,
} = require('../controllers/usersController');

const { validateSignup, validateLogin } = require('../middlewares/validation');

router.get('/api/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

router.post('/api/signup', validateSignup, createUser);
router.post('/api/signin', validateLogin, login);

router.use(auth);

router.get('/signout', signout);
router.use(require('./users'));
router.use(require('./movies'));

router.use('*', (req, res, next) => {
  next(new ErrorNotFound('Страница не найдена'));
});

module.exports = router;
