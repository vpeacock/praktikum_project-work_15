const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const UnauthorizedError = require('../errors/unauthorized-err');
const BadRequestError = require('../errors/bad-request-err');
const NotFoundError = require('../errors/not-found-err');
const ConflictError = require('../errors/conflict-err');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      if (!users.length) {
        throw new NotFoundError('В базе данных пользователи не созданы');
      }
      res.send({ data: users });
    })
    .catch(next);
};

module.exports.getUserId = (req, res, next) => {
  const { userId } = req.params;
  User.findById(userId)
    .orFail()
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      let error;
      if (err.name === 'DocumentNotFoundError') {
        error = new NotFoundError('Пользователя с таким id не существует');
        return next(error);
      } if (err.name === 'CastError') {
        error = new NotFoundError('Некорректный формат ID');
        return next(error);
      }
      return next(err);
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => {
      res.status(201).send({
        data: {
          name: user.name, about: user.about, avatar: user.avatar, email: user.email,
        },
      });
    })
    .catch((err) => {
      let error;
      if (err.name === 'ValidationError') {
        error = new BadRequestError('Данные пользователя введены некорректно');
        return next(error);
      } if ((err.name === 'MongoError' && err.code === 11000)) {
        error = new ConflictError('Пользователь с таким e-mail уже зарегистрирован');
        return next(error);
      }
      return next(err);
    });
};

module.exports.updateUser = (req, res, next) => {
  const { name, about } = req.body;
  const owner = req.user._id;

  User.findByIdAndUpdate(
    owner,
    { name, about },
    { new: true, runValidators: true },
  )
    .orFail()
    .then((user) => {
      res.send({ data: user });
    })
    .catch((err) => {
      let error;
      if (err.name === 'DocumentNotFoundError') {
        error = new NotFoundError('Пользователь с таким id не существует');
        return next(error);
      }

      if (err.name === 'ValidationError') {
        error = new BadRequestError('Неверный запрос');
        return next(error);
      }
      return next(err);
    });
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  const owner = req.user._id;

  User.findByIdAndUpdate(
    owner,
    { avatar },
    {
      new: true,
      runValidators: true,
    },
  )
    .orFail()
    .then((user) => {
      res.send({ data: user });
    })
    .catch((err) => {
      let error;
      if (err.name === 'DocumentNotFoundError') {
        error = new NotFoundError('Пользователь с таким id не существует');
        return next(error);
      }

      if (err.name === 'ValidationError') {
        error = new BadRequestError('Неверный запрос');
        return next(error);
      }
      return next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const { NODE_ENV, JWT_SECRET } = process.env;
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
      res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
        sameSite: true,
      })
        .end('Успешная авторизация');
    })

    .catch((err) => {
      let error;
      if (err.name === 'DocumentNotFoundError') {
        error = new UnauthorizedError('Необходима авторизация');
        return next(error);
      }
      return next(err);
    });
};
