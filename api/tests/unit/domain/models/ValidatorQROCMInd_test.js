const AnswerStatus = require('$root/lib/domain/models/AnswerStatus');
const solutionServiceQrocmInd = require('$root/lib/domain/services/solution-service-qrocm-ind');
const Validation = require('$root/lib/domain/models/Validation');
const ValidatorQROCMInd = require('$root/lib/domain/models/ValidatorQROCMInd');

const { expect, domainBuilder, sinon } = require('$root/tests/test-helper');

describe('Unit | Domain | Models | ValidatorQROCMInd', () => {

  beforeEach(() => {

    sinon.stub(solutionServiceQrocmInd, 'match');
  });

  describe('#assess', () => {

    let uncorrectedAnswer;
    let validation;
    let validator;
    let solution;

    beforeEach(() => {
      // given
      solutionServiceQrocmInd.match.returns({ result: AnswerStatus.OK, resultDetails: 'resultDetailYAMLString' });
      solution = domainBuilder.buildSolution({ type: 'QROCM-ind' });

      uncorrectedAnswer = domainBuilder.buildAnswer.uncorrected();
      validator = new ValidatorQROCMInd({ solution: solution });

      // when
      validation = validator.assess(uncorrectedAnswer);
    });

    it('should call solutionServiceQROCMInd', () => {
      // then
      expect(solutionServiceQrocmInd.match).to.have.been.calledWith(
        uncorrectedAnswer.value, solution.value, solution.enabledTreatments);
    });
    it('should return a validation object with the returned status', () => {
      const expectedValidation = domainBuilder.buildValidation({
        result: AnswerStatus.OK,
        resultDetails: 'resultDetailYAMLString',
      });

      // then
      expect(validation).to.be.an.instanceOf(Validation);
      expect(validation).to.deep.equal(expectedValidation);
    });
  });
});
