const _ = require('lodash');
const { expect, sinon, domainBuilder } = require('../../../test-helper');
const events = require('../../../../lib/domain/events');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const Assessment = require('../../../../lib/domain/models/Assessment');
const Badge = require('../../../../lib/domain/models/Badge');
const CertificationScoringCompleted = require('../../../../lib/domain/events/CertificationScoringCompleted');

describe('Unit | Domain | Events | handle-certification-partner', () => {
  const scoringCertificationService = { calculateAssessmentScore: _.noop };
  const assessmentRepository = { get: _.noop };
  const assessmentResultRepository = { save: _.noop };
  const badgeAcquisitionRepository = { hasAcquiredBadgeWithKey: _.noop };
  const certificationPartnerAcquisitionRepository = { save: _.noop };
  const domainTransaction = {};

  let certificationScoringEvent;

  const dependencies = {
    scoringCertificationService,
    assessmentRepository,
    badgeAcquisitionRepository,
    certificationPartnerAcquisitionRepository,
  };

  context('when assessment is of type CERTIFICATION', () => {
    let certificationAssessment;

    beforeEach(() => {
      certificationAssessment = _buildCertificationAssessment();
      sinon.stub(assessmentRepository, 'get').withArgs(certificationAssessment.id).resolves(certificationAssessment);

      certificationScoringEvent = new CertificationScoringCompleted({
        certificationCourseId: Symbol('certificationCourseId'),
        userId: Symbol('userId'),
        isCertification: true,
      });

    });

    context('when scoring is successful', () => {
      const assessmentResult = Symbol('AssessmentResult');
      const assessmentResultId = 'assessmentResultId';
      const savedAssessmentResult = { id: assessmentResultId };

      beforeEach(() => {
        sinon.stub(AssessmentResult, 'BuildStandardAssessmentResult').returns(assessmentResult);
        sinon.stub(assessmentResultRepository, 'save').resolves(savedAssessmentResult);
      });

      context('when score is above 0', () => {
        const assessmentScore = {
          nbPix: null,
          level: null,
          competenceMarks: null,
        };

        beforeEach(() => {
          sinon.stub(scoringCertificationService, 'calculateAssessmentScore').resolves(assessmentScore);
          sinon.stub(badgeAcquisitionRepository, 'hasAcquiredBadgeWithKey').resolves(true);
        });

        context('when user has clea badge', () => {
          [80, 90, 100].forEach((reproducabilityRate) =>
            it(`for ${reproducabilityRate} it should obtain CleA certification`, async () => {
              // given
              sinon.stub(certificationPartnerAcquisitionRepository, 'save').resolves();
              certificationScoringEvent.percentageCorrectAnswers = reproducabilityRate;

              // when
              await events.handleCertificationAcquisitionForPartner({
                certificationScoringEvent, ...dependencies, domainTransaction
              });

              // then
              expect(badgeAcquisitionRepository.hasAcquiredBadgeWithKey).to.have.been.called;
              expect(certificationPartnerAcquisitionRepository.save).to.have.been.calledWithMatch(
                {
                  partnerKey: Badge.keys.PIX_EMPLOI_CLEA,
                  certificationCourseId: certificationScoringEvent.certificationCourseId,
                },
                domainTransaction);
            })
          );

          [1, 50].forEach((reproducabilityRate) =>
            it(`for ${reproducabilityRate} it should not obtain CleA certification`, async () => {
              // given
              sinon.stub(certificationPartnerAcquisitionRepository, 'save').resolves();
              certificationScoringEvent.percentageCorrectAnswers = reproducabilityRate;

              // when
              await events.handleCertificationAcquisitionForPartner({
                certificationScoringEvent, ...dependencies, domainTransaction
              });

              // then
              expect(badgeAcquisitionRepository.hasAcquiredBadgeWithKey).to.have.been.called;
              expect(certificationPartnerAcquisitionRepository.save).not.to.have.been.called;
            })
          );
        });

        // context('when user has obtain partner certif', () => {
        //   it('for xxx it should obtain CleA certification', async () => {
        //     // given
        //     sinon.stub(certificationPartnerAcquisitionRepository, 'save').resolves();
        //     certificationScoringEvent.percentageCorrectAnswers = reproducabilityRate;
        //
        //     // when
        //     await events.handleCertificationAcquisitionForPartner({
        //       assessmentCompletedEvent, certificationScoringEvent,  ...dependencies, domainTransaction
        //     });
        //
        //     // then
        //     expect(badgeAcquisitionRepository.hasAcquiredBadgeWithKey).to.have.been.called;
        //     expect(certificationPartnerAcquisitionRepository.save).to.have.been.calledWithMatch(
        //       {
        //         partnerKey: Badge.keys.PIX_EMPLOI_CLEA,
        //         certificationCourseId: certificationAssessment.certificationCourseId,
        //       },
        //       domainTransaction);
        //   });
        //
        // });

      });

      context('when score is equal 0', () => {

      });
    });
  });
});

function _buildCertificationAssessment() {
  return domainBuilder.buildAssessment({
    id: Symbol('assessmentId'),
    certificationCourseId: Symbol('certificationCourseId'),
    state: 'started',
    type: Assessment.types.CERTIFICATION,
  });
}
