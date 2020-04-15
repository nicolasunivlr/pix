const { expect, sinon } = require('$root/tests/test-helper');
const campaignRepository = require('$root/lib/infrastructure/repositories/campaign-repository');
const Campaign = require('$root/lib/infrastructure/data/campaign');
const queryBuilder = require('$root/lib/infrastructure/utils/query-builder');

describe('Unit | Repository | CampaignRepository', function() {

  describe('#get', () => {
    beforeEach(() => {
      sinon.stub(queryBuilder, 'get');
    });

    it('should get the campaign', async () => {
      // given
      const options = {};
      const id = 1;
      queryBuilder.get.withArgs(Campaign, id, options).resolves('ok');

      // when
      const result = await campaignRepository.get(id, options);

      // then
      expect(result).to.equal('ok');
    });
  });

});
