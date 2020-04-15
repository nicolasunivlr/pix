const { expect, sinon, domainBuilder } = require('$root/tests/test-helper');
const getOrganizationDetails = require('$root/lib/domain/usecases/get-organization-details');
const Organization = require('$root/lib/domain/models/Organization');

describe('Unit | UseCase | get-organization-details', () => {

  it('should return the Organization matching the given organization ID', () => {
    // given
    const organizationId = 1234;
    const foundOrganization = domainBuilder.buildOrganization({ id: organizationId });
    const organizationRepository = {
      get: sinon.stub().resolves(foundOrganization)
    };

    // when
    const promise = getOrganizationDetails({ organizationId, organizationRepository });

    // then
    return promise.then((organization) => {
      expect(organizationRepository.get).to.have.been.calledWith(organizationId);
      expect(organization).to.be.an.instanceOf(Organization);
      expect(organization).to.deep.equal(foundOrganization);
    });
  });
});
