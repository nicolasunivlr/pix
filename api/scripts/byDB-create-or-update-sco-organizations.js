/* eslint-disable no-console */
// Usage: BASE_URL=... PIXMASTER_EMAIL=... PIXMASTER_PASSWORD=... node create-or-update-sco-organizations.js path/file.csv

'use strict';

const BookshelfOrganization = require('../lib/infrastructure/data/organization');
const bookshelfToDomainConverter = require('../lib/infrastructure/utils/bookshelf-to-domain-converter');

const { checkCsvExtensionFile, parseCsv } = require('./helpers/csvHelpers');

function findAllOrganizationsWithExternalId() {
  return BookshelfOrganization
    .where('externalId', 'is not', null)
    .fetchAll()
    .then((organizations) => bookshelfToDomainConverter.buildDomainObjects(BookshelfOrganization, organizations));
}

function updateOrganizationName({ organizationId, name }) {
  return BookshelfOrganization
    .where({ id: organizationId })
    .save({ name }, { require: true, patch: true })
    .then((organization) => bookshelfToDomainConverter.buildDomainObject(BookshelfOrganization, organization));
}

function createOrganizationSco({ externalId, name, provinceCode }) {
  const type = 'SCO';
  return new BookshelfOrganization({ externalId, name, provinceCode, type })
    .save()
    .then((result) => bookshelfToDomainConverter.buildDomainObject(BookshelfOrganization, result));
}

async function createOrUpdateOrganizations({ organizations, csvData }) {
  for (const [index, data] of csvData.entries()) {
    if (require.main === module) {
      process.stdout.write(`${index + 1}/${csvData.length}`);
    }

    const foundOrganization = organizations.find((organization) => organization.externalId === data.uai);

    if (foundOrganization) {
      await this.updateOrganizationName({
        organizationId: foundOrganization.id,
        name: data.name
      });
    } else {
      const organization = {
        name: data.name,
        externalId: data.uai,
        provinceCode: data.uai.substring(0, 3),
      };
      await this.createOrganizationSco(organization);
    }
  }
}

async function main() {
  console.log('Starting creating or updating SCO organizations.');

  try {
    const filePath = process.argv[2];

    console.log('Check csv extension file... ');
    checkCsvExtensionFile(filePath);
    console.log('ok');

    console.log('Reading and parsing csv data file... ');
    const csvData = parseCsv(filePath, { header: true, skipEmptyLines: true });
    console.log('ok');

    console.log('Fetching all organizations with an externalId... ');
    const organizations = await findAllOrganizationsWithExternalId();
    console.log('ok');

    console.log('Creating or updating organizations...');
    await createOrUpdateOrganizations({ organizations, csvData });
    console.log('\nDone.');

  } catch (error) {
    console.error('\n', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  findAllOrganizationsWithExternalId,
  updateOrganizationName,
  createOrganizationSco,
  createOrUpdateOrganizations,
};
