const { expect, sinon } = require('$root/tests/test-helper');
const useCase = require('$root/lib/application/usecases/checkUserHasRolePixMaster');
const tokenService = require('$root/lib/domain/services/token-service');
const userRepository = require('$root/lib/infrastructure/repositories/user-repository');

describe('Unit | Application | Use Case | CheckUserHasRolePixMaster', () => {

  const accessToken = 'jwt.access.token';

  beforeEach(() => {
    sinon.stub(tokenService, 'extractUserId').resolves();
    sinon.stub(userRepository, 'isPixMaster');
  });

  it('should resolve true when the user (designed by the access_token via its userId) has role PIX_MASTER', () => {
    // given
    userRepository.isPixMaster.resolves(true);

    // when
    const promise = useCase.execute(accessToken);

    // then
    return promise.then((result) => {
      expect(result).to.be.true;
    });
  });

  it('should resolve false when the user (designed by the access_token via its userId) has not role PIX_MASTER', () => {
    // given
    userRepository.isPixMaster.resolves(false);

    // when
    const promise = useCase.execute(accessToken);

    // then
    return promise.then((result) => {
      expect(result).to.be.false;
    });
  });
});
