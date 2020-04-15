const { expect, sinon, domainBuilder } = require('$root/tests/test-helper');
const getUserWithMemberships = require('$root/lib/domain/usecases/get-user-with-memberships');
const User = require('$root/lib/domain/models/User');

describe('Unit | UseCase | get-user-with-memberships', () => {

  let userRepository;

  beforeEach(() => {
    userRepository = { getWithMemberships: sinon.stub() };
  });

  it('should return a User with its Memberships', async () => {
    // given
    const fetchedUser = domainBuilder.buildUser();
    userRepository.getWithMemberships.resolves(fetchedUser);

    // when
    const result = await getUserWithMemberships({
      userId: fetchedUser.id,
      userRepository,
    });

    // then
    expect(result).to.be.an.instanceOf(User);
    expect(result).to.equal(fetchedUser);
    expect(userRepository.getWithMemberships).to.have.been.calledOnce;
  });
});
