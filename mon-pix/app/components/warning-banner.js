import Component from '@glimmer/component';
import ENV from 'mon-pix/config/environment';

export default class WarningBanner extends Component {
  isStagingBannerEnabled = ENV.APP.IS_STAGING_BANNER_ENABLED;
  isProdProblemBannerEnabled = ENV.APP.IS_PROD_HAVING_PROBLEMS_BANNER_ENABLED;

  get displayBanner() {
    return this.isStagingBannerEnabled || this.isProdProblemBannerEnabled;
  }
}
