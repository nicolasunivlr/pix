import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  queryParams: {
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
    id: { refreshModel: true },
    isCreated: { refreshModel: true },
    isFinalized: { refreshModel: true },
    isPublished: { refreshModel: true },
    areResultsSent: { refreshModel: true },
  },

  model(params) {
    return this.store.query('session', {
      filter: {
        id: params.id ? params.id.trim() : '',
        isCreated: params.isCreated ? 'true' : '',
        isFinalized: params.isFinalized ? 'true' : '',
        isPublished: params.isPublished ? 'true' : '',
        areResultsSent: params.areResultsSent ? 'true' : '',
      },
      page: {
        number: params.pageNumber,
        size: params.pageSize,
      },
    });
  },

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.pageNumber = 1;
      controller.pageSize = 10;
      controller.id = null;
      controller.isCreated = false;
      controller.isFinalized = false;
      controller.isPublished = false;
      controller.areResultsSent = false;
    }
  }
});
