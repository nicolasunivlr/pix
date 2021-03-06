const Bookshelf = require('../bookshelf');

const modelName = 'CertificationCenter';

module.exports = Bookshelf.model(modelName, {

  tableName: 'certification-centers',
  hasTimestamps: ['createdAt', null],

  certificationCenterMemberships() {
    return this.hasMany('CertificationCenterMembership', 'certificationCenterId');
  },

}, {
  modelName,
});
