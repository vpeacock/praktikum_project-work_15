const Card = require('../models/card');
const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request-err');
const ForbiddenError = require('../errors/forbidden-err');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => {
      res.send({ data: card });
    })
    .catch((err) => {
      let error;
      if (err.name === 'ValidationError') {
        error = new BadRequestError('Неверный запрос');
        return next(error);
      }
      return next(err);
    });
};

module.exports.deleteCard = (req, res, next) => {
  const { cardId } = req.params;
  Card.findById(cardId)
    .orFail()
    .then((card) => {
      if (!card.owner.equals(req.user._id)) {
        throw new ForbiddenError('Запрещено, удалить можно только свою карточку');
      }
      Card.deleteOne(card).then(() => res.send({ data: card }));
    })
    .catch((err) => {
      let error;
      if (err.name === 'DocumentNotFoundError') {
        error = new NotFoundError('Карточка с таким id не существует');
        return next(error);
      }

      if (err.name === 'CastError') {
        error = new BadRequestError('Некорректный формат ID');
        return next(error);
      }
      return next(err);
    });
};

module.exports.likeCard = (req, res, next) => {
  const { cardId } = req.params;

  Card.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail()
    .then((card) => {
      console.log(card);
      res.send({ data: card });
    })
    .catch((err) => {
      let error;
      if (err.name === 'DocumentNotFoundError') {
        error = new NotFoundError('Карточка с таким id не существует');
        return next(error);
      }

      if (err.name === 'CastError') {
        error = new BadRequestError('Некорректный формат ID');
        return next(error);
      }
      return next(err);
    });
};

module.exports.dislikeCard = (req, res, next) => {
  const { cardId } = req.params;

  Card.findByIdAndUpdate(
    cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail()
    .then((card) => {
      res.send({ data: card });
    })
    .catch((err) => {
      let error;
      if (err.name === 'DocumentNotFoundError') {
        error = new NotFoundError('Карточка с таким id не существует');
        return next(error);
      }

      if (err.name === 'CastError') {
        error = new BadRequestError('Некорректный формат ID');
        return next(error);
      }
      return next(err);
    });
};
