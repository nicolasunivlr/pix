const campaignParticipationSerializer = require('../../infrastructure/serializers/jsonapi/campaign-participation-serializer');
const campaignParticipationOverviewSerializer = require('../../infrastructure/serializers/jsonapi/campaign-participation-overview-serializer');
const certificationEligibilitySerializer = require('../../infrastructure/serializers/jsonapi/certification-eligibility-serializer');
const membershipSerializer = require('../../infrastructure/serializers/jsonapi/membership-serializer');
const scorecardSerializer = require('../../infrastructure/serializers/jsonapi/scorecard-serializer');
const profileSerializer = require('../../infrastructure/serializers/jsonapi/profile-serializer');
const participantResultSerializer = require('../../infrastructure/serializers/jsonapi/participant-result-serializer');
const sharedProfileForCampaignSerializer = require('../../infrastructure/serializers/jsonapi/shared-profile-for-campaign-serializer');
const userSerializer = require('../../infrastructure/serializers/jsonapi/user-serializer');
const userDetailsForAdminSerializer = require('../../infrastructure/serializers/jsonapi/user-details-for-admin-serializer');
const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');
const { extractLocaleFromRequest } = require('../../infrastructure/utils/request-response-utils');

const usecases = require('../../domain/usecases');

module.exports = {

  save(request, h) {
    const campaignCode = request.payload.meta ? request.payload.meta['campaign-code'] : null;
    const user = userSerializer.deserialize(request.payload);
    const locale = extractLocaleFromRequest(request);

    const password = request.payload.data.attributes.password;

    return usecases.createUser({
      user,
      password,
      campaignCode,
      locale,
    })
      .then((savedUser) => {
        return h.response(userSerializer.serialize(savedUser)).created();
      });
  },

  getCurrentUser(request) {
    const authenticatedUserId = request.auth.credentials.userId;

    return usecases.getCurrentUser({ authenticatedUserId })
      .then(userSerializer.serialize);
  },

  async getUserDetailsForAdmin(request) {
    const userId = request.params.id;
    const userDetailsForAdmin = await usecases.getUserDetailsForAdmin({ userId });
    return userDetailsForAdminSerializer.serialize(userDetailsForAdmin);
  },

  async updateEmail(request, h) {
    const userId = request.params.id;
    const authenticatedUserId = request.auth.credentials.userId;
    const { email, password } = request.payload.data.attributes;
    const locale = extractLocaleFromRequest(request);

    await usecases.updateUserEmail({
      email,
      userId,
      authenticatedUserId,
      password,
      locale,
    });

    return h.response({}).code(204);
  },

  async updatePassword(request) {
    const userId = request.params.id;
    const password = request.payload.data.attributes.password;

    const updatedUser = await usecases.updateUserPassword({
      userId,
      password,
      temporaryKey: request.query['temporary-key'] || '',
    });

    return userSerializer.serialize(updatedUser);
  },

  async updateUserDetailsForAdministration(request) {
    const userId = request.params.id;
    const userDetailsForAdministration = userDetailsForAdminSerializer.deserialize(request.payload);

    const updatedUser = await usecases.updateUserDetailsForAdministration({
      userId,
      userDetailsForAdministration,
    });

    return userDetailsForAdminSerializer.serialize(updatedUser);
  },

  async acceptPixLastTermsOfService(request) {
    const authenticatedUserId = request.auth.credentials.userId;

    const updatedUser = await usecases.acceptPixLastTermsOfService({
      userId: authenticatedUserId,
    });

    return userSerializer.serialize(updatedUser);
  },

  async changeLang(request) {
    const authenticatedUserId = request.auth.credentials.userId;
    const lang = request.params.lang;
    const updatedUser = await usecases.changeUserLang({
      userId: authenticatedUserId,
      lang,
    });

    return userSerializer.serialize(updatedUser);
  },

  async acceptPixOrgaTermsOfService(request) {
    const authenticatedUserId = request.auth.credentials.userId;

    const updatedUser = await usecases.acceptPixOrgaTermsOfService({
      userId: authenticatedUserId,
    });

    return userSerializer.serialize(updatedUser);
  },

  async acceptPixCertifTermsOfService(request) {
    const authenticatedUserId = request.auth.credentials.userId;

    const updatedUser = await usecases.acceptPixCertifTermsOfService({
      userId: authenticatedUserId,
    });

    return userSerializer.serialize(updatedUser);
  },

  async rememberUserHasSeenAssessmentInstructions(request) {
    const authenticatedUserId = request.auth.credentials.userId;

    const updatedUser = await usecases.rememberUserHasSeenAssessmentInstructions({ userId: authenticatedUserId });
    return userSerializer.serialize(updatedUser);
  },

  async rememberUserHasSeenNewDashboardInfo(request) {
    const authenticatedUserId = request.auth.credentials.userId;

    const updatedUser = await usecases.rememberUserHasSeenNewDashboardInfo({ userId: authenticatedUserId });
    return userSerializer.serialize(updatedUser);
  },

  getMemberships(request) {
    const authenticatedUserId = request.auth.credentials.userId;

    return usecases.getUserWithMemberships({ userId: authenticatedUserId })
      .then((user) => membershipSerializer.serialize(user.memberships));
  },

  async findPaginatedFilteredUsers(request) {
    const options = queryParamsUtils.extractParameters(request.query);

    const { models: users, pagination } = await usecases.findPaginatedFilteredUsers({
      filter: options.filter,
      page: options.page,
    });
    return userSerializer.serialize(users, pagination);
  },

  getCampaignParticipations(request) {
    const authenticatedUserId = request.auth.credentials.userId;

    return usecases.findLatestOngoingUserCampaignParticipations({ userId: authenticatedUserId })
      .then(campaignParticipationSerializer.serialize);
  },

  async getCampaignParticipationOverviews(request) {
    const authenticatedUserId = request.auth.credentials.userId;
    const query = queryParamsUtils.extractParameters(request.query);

    const userCampaignParticipationOverviews = await usecases.findUserCampaignParticipationOverviews({
      userId: authenticatedUserId,
      states: query.filter.states,
      page: query.page,
    });

    return campaignParticipationOverviewSerializer.serializeForPaginatedList(userCampaignParticipationOverviews);
  },

  async isCertifiable(request) {
    const authenticatedUserId = request.auth.credentials.userId;

    const certificationEligibility = await usecases.getUserCertificationEligibility({ userId: authenticatedUserId });
    return certificationEligibilitySerializer.serialize(certificationEligibility);
  },

  getProfile(request) {
    const authenticatedUserId = request.auth.credentials.userId;
    const locale = extractLocaleFromRequest(request);

    return usecases.getUserProfile({ userId: authenticatedUserId, locale })
      .then(profileSerializer.serialize);
  },

  resetScorecard(request) {
    const authenticatedUserId = request.auth.credentials.userId;
    const competenceId = request.params.competenceId;

    return usecases.resetScorecard({ userId: authenticatedUserId, competenceId })
      .then(scorecardSerializer.serialize);
  },

  getUserCampaignParticipationToCampaign(request) {
    const authenticatedUserId = request.auth.credentials.userId;
    const campaignId = request.params.campaignId;

    return usecases.getUserCampaignParticipationToCampaign({ userId: authenticatedUserId, campaignId })
      .then((campaignParticipation) => campaignParticipationSerializer.serialize(campaignParticipation));
  },

  async getUserProfileSharedForCampaign(request) {
    const authenticatedUserId = request.auth.credentials.userId;
    const campaignId = request.params.campaignId;
    const locale = extractLocaleFromRequest(request);

    const sharedProfileForCampaign = await usecases.getUserProfileSharedForCampaign({
      userId: authenticatedUserId,
      campaignId,
      locale,
    });

    return sharedProfileForCampaignSerializer.serialize(sharedProfileForCampaign);
  },

  async getUserCampaignAssessmentResult(request) {
    const authenticatedUserId = request.auth.credentials.userId;
    const campaignId = request.params.campaignId;
    const locale = extractLocaleFromRequest(request);

    const campaignAssessmentResult = await usecases.getUserCampaignAssessmentResult({
      userId: authenticatedUserId,
      campaignId,
      locale,
    });

    return participantResultSerializer.serialize(campaignAssessmentResult);
  },

  async anonymizeUser(request, h) {
    const userId = request.params.id;
    await usecases.anonymizeUser({ userId });
    return h.response({}).code(204);
  },

  async dissociateSchoolingRegistrations(request) {
    const userId = request.params.id;
    const userDetailsForAdmin = await usecases.dissociateSchoolingRegistrations({ userId });
    return userDetailsForAdminSerializer.serialize(userDetailsForAdmin);
  },

  async removeAuthenticationMethod(request, h) {
    const userId = request.params.id;
    const type = request.payload.data.attributes.type;
    await usecases.removeAuthenticationMethod({ userId, type });
    return h.response().code(204);
  },

};
