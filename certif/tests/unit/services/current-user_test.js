import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { reject, resolve } from 'rsvp';
import Object from '@ember/object';
import Service from '@ember/service';

module('Unit | Service | current-user', function(hooks) {

  setupTest(hooks);

  module('user is authenticated', function() {

    test('should load the current certification point of contact', async function(assert) {
      // Given
      const connectedUserId = 1;
      const connectedCertificationPointOfContact = Object.create({
        id: connectedUserId,
      });
      const storeStub = Service.create({
        findRecord: () => resolve(connectedCertificationPointOfContact),
      });
      const sessionStub = Service.create({
        isAuthenticated: true,
        data: { authenticated: { user_id: connectedUserId } },
      });
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.set('store', storeStub);
      currentUser.set('session', sessionStub);

      // When
      await currentUser.load();

      // Then
      assert.equal(currentUser.certificationPointOfContact, connectedCertificationPointOfContact);
    });
  });

  module('user is not authenticated', function() {

    test('should do nothing', async function(assert) {
      // Given
      const sessionStub = Service.create({
        isAuthenticated: false,
      });
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.set('session', sessionStub);

      // When
      await currentUser.load();

      // Then
      assert.equal(currentUser.certificationPointOfContact, null);
    });
  });

  module('user token is expired', function() {

    test('should redirect to login', async function(assert) {
      // Given
      const connectedUserId = 1;
      const storeStub = Service.create({
        findRecord: () => reject({ errors: [{ code: 401 }] }),
      });
      const sessionStub = Service.create({
        isAuthenticated: true,
        data: { authenticated: { user_id: connectedUserId } },
        invalidate: () => resolve('invalidate'),
      });
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.set('store', storeStub);
      currentUser.set('session', sessionStub);

      // When
      const result = await currentUser.load();

      // Then
      assert.equal(result, 'invalidate');
    });
  });
});

