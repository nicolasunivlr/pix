const { expect, databaseBuilder, domainBuilder } = require('../../test-helper');
const _ = require('lodash');

const BookshelfOrganization = require('../../../lib/infrastructure/data/organization');
const Organization = require('../../../lib/domain/models/Organization');

const script = require('../../../scripts/byDB-create-or-update-sco-organizations');

describe('Acceptance | Scripts | byDB-create-or-update-sco-organizations.js', () => {

  describe('#findAllOrganizationsWithExtarnalId', () => {

    let numberOfOrganizations;

    beforeEach(async () => {
      numberOfOrganizations = await BookshelfOrganization.count()
        .then((number) => parseInt(number, 10));

      databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildOrganization();

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should find all organizations with an externalId from database', async () => {
      // when
      const foundOrganizations = await script.findAllOrganizationsWithExternalId();

      // then
      expect(foundOrganizations.length).to.equal(numberOfOrganizations + 3);
      expect(foundOrganizations[0]).to.be.an.instanceOf(Organization);
    });
  });

  describe('#updateOrganizationName', () => {

    let organizationId;

    beforeEach(async () => {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should update organization name in database', async () => {
      // given
      const name = 'newName';

      // when
      const updatedOrganization = await script.updateOrganizationName({ organizationId, name });

      // then
      expect(updatedOrganization).to.be.an.instanceOf(Organization);
      expect(updatedOrganization.name).to.deep.equal(name);
    });
  });

  describe('#createOrganizationSco', () => {

    it('should create an organization in database', async () => {
      // given
      const externalId = 'new externalId';
      const name = 'new name';
      const organization = domainBuilder.buildOrganization({ externalId, name });
      const type = 'SCO';

      // when
      const createdOrganization = await script.createOrganizationSco(organization);

      // then
      expect(createdOrganization).to.be.an.instanceOf(Organization);
      expect(createdOrganization).to.include({ externalId, name, type });
    });
  });

  describe('#createOrUpdateOrganizations', () => {

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should create an organization and update two in database', async () => {
      // given
      const externalId_1 = 'ABCDEF';
      const externalId_2 = 'GHIJKL';
      const name_1 = 'organization1';
      const name_2 = 'organization2';

      const new_externalId = 'NEWORGA';
      const new_name = 'new organization';
      const provinceCode = new_externalId.substring(0, 3);
      const type = 'SCO';

      const organizations = [
        databaseBuilder.factory.buildOrganization({ externalId: externalId_1 }),
        databaseBuilder.factory.buildOrganization({ externalId: externalId_2 })
      ];

      const csvData = [
        { uai: externalId_1, name: name_1 , email: 'member_1@organization.org' },
        { uai: externalId_2, name: name_2 , email: 'member_2@organization.org' },
        { uai: new_externalId, name: new_name, email: 'member@neworganization.org' }
      ];

      await databaseBuilder.commit();

      // when
      await script.createOrUpdateOrganizations({ organizations, csvData });
      const foundOrganizations = await script.findAllOrganizationsWithExternalId();

      // then
      const filterForUpdatedOrganizations = foundOrganizations.map((organization) => _.pick(organization, ['externalId', 'name']));
      const filterForCreatedOrganizations = foundOrganizations.map((organization) => _.pick(organization, ['externalId', 'name', 'provinceCode', 'type']));
      expect(filterForUpdatedOrganizations).to.include.deep.members([
        { externalId: externalId_1 , name: name_1 },
        { externalId: externalId_2 , name: name_2 }
      ]);
      expect(filterForCreatedOrganizations).to.include.deep.members([{ externalId: new_externalId , name: new_name, provinceCode, type }]);
    });
  });

});
