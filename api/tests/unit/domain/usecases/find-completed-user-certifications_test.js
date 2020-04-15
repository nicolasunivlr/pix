const { expect, sinon } = require('$root/tests/test-helper');
const AssessmentResult = require('$root/lib/domain/models/AssessmentResult');
const Certification = require('$root/lib/domain/models/Certification');
const findCompletedUserCertifications = require('$root/lib/domain/usecases/find-completed-user-certifications');

describe('Unit | UseCase | find-completed-user-certifications', () => {

  const certificationRepository = {};

  beforeEach(() => {
    certificationRepository.findByUserId = sinon.stub();
  });

  it('should return all the needed informations about certifications', function() {
    // given
    const userId = 1;
    const assessmentResult = new AssessmentResult({
      pixScore: 23,
      status: 'rejected'
    });
    const completedCertifications = new Certification({
      id: 1000,
      certificationCenter: 'Université des chocolats',
      date: '2000-02-12',
      isPublished: true,
      assessmentState: 'completed',
      assessmentResults: [assessmentResult]
    });
    certificationRepository.findByUserId.resolves([completedCertifications]);

    // when
    const promise = findCompletedUserCertifications({ userId, certificationRepository });

    // then
    return promise.then((certifications) => {
      expect(certificationRepository.findByUserId).to.have.been.calledWith(userId);
      expect(certifications).to.have.lengthOf(1);
      expect(certifications[0].id).to.equal(1000);
    });
  });
});
