const AnswerStatus = require('$root/lib/domain/models/AnswerStatus');
const solutionServiceQroc = require('$root/lib/domain/services/solution-service-qroc');
const Validation = require('$root/lib/domain/models/Validation');
const ValidatorQROC = require('$root/lib/domain/models/ValidatorQROC');

const { expect, domainBuilder, sinon } = require('$root/tests/test-helper');

describe('Unit | Domain | Models | ValidatorQROC', () => {

  beforeEach(() => {

    sinon.stub(solutionServiceQroc, 'match');
  });

  describe('#assess', () => {

    let uncorrectedAnswer;
    let validation;
    let validator;
    let solution;

    beforeEach(() => {
      // given
      solutionServiceQroc.match.returns(AnswerStatus.OK);
      solution = domainBuilder.buildSolution({ type: 'QROC' });

      uncorrectedAnswer = domainBuilder.buildAnswer.uncorrected();
      validator = new ValidatorQROC({ solution: solution });

      // when
      validation = validator.assess(uncorrectedAnswer);
    });

    it('should call solutionServiceQROC', () => {
      // then
      expect(solutionServiceQroc.match).to.have.been.calledWith(
        uncorrectedAnswer.value, solution.value, solution.deactivations);
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
