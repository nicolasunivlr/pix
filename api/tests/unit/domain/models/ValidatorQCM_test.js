const AnswerStatus = require('$root/lib/domain/models/AnswerStatus');
const solutionServiceQcm = require('$root/lib/domain/services/solution-service-qcm');
const Validation = require('$root/lib/domain/models/Validation');
const ValidatorQCM = require('$root/lib/domain/models/ValidatorQCM');

const { expect, domainBuilder, sinon } = require('$root/tests/test-helper');

describe('Unit | Domain | Models | ValidatorQCM', () => {

  beforeEach(() => {

    sinon.stub(solutionServiceQcm, 'match');
  });

  describe('#assess', () => {

    let uncorrectedAnswer;
    let validation;
    let validator;
    let solution;

    beforeEach(() => {
      // given
      solutionServiceQcm.match.returns(AnswerStatus.OK);
      solution = domainBuilder.buildSolution({ type: 'QCM' });

      uncorrectedAnswer = domainBuilder.buildAnswer.uncorrected();
      validator = new ValidatorQCM({ solution: solution });

      // when
      validation = validator.assess(uncorrectedAnswer);
    });

    it('should call solutionServiceQCU', () => {
      // then
      expect(solutionServiceQcm.match).to.have.been.calledWith(uncorrectedAnswer.value, solution.value);
    });
    it('should return a validation object with the returned status', () => {
      const expectedValidation = domainBuilder.buildValidation({
        result: AnswerStatus.OK,
        resultDetails: null,
      });

      // then
      expect(validation).to.be.an.instanceOf(Validation);
      expect(validation).to.deep.equal(expectedValidation);
    });
  });
});
