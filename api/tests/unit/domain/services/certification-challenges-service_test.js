const { sinon, expect } = require('../../../test-helper');
const certificationChallengesService = require('../../../../lib/domain/services/certification-challenges-service');
const certificationChallengeRepository = require('../../../../lib/infrastructure/repositories/certification-challenge-repository');

describe('Unit | Service | Certification Challenge Service', function() {

  describe('#saveChallenges', () => {

    const challenge1 = {
      id: 'challenge1',
      competenceId: 'competence1Id',
      testedSkill: '@skill1'
    };
    const challenge2 = {
      id: 'challenge2',
      competenceId: 'competence2Id',
      testedSkill: '@skill2'
    };

    const certificationProfileWithOneCompetence = [
      {
        challenges: [challenge1, challenge2]
      }
    ];

    const certificationProfileWithTwoCompetence = [
      {
        challenges: [challenge1]
      }, {
        challenges: [challenge2]
      }
    ];

    const certificationCourse = {
      id :'certification-course-id'
    };

    beforeEach(() => {
      sinon.stub(certificationChallengeRepository, 'save').resolves('challenge');
    });

    context('when profile return one competence with two challenges', () => {
      it('should call certification Challenge Repository save twice', async () => {
        //When
        await certificationChallengesService.saveChallenges(certificationProfileWithOneCompetence, certificationCourse);

        //Then
        sinon.assert.calledTwice(certificationChallengeRepository.save);
        const firstCall = certificationChallengeRepository.save.getCall(0);
        expect(firstCall.calledWithMatch({
          challengeId: challenge1.id,
          competenceId: challenge1.competenceId,
          associatedSkillName: challenge1.testedSkill,
          courseId: certificationCourse.id,
        })).to.be.true;
        const secondCall = certificationChallengeRepository.save.getCall(1);
        expect(secondCall.calledWithMatch({
          challengeId: challenge2.id,
          competenceId: challenge2.competenceId,
          associatedSkillName: challenge2.testedSkill,
          courseId: certificationCourse.id,
        })).to.be.true;
      });
    });

    context('when profile return two competences with one challenge', () => {
      it('should call certification Challenge Repository save twice', async () => {
        //When
        await certificationChallengesService.saveChallenges(certificationProfileWithTwoCompetence, certificationCourse);

        //Then
        sinon.assert.calledTwice(certificationChallengeRepository.save);
        const firstCall = certificationChallengeRepository.save.getCall(0);
        expect(firstCall.calledWithMatch({
          challengeId: challenge1.id,
          competenceId: challenge1.competenceId,
          associatedSkillName: challenge1.testedSkill,
          courseId: certificationCourse.id,
        })).to.be.true;
        const secondCall = certificationChallengeRepository.save.getCall(1);
        expect(secondCall.calledWithMatch({
          challengeId: challenge2.id,
          competenceId: challenge2.competenceId,
          associatedSkillName: challenge2.testedSkill,
          courseId: certificationCourse.id,
        })).to.be.true;
      });
    });

    it('should return the certification course with its challenges', async () => {
      // when
      const updatedCertificationCourse = await certificationChallengesService.saveChallenges(certificationProfileWithTwoCompetence, certificationCourse);

      // then
      expect(updatedCertificationCourse).to.deep.equal({
        id :'certification-course-id',
        challenges : ['challenge', 'challenge'],
      });
    });

  });
});
