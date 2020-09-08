require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const { celebrate, Joi } = require('celebrate');
const routerCards = require('./routes/cards');
const routerUsers = require('./routes/users');
const { login, createUser } = require('./controllers/users');
const config = require('./config.js');
const auth = require('./middlewares/auth');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { validatorUrl } = require('./validators/validator-url');
const { validatorEmail } = require('./validators/validator-email');

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(helmet());
app.use(limiter);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

mongoose.connect(config.DATABASE_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(requestLogger);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().custom(validatorEmail).trim(),
    password: Joi.string().required().min(8).trim(),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().custom(validatorEmail).trim(),
    password: Joi.string().required().min(8).trim(),
    name: Joi.string().required().min(2).max(30)
      .trim()
      .messages({
        'any.required': '*name*: Обязательное поле',
      }),
    about: Joi.string().required().min(2).max(30)
      .trim(),
    avatar: Joi.string().required().custom(validatorUrl).trim(),
  }),
}), createUser);

app.use(auth);
app.use('/cards', routerCards);
app.use('/users', routerUsers);

app.use(errorLogger);
app.use(errors());

app.use((err, req, res, next) => {
  const { statusCode = 500, message: errMessage } = err;
  res.status(statusCode).send({
    message: statusCode === 500 ? 'На сервере произошла ошибка' : errMessage,
  });
  return next();
});

app.listen(config.PORT, () => {
  console.log(`App listening on port ${config.PORT}`);
});
