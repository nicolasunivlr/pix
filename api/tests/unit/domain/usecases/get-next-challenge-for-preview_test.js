const { expect } = require('$root/tests/test-helper');
const getNextChallengeForPreview = require('$root/lib/domain/usecases/get-next-challenge-for-preview');

const { AssessmentEndedError } = require('$root/lib/domain/errors');

describe('Unit | Domain | Use Cases | get-next-challenge-for-preview', () => {

  describe('#getNextChallengeForPreview', () => {

    it('should trigger an AssessmentEndedError', () => {
      // when
      const promise = getNextChallengeForPreview();

      // then
      return expect(promise).to.be.rejectedWith(AssessmentEndedError);
    });

  });

});
