const Card = require('../models/card');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(() => res.status(500).send({ message: 'Внутренняя ошибка сервера' }));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => {
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Неверный запрос' });
        return;
      }
      res.status(500).send({ message: 'Внутренняя ошибка сервера' });
    });
};

module.exports.deleteCard = (req, res) => {
  const { cardId } = req.params;
  Card.findById(cardId)
    .orFail()
    .then((card) => {
      if (!card.owner.equals(req.user._id)) {
        res.status(403).send({ message: 'Запрещено' });
        return;
      }
      Card.deleteOne(card).then(() => res.send({ data: card }));
    })
    .catch((err) => {
      console.log(err.message);
      if (err.name === 'DocumentNotFoundError') {
        res.status(404).send({ message: 'Карточка с таким id не существует' });
        return;
      }

      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Некорректный формат ID' });
        return;
      } res.status(500).send({ message: 'Внутренняя ошибка сервера' });
    });
};

module.exports.likeCard = (req, res) => {
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
      if (err.name === 'DocumentNotFoundError') {
        res.status(404).send({ message: 'Карточка с таким id не существует' });
        return;
      }

      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Некорректный формат ID' });
        return;
      } res.status(500).send({ message: 'Внутренняя ошибка сервера' });
    });
};

module.exports.dislikeCard = (req, res) => {
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
      if (err.name === 'DocumentNotFoundError') {
        res.status(404).send({ message: 'Карточка с таким id не существует' });
        return;
      }

      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Некорректный формат ID' });
        return;
      } res.status(500).send({ message: 'Внутренняя ошибка сервера' });
    });
};
