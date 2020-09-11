const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
Joi.objectId = require('joi-objectid')(Joi);
const { validatorUrl } = require('../validators/validator-url');

const {
  getUsers,
  getUserId,
  updateUser,
  updateAvatar,

} = require('../controllers/users');

router.get('/', getUsers);
router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.objectId(),
  }),
}), getUserId);
router.patch('/me', celebrate({
  body: Joi.object().keys({
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

  }),
}), updateUser);
router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().custom(validatorUrl).trim()
      .messages({
        'any.required': 'avatar: \u{261E} \u{26A0} Обязательное поле',
        'string.empty': 'avatar: \u{261E} \u{26A0} Поле *avatar* пустое',
        'any.custom': 'avatar: \u{261E} \u{26A0} Поле *avatar*  содержит не корректную ссылку',
      }),
  }),
}), updateAvatar);

module.exports = router;
