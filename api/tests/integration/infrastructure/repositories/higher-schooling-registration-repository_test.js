const _ = require('lodash');
const { expect, databaseBuilder, knex, catchErr, domainBuilder } = require('../../../test-helper');
const higherSchoolingRegistrationRepository = require('../../../../lib/infrastructure/repositories/higher-schooling-registration-repository');
const SchoolingRegistration = require('../../../../lib/domain/models/SchoolingRegistration');
const { SchoolingRegistrationsCouldNotBeSavedError } = require('../../../../lib/domain/errors');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');

describe('Integration | Infrastructure | Repository | higher-schooling-registration-repository', () => {
  describe('#findByOrganizationIdAndStudentNumber', () => {

    let organization;
    const studentNumber = '123A';

    beforeEach(async () => {
      organization = databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        studentNumber,
        isSupernumerary: true,
      });
      databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        studentNumber,
        isSupernumerary: true,
      });
      await databaseBuilder.commit();
    });

    it('should return found schoolingRegistrations with student number', async () => {
      // when
      const result = await higherSchoolingRegistrationRepository.findByOrganizationIdAndStudentNumber({ organizationId: organization.id, studentNumber });

      // then
      expect(result.length).to.be.equal(2);
    });

    it('should return empty array when there is no schooling-registrations with the given student number', async () => {
      // when
      const result = await higherSchoolingRegistrationRepository.findByOrganizationIdAndStudentNumber({ organizationId: organization.id, studentNumber: '123B' });

      // then
      expect(result.length).to.be.equal(0);
    });

    it('should return empty array when there is no schooling-registrations with the given organizationId', async () => {
      // when
      const result = await higherSchoolingRegistrationRepository.findByOrganizationIdAndStudentNumber({ organizationId: '999', studentNumber });

      // then
      expect(result.length).to.be.equal(0);
    });
  });

  describe('#findOneRegisteredByOrganizationIdAndUserData', () => {

    let organizationId;
    const studentNumber = '1234567';
    const birthdate = '2000-03-31';

    beforeEach(() => {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      return databaseBuilder.commit();
    });

    context('When there is no registered schooling registrations', () => {
      beforeEach(async () => {
        databaseBuilder.factory.buildSchoolingRegistration({ organizationId, studentNumber, birthdate });
        await databaseBuilder.commit();
      });

      it('should return null', async () => {
        // when
        const result = await higherSchoolingRegistrationRepository.findOneRegisteredByOrganizationIdAndUserData({ organizationId, reconciliationInfo: { birthdate, studentNumber: 'XXX' } });

        // then
        expect(result).to.equal(null);
      });
    });

    context('When there is no schooling registrations for the organization', () => {
      beforeEach(async () => {
        const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildSchoolingRegistration({ organizationId: otherOrganizationId, studentNumber, birthdate });
        await databaseBuilder.commit();
      });

      it('should return null', async () => {
        // when
        const result = await higherSchoolingRegistrationRepository.findOneRegisteredByOrganizationIdAndUserData({ organizationId, reconciliationInfo: { birthdate, studentNumber } });

        // then
        expect(result).to.equal(null);
      });
    });

    context('When there is no schooling registrations with given student number', () => {
      beforeEach(async () => {
        databaseBuilder.factory.buildSchoolingRegistration({ organizationId, studentNumber: '999', birthdate });
        await databaseBuilder.commit();
      });

      it('should return null', async () => {
        // when
        const result = await higherSchoolingRegistrationRepository.findOneRegisteredByOrganizationIdAndUserData({ organizationId, reconciliationInfo: { birthdate, studentNumber } });

        // then
        expect(result).to.equal(null);
      });
    });

    context('When there is no schooling registrations with given birthdate', () => {
      beforeEach(async () => {
        databaseBuilder.factory.buildSchoolingRegistration({ organizationId, studentNumber, birthdate: '2000-03-30' });
        await databaseBuilder.commit();
      });

      it('should return null', async () => {
        // when
        const result = await higherSchoolingRegistrationRepository.findOneRegisteredByOrganizationIdAndUserData({ organizationId, reconciliationInfo: { birthdate, studentNumber } });

        // then
        expect(result).to.equal(null);
      });
    });

    context('When there is a matching schooling registrations with student number and birthdate', () => {
      let expectedSchoolingRegistrationId;
      beforeEach(async () => {
        expectedSchoolingRegistrationId = databaseBuilder.factory.buildSchoolingRegistration({ organizationId, studentNumber, birthdate }).id;
        await databaseBuilder.commit();
      });

      it('should return the schooling registration', async () => {
        // when
        const schoolingRegistration = await higherSchoolingRegistrationRepository.findOneRegisteredByOrganizationIdAndUserData({ organizationId, reconciliationInfo: { studentNumber, birthdate } });

        // then
        expect(schoolingRegistration).to.be.an.instanceOf(SchoolingRegistration);
        expect(schoolingRegistration.id).to.equal(expectedSchoolingRegistrationId);
      });
    });
  });

  describe('#updateStudentNumber', () => {
    it('should update the student number', async () => {
      // given
      const id = databaseBuilder.factory.buildSchoolingRegistration({ studentNumber: 12345 }).id;
      await databaseBuilder.commit();

      // when
      await higherSchoolingRegistrationRepository.updateStudentNumber(id, 54321);
      const [schoolingRegistration] = await knex.select('studentNumber').from('schooling-registrations').where({ id });
      expect(schoolingRegistration.studentNumber).to.equal('54321');
    });
  });

  describe('#save', () => {
    context('when there is a schooling registration for the given id', () => {
      it('update the schooling-registration ', async () => {

        const organization = databaseBuilder.factory.buildOrganization();
        const user = databaseBuilder.factory.buildUser();
        const registrationAttributes = {
          firstName: 'O-Ren',
          middleName: 'Unknown',
          thirdName: 'Unknown',
          lastName: 'Ishii',
          preferredLastName: 'Cottonmouth',
          studentNumber: '4',
          email: 'ishii@example.net',
          birthdate: '1990-07-01',
          diploma: 'DUT',
          department: 'The Crazy 88',
          educationalTeam: 'Bill',
          group: 'Tokyo Crime World',
          studyScheme: 'I have always no idea what it\'s like.',
        };

        const higherSchoolingRegistration = domainBuilder.buildHigherSchoolingRegistration({ organization, ...registrationAttributes });
        const higherSchoolingRegistrationId = databaseBuilder.factory.buildSchoolingRegistration({
          organizationId: organization.id,
          studentNumber: registrationAttributes.studentNumber,
          userId: user.id,
        }).id;
        await databaseBuilder.commit();

        higherSchoolingRegistration.id = higherSchoolingRegistrationId;
        await higherSchoolingRegistrationRepository.save(higherSchoolingRegistration);

        const [schoolingRegistration] = await knex('schooling-registrations').select('*', 'status AS studyScheme').where({ id: higherSchoolingRegistrationId });
        expect(schoolingRegistration).to.include({
          ...registrationAttributes,
          isSupernumerary: false,
          userId: user.id,
        });
      });
    });

    context('when there is no schooling registrations for the given id', () => {
      it('throws an error', async () => {

        const organization = databaseBuilder.factory.buildOrganization();
        const registrationAttributes = {
          organization,
          firstName: 'O-Ren',
          lastName: 'Ishii',
          studentNumber: '1',
          birthdate: '2000-01-01',
          isSupernumerary: false,
        };

        const higherSchoolingRegistration = domainBuilder.buildHigherSchoolingRegistration(registrationAttributes);
        databaseBuilder.factory.buildSchoolingRegistration({ organizationId: registrationAttributes.organizationId }).id;
        databaseBuilder.factory.buildSchoolingRegistration({ studentNumber: registrationAttributes.studentNumber }).id;
        await databaseBuilder.commit();

        const error = await catchErr(higherSchoolingRegistrationRepository.save)(higherSchoolingRegistration);

        expect(error).to.be.an.instanceOf(SchoolingRegistrationsCouldNotBeSavedError);
      });
    });
  });

  describe('#saveNonSupernumerary', () => {
    context('when there is a non supernumerary schooling registration for the given student number and organization id', () => {
      it('update the schooling-registration ', async () => {

        const organization = databaseBuilder.factory.buildOrganization();
        const user = databaseBuilder.factory.buildUser();
        const registrationAttributes = {
          firstName: 'O-Ren',
          lastName: 'Ishii',
          studentNumber: '4',
          birthdate: '1990-07-01',
          studyScheme: 'I have always no idea what it\'s like.',
        };

        const higherSchoolingRegistration = domainBuilder.buildHigherSchoolingRegistration({ organization, ...registrationAttributes });
        const higherSchoolingRegistrationId = databaseBuilder.factory.buildSchoolingRegistration({
          organizationId: organization.id,
          studentNumber: registrationAttributes.studentNumber,
          userId: user.id,
          isSupernumerary: false,
        }).id;
        await databaseBuilder.commit();

        await higherSchoolingRegistrationRepository.saveNonSupernumerary(higherSchoolingRegistration);

        const [schoolingRegistration] = await knex('schooling-registrations').select('*', 'status AS studyScheme').where({ id: higherSchoolingRegistrationId });
        expect(schoolingRegistration).to.include({
          ...registrationAttributes,
          isSupernumerary: false,
          userId: user.id,
        });
      });
    });

    context('when there is a supernumerary schooling registration for the given student number and organization id', () => {
      it('throws an error ', async () => {

        const organization = databaseBuilder.factory.buildOrganization();
        const user = databaseBuilder.factory.buildUser();
        const registrationAttributes = {
          organization,
          firstName: 'O-Ren',
          lastName: 'Ishii',
          studentNumber: '4',
          birthdate: '1990-07-01',
          studyScheme: 'I have always no idea what it\'s like.',
        };

        const higherSchoolingRegistration = domainBuilder.buildHigherSchoolingRegistration(registrationAttributes);
        databaseBuilder.factory.buildSchoolingRegistration({
          organizationId: registrationAttributes.organizationId,
          studentNumber: registrationAttributes.studentNumber,
          userId: user.id,
          isSupernumerary: true,
        }).id;
        await databaseBuilder.commit();

        const error = await catchErr(higherSchoolingRegistrationRepository.saveNonSupernumerary)(higherSchoolingRegistration);

        expect(error).to.be.an.instanceOf(SchoolingRegistrationsCouldNotBeSavedError);
      });
    });

    context('when there is no schooling registrations for the given student number and organization id', () => {
      it('throws an error', async () => {

        const organization = databaseBuilder.factory.buildOrganization();
        const registrationAttributes = {
          organization,
          firstName: 'O-Ren',
          lastName: 'Ishii',
          studentNumber: '1',
          birthdate: '2000-01-01',
          isSupernumerary: false,
        };

        const higherSchoolingRegistration = domainBuilder.buildHigherSchoolingRegistration(registrationAttributes);
        databaseBuilder.factory.buildSchoolingRegistration({ organizationId: registrationAttributes.organizationId }).id;
        databaseBuilder.factory.buildSchoolingRegistration({ studentNumber: registrationAttributes.studentNumber }).id;
        await databaseBuilder.commit();

        const error = await catchErr(higherSchoolingRegistrationRepository.saveNonSupernumerary)(higherSchoolingRegistration);

        expect(error).to.be.an.instanceOf(SchoolingRegistrationsCouldNotBeSavedError);
      });
    });
  });

  describe('#batchCreate', () => {
    afterEach(() => {
      return knex('schooling-registrations').delete();
    });

    context('when there is no schooling registrations for the given organizationId and student number', () => {
      it('creates the schooling-registration ', async () => {

        const organization = databaseBuilder.factory.buildOrganization();
        const higherSchoolingRegistration1 = domainBuilder.buildHigherSchoolingRegistration({
          organization,
          firstName: 'O-Ren',
          lastName: 'Ishii',
          studentNumber: '4',
          birthdate: '1990-07-01',
          isSupernumerary: false,
        });
        const higherSchoolingRegistration2 = domainBuilder.buildHigherSchoolingRegistration({
          organization,
          firstName: 'John',
          lastName: 'Rambo',
          studentNumber: '5',
          birthdate: '1990-07-02',
          isSupernumerary: false,
        });
        await databaseBuilder.commit();

        await higherSchoolingRegistrationRepository.batchCreate([higherSchoolingRegistration1, higherSchoolingRegistration2]);

        const results = await knex('schooling-registrations')
          .select('*', 'status AS studyScheme')
          .where({ organizationId: organization.id })
          .orderBy('studentNumber');

        expect(results.length).to.equal(2);
        expect(results[0].studentNumber).to.equal('4');
        expect(results[1].studentNumber).to.equal('5');
      });

      context('when there is schooling registrations for the given organizationId and student number', () => {
        it('throws an error', async () => {

          const organization = databaseBuilder.factory.buildOrganization();

          const higherSchoolingRegistration = domainBuilder.buildHigherSchoolingRegistration({
            organization,
            firstName: 'O-Ren',
            lastName: 'Ishii',
            studentNumber: '4',
            birthdate: '1990-07-01',
            isSupernumerary: false,
          });

          databaseBuilder.factory.buildSchoolingRegistration({ organizationId: organization.id, studentNumber: '4' }).id;
          await databaseBuilder.commit();

          const error = await catchErr(higherSchoolingRegistrationRepository.batchCreate)([higherSchoolingRegistration]);

          expect(error).to.be.an.instanceOf(SchoolingRegistrationsCouldNotBeSavedError);
        });
      });
    });
  });

  describe('#findStudentNumbersNonSupernumerary', () => {
    let organization;
    const studentNumber = '123A';

    beforeEach(async () => {
      organization = databaseBuilder.factory.buildOrganization();
    });

    it('should return a student numbers array of non super numerary registrations for the organization', async () => {
      // given
      databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        isSupernumerary: true,
      });
      databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        studentNumber: studentNumber,
        isSupernumerary: false,
      });
      await databaseBuilder.commit();

      // when
      const result = await DomainTransaction.execute((domainTransaction) => {
        return higherSchoolingRegistrationRepository.findStudentNumbersNonSupernumerary(
          organization.id,
          domainTransaction,
        );
      });

      // then
      expect(result).to.deep.equal([studentNumber]);
    });

    it('should return an empty array if non super numerary registrations don’t exist for the organization', async () => {
      // given
      databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        isSupernumerary: true,
      });
      await databaseBuilder.commit();

      // when
      const result = await DomainTransaction.execute((domainTransaction) => {
        return higherSchoolingRegistrationRepository.findStudentNumbersNonSupernumerary(
          organization.id,
          domainTransaction,
        );
      });

      // then
      expect(result).to.deep.equal([]);
    });
  });

  describe('#findSupernumerary', () => {
    let organization;

    beforeEach(async () => {
      organization = databaseBuilder.factory.buildOrganization();
    });

    it('should return a registration array of super numerary registrations for the organization', async () => {
      // given
      const registration = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        isSupernumerary: true,
      });
      databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        isSupernumerary: false,
      });
      await databaseBuilder.commit();

      // when
      const result = await DomainTransaction.execute((domainTransaction) => {
        return higherSchoolingRegistrationRepository.findSupernumerary(
          organization.id,
          domainTransaction,
        );
      });

      // then
      const expectedRegistration = _.pick(registration, ['studentNumber', 'firstName', 'id', 'lastName', 'birthdate']);
      expect(result).to.deep.equal([expectedRegistration]);
    });

    it('should return an empty array of if super numerary registrations don’t exist for the organization', async () => {
      // given
      databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        isSupernumerary: false,
      });
      await databaseBuilder.commit();

      // when
      const result = await DomainTransaction.execute((domainTransaction) => {
        return higherSchoolingRegistrationRepository.findSupernumerary(
          organization.id,
          domainTransaction,
        );
      });

      // then
      expect(result).to.deep.equal([]);
    });
  });
});
