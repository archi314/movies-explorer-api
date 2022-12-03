const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 100,
  message: 'Вы можете отправлять не более 100 запросов за 2 минуты',
  headers: true,
});

module.exports = rateLimiter;
