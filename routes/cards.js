const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
Joi.objectId = require('joi-objectid')(Joi);
const { validatorUrl } = require('../validators/validator-url');

const {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,

} = require('../controllers/cards');

router.get('/', getCards);
router.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30)
      .trim()
      .messages({
        'any.required': 'name: \u{261E} \u{26A0} Обязательное поле',
        'string.empty': 'name: \u{261E} \u{26A0} Поле *name* пустое',
        'string.max': 'name: \u{261E} \u{26A0} Поле *name* должно содержать более 30 символов',
        'string.min': 'name: \u{261E} \u{26A0} Поле *name* должно содержать не менее 2 символов',
      }),
    link: Joi.string().required().custom(validatorUrl).trim()
      .messages({
        'any.required': 'link: \u{261E} \u{26A0} Обязательное поле',
        'string.empty': 'link: \u{261E} \u{26A0} Поле *link* пустое',
        'any.custom': 'link: \u{261E} \u{26A0} Поле *link*  содержит не корректную ссылку',
      }),
  }),
}), createCard);
router.delete('/:cardId', celebrate({
  params: Joi.object().keys({
    cardId: Joi.objectId(),
  }),
}), deleteCard);
router.put('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.objectId(),
  }),
}), likeCard);
router.delete('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.objectId(),
  }),
}), dislikeCard);

module.exports = router;
