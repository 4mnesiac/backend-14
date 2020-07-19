const path = require('path');
// eslint-disable-next-line import/no-dynamic-require
const Card = require(path.join('..', 'models', 'card'));
const customError = new Error();

module.exports.deleteCard = (req, res) => {
  Card.findById(req.params)
    .then((card) => {
      if (!card) {
        customError.message = 'Карточки с указанным id не существует';
        customError.name = 'NotFoundError';
        throw customError;
      }
      if (card.owner.toString() !== req.user._id) {
        customError.message = 'Недостаточно прав';
        customError.name = 'AuthError';
        throw customError;
      }
      return Card.findByIdAndRemove(req.params._id)
        .then(() => {
          res.status(200).send({ message: `Карточка ${card._id} успешно удалена` });
        });
    })
    .catch((err) => {
      switch (err.name) {
        case 'CastError':
          res.status(400).send({ message: `${err.name}: Ошибка запроса` });
          break;
        case 'NotFoundError':
          res.status(404).send({ message: err.message });
          break;
        case 'AuthError':
          res.status(401).send({ message: err.message });
          break;
        default:
          res.status(500).send({ message: err.message });
      }
    });
};

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((card) => res.status(200).send(
      { data: card },
    ))
    .catch((err) => res.status(500).send({
      message: err.message,
    }));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({
    name,
    link,
    owner,
  })
    .then((card) => res.send({
      message: `Ваша карточка ${name} успешно создана`,
      data: card,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: err.message });
      } else if (err.name === 'AuthError') {
        res.status(401).send({ message: err.message });
      } else {
        res.status(500).send({ message: err.message });
      }
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        customError.message = 'Карточка не найдена';
        customError.name = 'NotFoundError';
        throw customError;
      }
      res.status(200).send({ _id: req.params.cardId, likes: card.likes.length });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: `${err.name}: Ошибка запроса` });
      } else if (err.name === 'NotFoundError') {
        res.status(404).send({ message: err.message });
      } else {
        res.status(500).send({ message: err.message });
      }
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        customError.message = 'Карточка не найдена';
        customError.name = 'NotFoundError';
        throw customError;
      }
      res.status(200).send({ _id: req.params.cardId, likes: card.likes.length });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: `${err.name}: Ошибка запроса` });
      } else if (err.name === 'NotFoundError') {
        res.status(404).send({ message: err.message });
      } else {
        res.status(500).send({ message: err.message });
      }
    });
};
