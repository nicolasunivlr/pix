const certificationChallengeRepository = require('../../infrastructure/repositories/certification-challenge-repository');
const CertificationChallenge = require('../models/CertificationChallenge');

module.exports = {

  saveChallenges(userCompetences, certificationCourse) {
    const saveChallengePromises = [];
    userCompetences.forEach((userCompetence) => {
      userCompetence.challenges.forEach((challenge) => {
        const certificationChallenge = new CertificationChallenge({
          challengeId: challenge.id,
          competenceId: challenge.competenceId,
          associatedSkillName: challenge.testedSkill,
          courseId: certificationCourse.id,
        });
        saveChallengePromises.push(certificationChallengeRepository.save(certificationChallenge));
      });
    });

    return Promise.all(saveChallengePromises)
      .then((certificationChallenges) => {
        certificationCourse.challenges = certificationChallenges;
        return certificationCourse;
      });
  }
};
