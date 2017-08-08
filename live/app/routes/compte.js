import Ember from 'ember';

import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {

  authenticationRoute: '/',

  model() {
    const store = this.get('store');
    return store.queryRecord('user', {}).catch(_ => {
      this.transitionTo('logout');
    });
  },

  actions: {
    searchForOrganization(code) {
      return this.get('store').query('organization', {
        filter: {
          code
        }
      });
    }
  }

});
