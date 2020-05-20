import ApplicationAdapter from './application';

export default class CampaignProfilesCollectionParticipationSummary extends ApplicationAdapter {

  urlForFindAll(modelName, { adapterOptions }) {
    const { campaignId } = adapterOptions;
    return `${this.host}/${this.namespace}/campaigns/${campaignId}/profiles-collection/participations`;
  }

}