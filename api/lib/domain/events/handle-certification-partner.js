const Badge = require('../models/Badge');
const CertificationPartnerAcquisition = require('../models/CertificationPartnerAcquisition');

const handleCertificationAcquisitionForPartner = async function({
  certificationScoringEvent,
  domainTransaction,
  badgeAcquisitionRepository,
  certificationPartnerAcquisitionRepository,
}) {
  if (!certificationScoringEvent.isCertification) {
    return;
  }

  const partnerCertification = await _getPartnerCertification({
    badgeAcquisitionRepository,
    userId: certificationScoringEvent.userId,
    certificationCourseId: certificationScoringEvent.certificationCourseId,
    percentageCorrectAnswers: certificationScoringEvent.percentageCorrectAnswers,
  });

  if (partnerCertification.hasAcquiredCertification()) {
    await certificationPartnerAcquisitionRepository.save(partnerCertification, domainTransaction);
  }
  return;
};

async function _getPartnerCertification({ badgeAcquisitionRepository, userId, certificationCourseId, percentageCorrectAnswers }) {
  const hasAcquiredBadgeClea = await badgeAcquisitionRepository.hasAcquiredBadgeWithKey({
    badgeKey: Badge.keys.PIX_EMPLOI_CLEA,
    userId
  });

  const cleaPartnerAcquisition = new CertificationPartnerAcquisition({
    certificationCourseId,
    partnerKey: Badge.keys.PIX_EMPLOI_CLEA,
    hasAcquiredBadge: hasAcquiredBadgeClea,
    percentageCorrectAnswers,
  });

  return cleaPartnerAcquisition;
}

module.exports = handleCertificationAcquisitionForPartner;
