const { expect, sinon, domainBuilder } = require('../../test-helper');
const _ = require('lodash');

const BookshelfOrganization = require('../../../lib/infrastructure/data/organization');

const script = require('../../../scripts/byDB-create-or-update-sco-organizations');

describe('Unit | Scripts | btDB-create-or-update-sco-organizations.js', () => {

  describe('#findAllOrganizationsWithExternalId', () => {

    const organizations = [];

    beforeEach(() => {
      const bookshelfOrganizations = [];

      _.each([
        domainBuilder.buildOrganization(),
        domainBuilder.buildOrganization(),
        domainBuilder.buildOrganization()
      ], (organization) => {
        organizations.push(organization);
        bookshelfOrganizations.push(new BookshelfOrganization(organization));
      });

      const fetchAllStub = sinon.stub().resolves(bookshelfOrganizations);
      sinon.stub(BookshelfOrganization, 'where').returns({
        fetchAll: fetchAllStub
      });
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should find organizations', async () => {
      // when
      const foundOrganizationInvitations = await script.findAllOrganizationsWithExternalId();

      // then
      expect(foundOrganizationInvitations).to.deep.equal(organizations);
    });
  });

  describe('#updateOrganizationName', () => {

    let organization;
    let newName;

    beforeEach(() => {
      organization = domainBuilder.buildOrganization();
      newName = 'newName';
      const bookshelfOrganization = new BookshelfOrganization({ ...organization, name: newName });

      const saveStub = sinon.stub().resolves(bookshelfOrganization);
      sinon.stub(BookshelfOrganization, 'where').returns({
        save: saveStub
      });
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should update organization name', async () => {
      // when
      const savedOrganization = await script.updateOrganizationName({
        organizationId: organization.id,
        name: newName
      });

      // then
      expect(savedOrganization.name).to.deep.equal(newName);
    });
  });

  describe('#createOrganizationSco', () => {

    let organization;

    beforeEach(() => {
      organization = domainBuilder.buildOrganization();
      const bookshelfOrganization = new BookshelfOrganization(organization);
      sinon.stub(BookshelfOrganization.prototype, 'save').resolves(bookshelfOrganization);
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should create new organization', async () => {
      // when
      const createdOrganization = await script.createOrganizationSco({ organization });

      // then
      expect(createdOrganization).to.deep.equal(organization);
    });

  });

  describe('#createOrUpdateOrganizations', () => {

    beforeEach(() => {
      sinon.stub(script, 'updateOrganizationName');
      sinon.stub(script, 'createOrganizationSco');

      script.updateOrganizationName.resolves();
      script.createOrganizationSco.resolves();
    });

    it('should update one organization', async () => {
      // given
      const externalId = 'ABCDEFGH';
      const name = 'new name';
      const csvData = [{
        uai: externalId,
        name,
        email: 'member@organization.org'
      }];

      const organization = domainBuilder.buildOrganization({ externalId });
      const organizations = [organization];

      // when
      await script.createOrUpdateOrganizations({ organizations, csvData });

      // then
      expect(script.updateOrganizationName).to.have.been.calledWith({ organizationId: organization.id, name });
      expect(script.updateOrganizationName).to.have.been.calledOnce;
    });

    it('should create one organization', async () => {
      // given
      const externalId = 'NEWONE';
      const name = 'new organization';
      const provinceCode = externalId.substring(0, 3);

      const csvData = [{
        uai: externalId,
        name,
        email: 'member@neworganization.org'
      }];

      const organization = domainBuilder.buildOrganization();
      const organizations = [organization];

      // when
      await script.createOrUpdateOrganizations({ organizations, csvData });

      // then
      expect(script.createOrganizationSco).to.have.been.calledWith({ externalId, name, provinceCode });
      expect(script.createOrganizationSco).to.have.been.calledOnce;
    });

    it('should create one organization an update two', async () => {
      // given
      const externalId_1 = 'ABCDEF';
      const externalId_2 = 'GHIJKL';

      const organizations = [
        domainBuilder.buildOrganization({ externalId: externalId_1 }),
        domainBuilder.buildOrganization({ externalId: externalId_2 }),
      ];

      const csvData = [
        { uai: organizations[0].externalId, name: organizations[0].name , email: 'member_1@organization.org' },
        { uai: organizations[1].externalId, name: organizations[1].name , email: 'member_2@organization.org' },
        { uai: 'NEWORGA', name: 'new organization', email: 'member@neworganization.org' }
      ];

      // when
      await script.createOrUpdateOrganizations({ organizations, csvData });

      // then
      expect(script.createOrganizationSco).to.have.been.calledOnce;
      expect(script.updateOrganizationName).to.have.been.calledTwice;
    });
  });

});
