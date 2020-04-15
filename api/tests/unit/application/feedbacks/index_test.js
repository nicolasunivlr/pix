const { expect, sinon } = require('$root/tests/test-helper');
const Hapi = require('@hapi/hapi');
const securityController = require('$root/lib/interfaces/controllers/security-controller');
const feedbackController = require('$root/lib/application/feedbacks/feedback-controller');
const route = require('$root/lib/application/feedbacks');

describe('Unit | Router | feedback-router', () => {

  let server;

  beforeEach(() => {
    server = Hapi.server();
  });

  describe('POST /api/feedbacks', () => {

    beforeEach(() => {
      sinon.stub(feedbackController, 'save').returns('ok');
      return server.register(route);
    });

    it('should exist', () => {
      // given
      const options = {
        method: 'POST',
        url: '/api/feedbacks'
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((result) => {
        expect(result.statusCode).to.equal(200);
      });
    });
  });

  describe('GET /api/feedbacks', () => {

    beforeEach(() => {
      sinon.stub(securityController, 'checkUserIsAuthenticated').callsFake((request, h) => {
        h.continue({ credentials: { accessToken: 'jwt.access.token' } });
      });
      sinon.stub(securityController, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
      sinon.stub(feedbackController, 'find').returns('ok');
      return server.register(route);
    });

    it('should exist', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/feedbacks'
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((result) => {
        expect(result.statusCode).to.equal(200);
      });
    });
  });

});
