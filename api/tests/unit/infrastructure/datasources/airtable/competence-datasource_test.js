const { expect, domainBuilder } = require('$root/tests/test-helper');
const competenceDatasource = require('$root/lib/infrastructure/datasources/airtable/competence-datasource');
const competenceRawAirTableFixture = require('$root/tests/tooling/fixtures/infrastructure/competenceRawAirTableFixture');

describe('Unit | Infrastructure | Datasource | Airtable | CompetenceDatasource', () => {

  describe('#fromAirTableObject', () => {

    it('should create a Competence from the AirtableRecord', () => {
      // given
      const expectedCompetence = domainBuilder.buildCompetenceAirtableDataObject();

      // when
      const area = competenceDatasource.fromAirTableObject(competenceRawAirTableFixture());

      // then
      expect(area).to.deep.equal(expectedCompetence);
    });
  });

});
