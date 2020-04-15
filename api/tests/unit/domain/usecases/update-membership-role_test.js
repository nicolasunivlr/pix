const { expect, sinon } = require('$root/tests/test-helper');
const { updateMembershipRole } = require('$root/lib/domain/usecases');
const Membership = require('$root/lib/domain/models/Membership');

describe('Unit | UseCase | update-membership-role', () => {

  let membershipRepository;

  beforeEach(() => {
    membershipRepository = {
      updateRoleById: sinon.stub().resolves()
    };
  });

  context('when membership exists', () => {

    it('should allow to update the organization name (only) if modified', async () => {
      // given
      const membershipId = 100;
      const organizationRole = Membership.roles.ADMIN;

      // when
      await updateMembershipRole({ membershipId, organizationRole, membershipRepository });

      // then
      expect(membershipRepository.updateRoleById).to.has.been.calledWith({ id: membershipId, organizationRole });
    });
  });
});
