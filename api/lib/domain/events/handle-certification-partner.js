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

  const hasAcquiredBadgeClea = await badgeAcquisitionRepository.hasAcquiredBadgeWithKey({
    badgeKey: Badge.keys.PIX_EMPLOI_CLEA,
    userId: certificationScoringEvent.userId,
  });

  const cleaPartnerAcquisition = new CertificationPartnerAcquisition({
    certificationCourseId: certificationScoringEvent.certificationCourseId,
    partnerKey: Badge.keys.PIX_EMPLOI_CLEA,
  });

  if (cleaPartnerAcquisition.hasAcquiredCertification({ hasAcquiredBadge: hasAcquiredBadgeClea, percentageCorrectAnswers: certificationScoringEvent.percentageCorrectAnswers })) {
    await certificationPartnerAcquisitionRepository.save(cleaPartnerAcquisition, domainTransaction);
  }
  return;
};
//
// async function _getPartnerCertification({ badgeAcquisitionRepository, userId, certificationCourseId, percentageCorrectAnswers }) {
//   const hasAcquiredBadgeClea = await badgeAcquisitionRepository.hasAcquiredBadgeWithKey({
//     badgeKey: Badge.keys.PIX_EMPLOI_CLEA,
//     userId
//   });
//
//   const cleaPartnerAcquisition = new CertificationPartnerAcquisition({
//     certificationCourseId,
//     partnerKey: Badge.keys.PIX_EMPLOI_CLEA,
//   });
//
//   return cleaPartnerAcquisition;
// }

module.exports = handleCertificationAcquisitionForPartner;
