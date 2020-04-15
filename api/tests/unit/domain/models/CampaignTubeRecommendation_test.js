const CampaignTubeRecommendation = require('$root/lib/domain/models/CampaignTubeRecommendation');
const { expect } = require('$root/tests/test-helper');

describe('Unit | Domain | Models | CampaignTubeRecommendation', () => {

  describe('@id', () => {

    it('should return a unique identifier that is the concatenation of "campaignId" and "tubeId"', () => {
      // given
      const campaignId = 123;
      const tubeId = 'recTube';
      const campaignTubeRecommendation = new CampaignTubeRecommendation({ campaignId, tubeId });

      // when
      const campaignTubeRecommendationId = campaignTubeRecommendation.id;

      // then
      expect(campaignTubeRecommendationId).to.equal('123_recTube');
    });
  });

});
