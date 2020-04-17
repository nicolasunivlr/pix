const { expect, sinon, domainBuilder } = require('../../../test-helper');
const useCase = require('../../../../lib/application/usecases/checkUserCanAccessCampaign');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');

describe('Unit | Application | Use Case | CheckUserCanAccessCampaign', () => {

  beforeEach(() => {
    sinon.stub(userRepository, 'getWithMemberships');
    sinon.stub(campaignRepository, 'get');
  });

  context('When user can access campaign', () => {

    it('should return true', async () => {
      // given
      const organization = domainBuilder.buildOrganization();
      const membership = domainBuilder.buildMembership({ organization });
      const user = domainBuilder.buildUser({ memberships: [membership] });
      const campaign = domainBuilder.buildCampaign({ organizationId: organization.id });
      userRepository.getWithMemberships.resolves(user);
      campaignRepository.get.resolves(campaign);

      // when
      const response = await useCase.execute(user.id, campaign.id);

      // then
      expect(response).to.equal(true);
    });
  });

  context('When user is not allowed to access campaign', () => {

    it('should return false', async () => {
      // given
      const organization = domainBuilder.buildOrganization();
      const membership = domainBuilder.buildMembership({ organization });
      const user = domainBuilder.buildUser({ memberships: [membership] });
      const campaign = domainBuilder.buildCampaign({ organizationId: 12345 });
      userRepository.getWithMemberships.resolves(user);
      campaignRepository.get.resolves(campaign);

      // when
      const response = await useCase.execute(user.id, campaign.id);

      // then
      expect(response).to.equal(false);
    });
  });
});
