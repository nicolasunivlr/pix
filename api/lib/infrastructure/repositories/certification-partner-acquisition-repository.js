const CertificationPartnerAcquisitionBookshelf = require('../data/certification-partner-acquisition');

module.exports = {

  async save({
    certificationCourseId,
    partnerKey,
  }, domainTransaction = {}) {
    return await new CertificationPartnerAcquisitionBookshelf({
      certificationCourseId,
      partnerKey,
    }).save(null , { transacting: domainTransaction.knexTransaction });
  },
};
