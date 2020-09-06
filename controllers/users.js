const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => {
      if (!users.length) {
        res.status(404).send({ message: 'В базе данных пользователи не созданы' });
        return;
      }
      res.send({ data: users });
    })
    .catch(() => res.status(500).send({ message: 'Внутренняя ошибка сервера' }));
};

module.exports.getUserId = (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    .orFail()
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        res.status(404).send({ message: 'Пользователя с таким id не существует' });
        return;
      } if (err.name === 'CastError') {
        res.status(400).send({ message: 'Некорректный формат ID' });
        return;
      }

      res.status(500).send({ message: 'Внутренняя ошибка сервера' });
    });
};

module.exports.createUser = (req, res) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  if (!password || password.trim().length < 8) {
    res.status(400).send({ message: 'Длина пароля должна быть не менее 8 символов' });
    return;
  }

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => {
      if (user) {
        res.status(201).send({
          data: {
            name: user.name, about: user.about, avatar: user.avatar, email: user.email,
          },
        });
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Данные пользователя введены некорректно' });
      } else if ((err.name === 'MongoError' && err.code === 11000)) {
        res.status(409).send({ message: 'Пользователь с таким e-mail уже зарегистрирован' });
      } else {
        res.status(500).send({ message: 'Внутренняя ошибка сервера' });
      }
    });
};

module.exports.updateUser = (req, res) => {
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
      if (err.name === 'DocumentNotFoundError') {
        res.status(404).send({ message: 'Пользователь с таким id не существует' });
        return;
      }

      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Неверный запрос' });
        return;
      }
      res.status(500).send({ message: 'Внутренняя ошибка сервера' });
    });
};

module.exports.updateAvatar = (req, res) => {
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
      if (err.name === 'DocumentNotFoundError') {
        res.status(404).send({ message: 'Пользователь с таким id не существует' });
        return;
      }

      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Неверный запрос' });
        return;
      }
      res.status(500).send({ message: 'Внутренняя ошибка сервера' });
    });
};

module.exports.login = (req, res) => {
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

    .catch(() => {
      res.status(401).send({ message: 'Необходима авторизация' });
    });
};
