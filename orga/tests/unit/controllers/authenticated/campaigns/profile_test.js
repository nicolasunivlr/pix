import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Unit | Controller | authenticated/campaigns/profile', function(hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display correct page title', function(assert) {
    const controller = this.owner.lookup('controller:authenticated/campaigns/profile');
    controller.model = {
      campaignProfile: {
        firstName: 'Jaune',
        lastName: 'attends',
      },
    };

    assert.equal(controller.pageTitle, 'Profil de Jaune attends');
  });
});
