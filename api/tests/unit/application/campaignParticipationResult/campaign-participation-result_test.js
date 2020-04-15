const { sinon, expect } = require('$root/tests/test-helper');
const campaignParticipationResultController = require('$root/lib/application/campaignParticipationResults/campaign-participation-result-controller');
const campaignParticipationResultSerializer = require('$root/lib/infrastructure/serializers/jsonapi/campaign-participation-result-serializer');
const usecases = require('$root/lib/domain/usecases');

describe('Unit | Controller | campaign-participation-result-controller', () => {
  describe('#get ', () => {

    const campaignParticipationId = 1;
    const userId = 1;

    beforeEach(() => {
      sinon.stub(usecases, 'getCampaignParticipationResult');
      sinon.stub(campaignParticipationResultSerializer, 'serialize');
    });

    it('should return ok', async () => {
      // given
      usecases.getCampaignParticipationResult.withArgs({
        campaignParticipationId,
        userId
      }).resolves({});
      campaignParticipationResultSerializer.serialize.withArgs({}).returns('ok');

      // when
      const response = await campaignParticipationResultController.get({
        params: { id: campaignParticipationId },
        auth: {
          credentials: { userId }
        }
      });

      // then
      expect(response).to.equal('ok');
    });

  });
});
