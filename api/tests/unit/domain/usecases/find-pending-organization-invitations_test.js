const { expect, sinon, domainBuilder } = require('$root/tests/test-helper');
const findPendingOrganizationInvitations = require('$root/lib/domain/usecases/find-pending-organization-invitations');
const OrganizationInvitation = require('$root/lib/domain/models/OrganizationInvitation');

describe('Unit | UseCase | find-pending-organization-invitations', () => {

  it('should succeed', async () => {
    // given
    const organizationId = 1234;
    const organizationInvitationRepositoryStub = { findPendingByOrganizationId: sinon.stub() };
    organizationInvitationRepositoryStub.findPendingByOrganizationId.resolves();

    // when
    await findPendingOrganizationInvitations({
      organizationId,
      organizationInvitationRepository: organizationInvitationRepositoryStub,
    });

    // then
    expect(organizationInvitationRepositoryStub.findPendingByOrganizationId).to.have.been.calledWith({ organizationId });
  });

  it('should return the OrganizationInvitations belonging to the given organization', async () => {
    // given
    const organizationId = 1234;
    const foundOrganizationInvitations = [
      domainBuilder.buildOrganizationInvitation({ organizationId, status: OrganizationInvitation.StatusType.PENDING }),
      domainBuilder.buildOrganizationInvitation({ organizationId, status: OrganizationInvitation.StatusType.PENDING }),
    ];
    const organizationInvitationRepositoryStub = {
      findPendingByOrganizationId: sinon.stub().resolves(foundOrganizationInvitations)
    };

    // when
    const organizationInvitations = await findPendingOrganizationInvitations({ organizationId, organizationInvitationRepository: organizationInvitationRepositoryStub });

    // then
    expect(organizationInvitations).to.deep.equal(foundOrganizationInvitations);
    expect(organizationInvitations[0]).to.be.an.instanceOf(OrganizationInvitation);
  });
});
