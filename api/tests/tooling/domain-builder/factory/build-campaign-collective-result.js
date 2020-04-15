const faker = require('faker');
const CampaignCollectiveResult = require('$root/lib/domain/models/CampaignCollectiveResult');

module.exports = function buildCampaignCollectiveResult(
  {
    id = faker.random.number(),
    campaignCompetenceCollectiveResults = [],
  } = {}) {
  return new CampaignCollectiveResult({
    id,
    campaignCompetenceCollectiveResults,
  });
};
