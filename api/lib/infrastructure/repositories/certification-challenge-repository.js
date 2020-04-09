const Bookshelf = require('../bookshelf');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const CertificationChallengeBookshelf = require('../data/certification-challenge');
const logger = require('../../infrastructure/logger');

const { AssessmentEndedError } = require('../../domain/errors');

const logContext = {
  zone: 'certificationChallengeRepository.getNonAnsweredChallengeByCourseId',
  type: 'repository',
};

module.exports = {

  async save(certificationChallenge) {
    const certificationChallengeBookshelf = new CertificationChallengeBookshelf(certificationChallenge);

    const savedCertificationChallenge = await certificationChallengeBookshelf.save();
    return bookshelfToDomainConverter.buildDomainObject(CertificationChallengeBookshelf, savedCertificationChallenge);
  },

  async findByCertificationCourseId(certificationCourseId) {
    const certificationChallenges = await CertificationChallengeBookshelf
      .where({ courseId: certificationCourseId })
      .fetchAll();
    
    return bookshelfToDomainConverter.buildDomainObjects(CertificationChallengeBookshelf, certificationChallenges);
  },

  async getNonAnsweredChallengeByCourseId(assessmentId, courseId) {
    const answeredChallengeIds = Bookshelf.knex('answers')
      .select('challengeId')
      .where({ assessmentId });

    const certificationChallenge = await CertificationChallengeBookshelf
      .where({ courseId })
      .query((knex) => knex.whereNotIn('challengeId', answeredChallengeIds))
      .fetch();
    
    if (certificationChallenge === null) {
      logger.trace(logContext, 'no found challenges');
      throw new AssessmentEndedError();
    }

    logContext.challengeId = certificationChallenge.id;
    logger.trace(logContext, 'found challenge');
    return bookshelfToDomainConverter.buildDomainObject(CertificationChallengeBookshelf, certificationChallenge);
  },
};
