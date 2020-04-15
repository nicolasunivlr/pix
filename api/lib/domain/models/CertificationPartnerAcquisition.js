const CERTIF_GREEN_ZONE = 'green_zone';
const CERTIF_RED_ZONE = 'red_zone';

const { MINIMUM_REPRODUCTIBILITY_RATE_TO_BE_CERTIFIED, MINIMUM_REPRODUCTIBILITY_RATE_TO_BE_TRUSTED } = require('../constants');

class CertificationPartnerAcquisition {
  constructor(
    {
      certificationCourseId,
      partnerKey,

    } = {}) {
    this.certificationCourseId = certificationCourseId;
    this.partnerKey = partnerKey;
  }

  hasAcquiredCertification({
    hasAcquiredBadge = false,
    percentageCorrectAnswers = 0 }) {
    if (hasAcquiredBadge) {
      switch (this._getPartnerCertificationObtentionArea(percentageCorrectAnswers)) {
        case CERTIF_GREEN_ZONE:
          return true;
        case CERTIF_RED_ZONE:
          return false;
        // case ZONE_GRISE
        // zone grise
      }
    }

    return false;
  }

  _getPartnerCertificationObtentionArea(percentageCorrectAnswers) {
    if (percentageCorrectAnswers >= MINIMUM_REPRODUCTIBILITY_RATE_TO_BE_TRUSTED) {
      return CERTIF_GREEN_ZONE;
    } else if (percentageCorrectAnswers <= MINIMUM_REPRODUCTIBILITY_RATE_TO_BE_CERTIFIED) {
      return CERTIF_RED_ZONE;
    }

    return null;
  }
}

module.exports = CertificationPartnerAcquisition;
