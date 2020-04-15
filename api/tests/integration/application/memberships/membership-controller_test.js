const { expect, sinon, domainBuilder, HttpTestServer } = require('$root/tests/test-helper');
const usecases = require('$root/lib/domain/usecases');
const Membership = require('$root/lib/domain/models/Membership');
const securityController = require('$root/lib/interfaces/controllers/security-controller');
const moduleUnderTest = require('$root/lib/application/memberships');

describe('Integration | Application | Memberships | membership-controller', () => {

  let httpTestServer;

  beforeEach(() => {
    sinon.stub(usecases, 'createMembership');
    sinon.stub(usecases, 'updateMembershipRole');
    sinon.stub(securityController, 'checkUserHasRolePixMaster');
    sinon.stub(securityController, 'checkUserIsAdminInOrganization');
    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  describe('#create', () => {

    const payload = {
      data: {
        type: 'memberships',
        relationships: {
          'user': { data: { type: 'users', id: 1 } },
          'organization': { data: { type: 'organizations', id: 1 } },
        }
      }
    };

    context('Success cases', () => {

      beforeEach(() => {
        const membership = domainBuilder.buildMembership();
        usecases.createMembership.resolves(membership);

        securityController.checkUserHasRolePixMaster.callsFake((request, h) => h.response(true));
      });

      it('should resolve a 201 HTTP response', async () => {
        // when
        const response = await httpTestServer.request('POST', '/api/memberships', payload);

        // then
        expect(response.statusCode).to.equal(201);
      });

      it('should return a JSON API membership', async () => {
        // when
        const response = await httpTestServer.request('POST', '/api/memberships', payload);

        // then
        expect(response.result.data.type).to.equal('memberships');
      });
    });

    context('Error cases', () => {

      context('when user is not allowed to access resource', () => {

        beforeEach(() => {
          securityController.checkUserHasRolePixMaster.callsFake((request, h) => {
            return Promise.resolve(h.response().code(403).takeover());
          });
        });

        it('should resolve a 403 HTTP response', () => {
          // when
          const promise = httpTestServer.request('POST', '/api/memberships', payload);

          // then
          return promise.then((response) => {
            expect(response.statusCode).to.equal(403);
          });
        });
      });
    });
  });

  describe('#update', () => {

    const organizationRole = Membership.roles.ADMIN;

    const payload = {
      data: {
        type: 'memberships',
        attributes: {
          'organaization-role': organizationRole,
        },
      }
    };

    context('Success cases', () => {

      beforeEach(() => {
        const membership = domainBuilder.buildMembership({
          organizationRole: Membership.roles.MEMBER
        });
        usecases.updateMembershipRole.resolves(membership);
        securityController.checkUserIsAdminInOrganization.callsFake((request, h) => h.response(true));
      });

      it('should return a 200 HTTP response', async () => {
        // when
        const response = await httpTestServer.request('PATCH', '/api/memberships/1', payload);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });

    context('Error cases', () => {

      context('when user is not allowed to access resource', () => {

        beforeEach(() => {
          securityController.checkUserIsAdminInOrganization.callsFake((request, h) => {
            return Promise.resolve(h.response().code(403).takeover());
          });
        });

        it('should resolve a 403 HTTP response', async () => {
          // when
          const response = await httpTestServer.request('PATCH', '/api/memberships/1');

          // then
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });

});
