const NodeCache = require('node-cache');
const { expect, sinon } = require('../../../test-helper');
const InMemoryTemporaryStorage = require('../../../../lib/infrastructure/temporary-storage/InMemoryTemporaryStorage');

describe('Unit | Infrastructure | temporary-storage | InMemoryTemporaryStorage', () => {

  describe('#constructor', () => {

    it('should create an InMemoryTemporaryStorage instance', () => {
      // when
      const inMemoryTemporaryStorage = new InMemoryTemporaryStorage();

      // then
      expect(inMemoryTemporaryStorage._client).to.be.an.instanceOf(NodeCache);
    });
  });

  describe('#save', () => {

    let clock;

    beforeEach(() => {
      clock = sinon.useFakeTimers();
    });

    afterEach(() => {
      clock.restore();
    });

    it('should resolve with the generated key', () => {
      // given
      const inMemoryTemporaryStorage = new InMemoryTemporaryStorage();

      // when
      const key = inMemoryTemporaryStorage.save({ value: {}, expirationDelaySeconds: 1000 });

      // then
      expect(key).to.exist;
    });

    it('should save key valu with a defined ttl in seconds', async () => {
      // given
      const TWO_MINUTES_IN_SECONDS = 2 * 60;
      const TWO_MINUTES_IN_MILLISECONDS = 2 * 60 * 1000;

      const inMemoryTemporaryStorage = new InMemoryTemporaryStorage();

      // when
      const key = await inMemoryTemporaryStorage.save({
        value: { name: 'name' },
        expirationDelaySeconds: TWO_MINUTES_IN_SECONDS,
      });

      // then
      const expirationKeyInTimestamp = inMemoryTemporaryStorage._client.getTtl(key);
      expect(expirationKeyInTimestamp).to.equal(TWO_MINUTES_IN_MILLISECONDS);
    });
  });

  describe('#get', () => {

    it('should retrieve the value if it exists', async () => {
      // given
      const value = { name: 'name' };
      const expirationDelaySeconds = 1000;

      const inMemoryTemporaryStorage = new InMemoryTemporaryStorage();
      const key = await inMemoryTemporaryStorage.save({ value, expirationDelaySeconds });

      // when
      const result = await inMemoryTemporaryStorage.get(key);

      // then
      expect(result).to.deep.equal(value);
    });
  });
});
