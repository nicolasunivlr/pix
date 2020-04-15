const { expect, sinon } = require('$root/tests/test-helper');
const Hapi = require('@hapi/hapi');
const cacheController = require('$root/lib/application/cache/cache-controller');
const securityController = require('$root/lib/interfaces/controllers/security-controller');

describe('Unit | Router | cache-router', () => {

  let server;

  beforeEach(() => {
    sinon.stub(cacheController, 'refreshCacheEntries').callsFake((request, h) => h.response().code(204));
    sinon.stub(cacheController, 'refreshCacheEntry').callsFake((request, h) => h.response().code(204));
    sinon.stub(securityController, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));

    server = Hapi.server();

    return server.register(require('$root/lib/application/cache'));
  });

  afterEach(() => {
    server.stop();
  });

  describe('DELETE /api/cache/{cachekey}', () => {

    it('should exist', async () => {
      // given
      const options = {
        method: 'DELETE',
        url: '/api/cache/Table_recXYZ1234'
      };

      // when
      const result = await server.inject(options);
      // then
      expect(result.statusCode).to.equal(204);
    });
  });

  describe('PATCH /api/cache', () => {

    it('should exist', async () => {
      // given
      const options = {
        method: 'PATCH',
        url: '/api/cache'
      };

      // when
      const result = await server.inject(options);

      // then
      expect(result.statusCode).to.equal(204);
    });
  });

});
