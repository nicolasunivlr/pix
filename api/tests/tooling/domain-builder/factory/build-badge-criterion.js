const BadgeCriterion = require('../../../../lib/domain/models/BadgeCriterion');

module.exports = function buildBadgeCriterion({
  id = 1,
  scope = BadgeCriterion.SCOPES.CAMPAIGN_PARTICIPATION,
  threshold = 40,
  partnerCompetenceIds = [],
} = {}) {
  return new BadgeCriterion({
    id,
    scope,
    threshold,
    partnerCompetenceIds,
  });
};
