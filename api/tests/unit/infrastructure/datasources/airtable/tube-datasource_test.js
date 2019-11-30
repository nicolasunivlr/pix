const { expect, sinon } = require('../../../../test-helper');
const airtable = require('../../../../../lib/infrastructure/airtable');
const tubeDatasource = require('../../../../../lib/infrastructure/datasources/airtable/tube-datasource');
const tubeRawAirTableFixture = require('../../../../tooling/fixtures/infrastructure/tubeRawAirTableFixture');
const tubeAirtableDataModelFixture = require('../../../../tooling/fixtures/infrastructure/tubeAirtableDataObjectFixture');
const { Record: AirtableRecord, Error: AirtableError } = require('airtable');
const AirtableResourceNotFound = require('../../../../../lib/infrastructure/datasources/airtable/AirtableResourceNotFound');
const _ = require('lodash');

function makeAirtableFake(records) {
  return async (tableName, fieldList) => {
    return records.map((record) => new AirtableRecord(tableName, record.id,
      {
        id: record.id,
        fields: _.pick(record._rawJson.fields, fieldList)
      }));
  };
}

describe('Unit | Infrastructure | Datasource | Airtable | TubeDatasource', () => {

  describe('#fromAirTableObject', () => {

    it('should create a Tube from the AirtableRecord', () => {
      // given
      const expectedTube = tubeAirtableDataModelFixture();

      // when
      const tube = tubeDatasource.fromAirTableObject(tubeRawAirTableFixture());

      // then
      expect(tube).to.deep.equal(expectedTube);
    });
  });

  describe('#findByNames', () => {

    it('should return an array of matching airtable tube data objects', async function() {
      // given
      const rawTube1 = tubeRawAirTableFixture();
      rawTube1.fields['Nom'] = 'FAKE_NAME_RAW_TUBE_1' ;

      const rawTube2 = tubeRawAirTableFixture();
      rawTube2.fields['Nom'] = 'FAKE_NAME_RAW_TUBE_2' ;

      const rawTube3 = tubeRawAirTableFixture();
      rawTube3.fields['Nom'] = 'FAKE_NAME_RAW_TUBE_3' ;

      const rawTube4 = tubeRawAirTableFixture();
      rawTube4.fields['Nom'] = 'FAKE_NAME_RAW_TUBE_4' ;

      const records = [rawTube1, rawTube2, rawTube3, rawTube4];
      sinon.stub(airtable, 'findRecords').callsFake(makeAirtableFake(records));

      // when
      const foundTubes = await tubeDatasource.findByNames([
        rawTube1.fields['Nom'],
        rawTube2.fields['Nom'],
        rawTube4.fields['Nom'],
      ]);

      // then
      expect(foundTubes).to.be.an('array');
      expect(_.map(foundTubes, 'name')).to.deep.equal([rawTube1.fields['Nom'], rawTube2.fields['Nom'], rawTube4.fields['Nom']]);
      expect(airtable.findRecords).to.have.been.calledWith('Tubes');
    });
  });

  describe('#get', () => {

    it('should call airtable on Tube table with the id and return a datamodel Tube object', () => {
      // given
      const rawTube = tubeRawAirTableFixture();
      sinon.stub(airtable, 'getRecord').withArgs('Tubes', rawTube.id).resolves(rawTube);

      // when
      const promise = tubeDatasource.get(rawTube.id);

      // then
      return promise.then((tube) => {
        expect(airtable.getRecord).to.have.been.calledWith('Tubes', rawTube.id);

        expect(tube.id).to.equal(rawTube.id);
      });
    });

    context('when airtable client throw an error', () => {

      it('should reject with a specific error when resource not found', () => {
        // given
        sinon.stub(airtable, 'getRecord').rejects(new AirtableError('NOT_FOUND'));

        // when
        const promise = tubeDatasource.get('243');

        // then
        return expect(promise).to.have.been.rejectedWith(AirtableResourceNotFound);
      });

      it('should reject with the original error in any other case', () => {
        // given
        sinon.stub(airtable, 'getRecord').rejects(new AirtableError('SERVICE_UNAVAILABLE'));

        // when
        const promise = tubeDatasource.get('243');

        // then
        return expect(promise).to.have.been.rejectedWith(new AirtableError('SERVICE_UNAVAILABLE'));
      });
    });

  });

  describe('#list', () => {

    it('should query Airtable tubes with empty query', async () => {
      // given
      sinon.stub(airtable, 'findRecords').callsFake(makeAirtableFake([]));

      // when
      await tubeDatasource.list();

      // then
      expect(airtable.findRecords).to.have.been.calledWith('Tubes', tubeDatasource.usedFields);
    });

    it('should resolve an array of Tubes from airTable', async () => {
      // given
      const
        rawTube1 = tubeRawAirTableFixture(),
        rawTube2 = tubeRawAirTableFixture();
      sinon.stub(airtable, 'findRecords').callsFake(makeAirtableFake([rawTube1, rawTube2]));

      // when
      const foundTubes = await tubeDatasource.list();

      // then
      expect(_.map(foundTubes, 'id')).to.deep.equal([rawTube1.id, rawTube2.id]);
    });
  });
});
