const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const UnauthorizedError = require('../errors/unauthorized-err');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: [2, 'Минимальная длина имени должна быть не менее 2 символов'],
    maxlength: [30, 'Максимальная длина имени должна быть не более 30 символов'],
  },
  about: {
    type: String,
    required: true,
    minlength: [2, 'Минимальная длина должна быть не менее 2 символов'],
    maxlength: [30, 'Максимальная длина имени должна быть не более 30 символов'],
  },
  avatar: {
    type: String,
    required: true,
    validate: [{ validator: (value) => validator.isURL(value), message: 'Введён не корректный формат ссылки' }],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [{ validator: (email) => validator.isEmail(email), message: 'Введён не корректный формат почты' }],
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});
userSchema.statics.findUserByCredentials = function findUserByCredentials(email, password) {
  return this.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('\u{261E} \u{26A0} Неправильные почта или пароль');
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new UnauthorizedError('\u{261E} \u{26A0} Неправильные почта или пароль');
          }

          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
