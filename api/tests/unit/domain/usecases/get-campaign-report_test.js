const { expect, sinon } = require('$root/tests/test-helper');
const getCampaignReport = require('$root/lib/domain/usecases/get-campaign-report');
const CampaignReport = require('$root/lib/domain/models/CampaignReport');

describe('Unit | UseCase | get-campaign-report', () => {

  const campaignId = 1;
  let campaignParticipationRepository;

  beforeEach(() => {
    campaignParticipationRepository = { count: sinon.stub() };
  });

  it('should get the campaignReport', async () => {
    // given
    campaignParticipationRepository.count.withArgs({ campaignId }).resolves(7);
    campaignParticipationRepository.count.withArgs({ campaignId, isShared: true }).resolves(4);

    // when
    const campaignReport = await getCampaignReport({ campaignId, campaignParticipationRepository });

    // then
    expect(campaignReport).to.be.an.instanceOf(CampaignReport);
    expect(campaignReport.id).to.be.equal(campaignId);
    expect(campaignReport.participationsCount).to.be.equal(7);
    expect(campaignReport.sharedParticipationsCount).to.be.equal(4);
  });

});
