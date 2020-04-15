const { expect, sinon } = require('$root/tests/test-helper');
const rememberUserHasSeenAssessmentInstructions = require('$root/lib/domain/usecases/remember-user-has-seen-assessment-instructions');
const userRepository = require('$root/lib/infrastructure/repositories/user-repository');

describe('Unit | UseCase | remember-user-has-seen-assessment-instructions', () => {

  beforeEach(() => {
    sinon.stub(userRepository, 'updateHasSeenAssessmentInstructionsToTrue');
  });

  it('should update has seen assessment instructions', async () => {
    // given
    const userId = 'userId';
    const updatedUser = Symbol('updateduser');
    userRepository.updateHasSeenAssessmentInstructionsToTrue.resolves(updatedUser);

    // when
    const actualUpdatedUser = await rememberUserHasSeenAssessmentInstructions({ userId, userRepository });

    // then
    expect(userRepository.updateHasSeenAssessmentInstructionsToTrue).to.have.been.calledWith(userId);
    expect(actualUpdatedUser).to.equal(updatedUser);
  });
});
