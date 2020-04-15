const { expect, domainBuilder } = require('$root/tests/test-helper');
const areaDatasource = require('$root/lib/infrastructure/datasources/airtable/area-datasource');
const areaRawAirTableFixture = require('$root/tests/tooling/fixtures/infrastructure/areaRawAirTableFixture');

describe('Unit | Infrastructure | Datasource | Airtable | AreaDatasource', () => {

  describe('#fromAirTableObject', () => {

    it('should create a Area from the AirtableRecord', () => {
      // given
      const expectedArea = domainBuilder.buildAreaAirtableDataObject();

      // when
      const area = areaDatasource.fromAirTableObject(areaRawAirTableFixture());

      // then
      expect(area).to.deep.equal(expectedArea);
    });
  });

});
