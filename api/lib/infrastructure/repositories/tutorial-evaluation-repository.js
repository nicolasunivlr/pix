const BookshelfTutorialEvaluation = require('../data/tutorial-evaluation');

module.exports = {
  async addEvaluation({ userId, tutorialId }) {
    const foundTutorialEvaluation = await BookshelfTutorialEvaluation.where({ userId, tutorialId }).fetch();
    if (foundTutorialEvaluation) {
      return _toDomain(foundTutorialEvaluation);
    }

    const newTutorialEvaluation = new BookshelfTutorialEvaluation({ userId, tutorialId });
    const savedTutorialEvaluation = await newTutorialEvaluation.save();
    return _toDomain(savedTutorialEvaluation);
  },
};

function _toDomain(bookshelfTutorialEvaluation) {
  return {
    id: bookshelfTutorialEvaluation.get('id'),
    tutorialId: bookshelfTutorialEvaluation.get('tutorialId'),
    userId: bookshelfTutorialEvaluation.get('userId'),
  };
}
