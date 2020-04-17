const { NotFoundError } = require('../errors');

module.exports = async function getCertificationOfficerName({
  userId,
  userRepository,
}) {
  const integerUserId = parseInt(userId);
  if (!Number.isFinite(integerUserId)) {
    throw new NotFoundError(`L'utilisateur ${userId} n'existe pas.`);
  }

  return userRepository.get(userId);
};
