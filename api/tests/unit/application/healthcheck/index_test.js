const { expect, sinon } = require('$root/tests/test-helper');
const Hapi = require('@hapi/hapi');
const healthcheckController = require('$root/lib/application/healthcheck/healthcheck-controller');
const route = require('$root/lib/application/healthcheck');

describe('Unit | Router | HealthcheckRouter', function() {

  let server;

  beforeEach(function() {
    server = this.server = Hapi.server();
  });

  describe('GET /api', function() {

    beforeEach(function() {
      sinon.stub(healthcheckController, 'get').returns('ok');
      return server.register(route);
    });

    it('should exist', async function() {
      const res = await server.inject({ method: 'GET', url: '/api' });
      expect(res.statusCode).to.equal(200);
    });
  });
});
