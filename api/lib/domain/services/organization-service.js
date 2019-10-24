const { sampleSize, random, uniqBy, concat, orderBy } = require('lodash');
const organizationRepository = require('../../infrastructure/repositories/organization-repository');
const targetProfileRepository = require('../../infrastructure/repositories/target-profile-repository');

function _randomLetters(count) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXZ'.split('');
  return sampleSize(letters, count).join('');
}

function _extractProfilesSharedWithOrganization(organization) {
  const targetProfileSharesNonOutdated = organization.targetProfileShares.filter((targetProfileShare) => {
    return !targetProfileShare.targetProfile.outdated;
  });

  return targetProfileSharesNonOutdated.map((targetProfileShareNonOutdated) => {
    return targetProfileShareNonOutdated.targetProfile;
  });
}

function _generateOrganizationCode() {
  let code = _randomLetters(4);
  code += random(0, 9) + '' + random(0, 9);
  return code;
}

module.exports = {

  generateUniqueOrganizationCode({ organizationRepository }) {
    const code = _generateOrganizationCode();
    return organizationRepository.isCodeAvailable(code)
      .then(() => code)
      .catch(() => this.generateUniqueOrganizationCode({ organizationRepository }));
  },

  async findAllTargetProfilesAvailableForOrganization(organizationId) {
    const organization = await organizationRepository.get(organizationId);
    const targetProfilesOrganizationCanUse = await targetProfileRepository.findAllTargetProfileOrganizationCanUse(organizationId);
    const targetProfileSharesWithOrganization = _extractProfilesSharedWithOrganization(organization);
    const allAvailableTargetProfiles = orderBy(concat(targetProfilesOrganizationCanUse, targetProfileSharesWithOrganization), ['isPublic', 'name']);
    return uniqBy(allAvailableTargetProfiles, 'id');
  },

};
