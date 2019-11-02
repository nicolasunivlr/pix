const { expect, sinon, domainBuilder } = require('../../test-helper');
const _ = require('lodash');

const BookshelfOrganization = require('../../../lib/infrastructure/data/organization');
const { findAllOrganizationsWithExternalId, updateOrganizationName, createOrganizationSco } = require('../../../scripts/byDB-create-or-update-sco-organizations');

describe('Integration | Scripts | byDB-create-or-update-sco-organizations.js', () => {

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

    it('should find organizations', async () => {
      // when
      const foundOrganizationInvitations = await findAllOrganizationsWithExternalId();

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

    it('should update organization name', async () => {
      // when
      const savedOrganization = await updateOrganizationName({
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

    it('should create new organization', async () => {
      // when
      const createdOrganization = await createOrganizationSco({ organization });

      // then
      expect(createdOrganization).to.deep.equal(organization);
    });
  });

});
