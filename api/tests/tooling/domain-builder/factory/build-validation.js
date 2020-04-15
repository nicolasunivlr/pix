const AnswerStatus = require('$root/lib/domain/models/AnswerStatus');
const faker = require('faker');
const Validation = require('$root/lib/domain/models/Validation');

module.exports = function(
  {
    result = AnswerStatus.OK,
    resultDetails = faker.lorem.words(),
  } = {}) {

  return new Validation({
    result,
    resultDetails,
  });
};

