const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: 'Вы можете отправлять не более 100 запросов в час',
  headers: true,
});

module.exports = rateLimiter;
