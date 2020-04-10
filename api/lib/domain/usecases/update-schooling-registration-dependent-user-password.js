const _ = require('lodash');
const { UserNotAuthorizedToUpdateStudentPasswordError, UserNotAuthorizedToUpdatePasswordError } = require('../errors');

module.exports = async function updateSchoolingRegistrationDependentUserPassword({
  userId,
  organizationId,
  schoolingRegistrationId,
  passwordGenerator,
  encryptionService,
  userRepository,
  schoolingRegistrationRepository
}) {
  const userWithMemberships = await userRepository.getWithMemberships(userId);
  const schoolingRegistration = await schoolingRegistrationRepository.get(schoolingRegistrationId);

  if (!userWithMemberships.hasAccessToOrganization(organizationId) || schoolingRegistration.organizationId !== organizationId) {
    throw new UserNotAuthorizedToUpdateStudentPasswordError(`Cet utilisateur ${userId} ne peut pas modifier le mot de passe de l'éleve car il n'appartient pas à l'organisation ${organizationId}`);
  }

  const userStudent = await userRepository.get(schoolingRegistration.userId);
  if (_.isEmpty(userStudent.username) && _.isEmpty(userStudent.email)) {
    throw new UserNotAuthorizedToUpdatePasswordError(`Le changement de mot de passe n'est possible que si l'utilisateur ${schoolingRegistration.userId} utilise les méthodes d'authentification email ou identifiant`);
  }

  const generatedPassword = passwordGenerator.generate();
  const hashedPassword = await encryptionService.hashPassword(generatedPassword);

  await userRepository.updateTemporaryPassword(userStudent.id, hashedPassword);

  return generatedPassword;
};

