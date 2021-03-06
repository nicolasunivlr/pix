import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Team::InvitationsList', function(hooks) {

  setupIntlRenderingTest(hooks);

  test('it should list the pending team invitations', async function(assert) {
    // given
    this.set('invitations', [
      { email: 'gigi@example.net', updatedAt: moment('2019-10-08T10:50:00Z').utcOffset(2) },
      { email: 'gogo@example.net', updatedAt: moment('2019-10-08T10:50:00Z').utcOffset(2) },
    ]);

    // when
    await render(hbs`<Team::InvitationsList @invitations={{invitations}}/>`);

    // then
    assert.dom(`[aria-label="${this.intl.t('pages.team-invitations.table.row.aria-label')}"]`).exists({ count: 2 });
  });

  test('it should display email and creation date of invitation', async function(assert) {
    // given
    const pendingInvitationDate = moment('2019-10-08T10:50:00Z').utcOffset(2);

    this.set('invitations', [
      { email: 'gigi@example.net', updatedAt: pendingInvitationDate },
    ]);

    // when
    await render(hbs`<Team::InvitationsList @invitations={{invitations}}/>`);

    // then
    assert.contains('gigi@example.net');
    assert.contains(`${this.intl.t('pages.team-invitations.table.row.message')} ${moment(pendingInvitationDate).format('DD/MM/YYYY - HH:mm')}`);
  });
});
