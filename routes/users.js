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
      .trim(),
    about: Joi.string().required().min(2).max(30)
      .trim(),

  }),
}), updateUser);
router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().custom(validatorUrl).trim(),
  }),
}), updateAvatar);

module.exports = router;
