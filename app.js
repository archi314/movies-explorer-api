require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const { errors } = require('celebrate');

const router = require('./routes/index');
const errorServer = require('./middlewares/errors');

const { requestLogger, errorLogger } = require('./middlewares/logger');
const rateLimiter = require('./middlewares/rateLimiter');

const { PORT = 3000 } = process.env; // было 4000

const { NODE_ENV, MONGO_DB } = process.env;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());

app.use(
  cors({
    origin: ['https://artemst.nomoredomains.icu/api'], // было 3000
    credentials: true,
  }),
);

app.use(cookieParser());

app.use(requestLogger);
app.use(helmet());
app.use(rateLimiter);

app.use('/', router);

app.use(errorLogger);
app.use(errors());

app.use(errorServer);

async function main() {
  try {
    await mongoose.connect(NODE_ENV === 'production' ? MONGO_DB : 'mongodb://localhost:27017/moviesdb', {
      useNewUrlParser: true,
      useUnifiedTopology: false,
    });
    await app.listen(PORT);
    console.log(`Сервер запущен на ${PORT} порту`);
  } catch (err) {
    console.log(err);
  }
}

main();
