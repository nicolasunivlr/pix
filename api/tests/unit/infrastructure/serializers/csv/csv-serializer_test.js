const { expect, catchErr, sinon } = require('../../../../test-helper');
const csvSerializer = require('../../../../../lib/infrastructure/serializers/csv/csv-serializer');
const logger = require('../../../../../lib/infrastructure/logger');

describe('Unit | Serializer | CSV | csv-serializer', () => {

  describe('#serializeLine', () => {

    it('should quote strings', async () => {
      // given
      const safeNumberAsString = '-123456';
      const csvExpected =
        '"String with \'single quotes\'";' +
        '"String with ""double quotes""";' +
        safeNumberAsString + '\n';

      // when
      const csv = csvSerializer.serializeLine([
        'String with \'single quotes\'',
        'String with "double quotes"',
        safeNumberAsString,
      ]);

      // then
      expect(csv).to.equal(csvExpected);
    });

    it('should format numbers in French locale', async () => {
      // given
      const csvExpected =
        '123;' +
        '123,456\n';

      // when
      const csv = csvSerializer.serializeLine([
        123,
        123.456,
      ]);

      // then
      expect(csv).to.equal(csvExpected);
    });

    it('should escape formula-likes to prevent CSV injections', async () => {
      // given
      const csvExpected =
        '"\'=formula-like";' +
        '"\'@formula-like";' +
        '"\'+formula-like";' +
        '"\'-formula-like"\n';

      // when
      const csv = csvSerializer.serializeLine([
        '=formula-like',
        '@formula-like',
        '+formula-like',
        '-formula-like',
      ]);

      // then
      expect(csv).to.equal(csvExpected);
    });

    context('should throw exceptions invalid format', () => {
      it('given object', async () => {
        // when
        sinon.stub(logger, 'error');
        await catchErr(csvSerializer.serializeLine)([{}]);
        // then
        expect(logger.error).to.have.been.calledWith('Unknown value type in _csvSerializeValue: object: [object Object]');
      });

      it('given null', async () => {
        // when
        sinon.stub(logger, 'error');
        await catchErr(csvSerializer.serializeLine)([null]);
        // then
        expect(logger.error).to.have.been.calledWith('Unknown value type in _csvSerializeValue: object: null');
      });

      it('given undefined', async () => {
        // when
        sinon.stub(logger, 'error');
        await catchErr(csvSerializer.serializeLine)([undefined]);
        // then
        expect(logger.error).to.have.been.calledWith('Unknown value type in _csvSerializeValue: undefined: undefined');
      });

    });
  });
});

