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
    email: Joi.string().required().custom(validatorEmail).trim()
      .messages({
        'any.required': 'email: \u{261E} \u{26A0} Обязательное поле',
        'string.empty': 'email: \u{261E} \u{26A0} Поле *email* пустое',
        'any.custom': 'email: \u{261E} \u{26A0} Не корректный *email*',
      }),
    password: Joi.string().required().min(8).trim()
      .messages({
        'any.required': 'password: \u{261E} \u{26A0} Обязательное поле',
        'string.empty': 'password: \u{261E} \u{26A0} Поле *password* пустое',
        'string.min': 'password: \u{261E} \u{26A0} Поле *password* должно содержать не менее 8 символов',
      }),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().custom(validatorEmail).trim(),
    password: Joi.string().required().min(8).trim(),
    name: Joi.string().required().min(2).max(30)
      .trim()
      .pattern(/^[a-zA-Zа-яА-ЯёЁ'][a-zA-Z-а-яА-ЯёЁ' ]+[a-zA-Zа-яА-ЯёЁ']?$/)
      .messages({
        'any.required': 'name: \u{261E} \u{26A0} Обязательное поле',
        'string.pattern.base': 'name: \u{261E} \u{26A0} Имя не должно содержать цифры',
        'string.empty': 'name: \u{261E} \u{26A0} Имя пользователя пустое',
        'string.max': 'name: \u{261E} \u{26A0} Имя пользователя должно содержать более 30 символов',
        'string.min': 'name: \u{261E} \u{26A0} Имя пользователя должно содержать не менее 2 символов',

      }),
    about: Joi.string().required().min(2).max(30)
      .trim()
      .messages({
        'any.required': 'about: \u{261E} \u{26A0} Обязательное поле',
        'string.empty': 'about: \u{261E} \u{26A0} Поле *about* пустое',
        'string.max': 'about: \u{261E} \u{26A0} Поле *about* должно содержать более 30 символов',
        'string.min': 'about: \u{261E} \u{26A0} Поле *about* должно содержать не менее 2 символов',
      }),
    avatar: Joi.string().required().custom(validatorUrl).trim()
      .messages({
        'any.required': 'avatar: \u{261E} \u{26A0} Обязательное поле',
        'string.empty': 'avatar: \u{261E} \u{26A0} Поле *avatar* пустое',
        'any.custom': 'avatar: \u{261E} \u{26A0} Поле *avatar*  содержит не корректную ссылку',
      }),
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
    message: statusCode === 500 ? 'На сервере произошла ошибка (ツ)' : errMessage,
  });
  return next();
});

app.listen(config.PORT, () => {
  console.log(` (ツ) App listening on port ${config.PORT}`);
});
