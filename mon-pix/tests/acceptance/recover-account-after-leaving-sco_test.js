import { describe } from 'mocha';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import visit from '../helpers/visit';
import { currentURL, fillIn } from '@ember/test-helpers';
import setupIntl from '../helpers/setup-intl';
import { fillInByLabel } from '../helpers/fill-in-by-label';
import { clickByLabel } from '../helpers/click-by-label';
import { contains } from '../helpers/contains';

describe('Acceptance | RecoverAccountAfterLeavingScoRoute', function() {

  setupApplicationTest();
  setupMirage();
  setupIntl();

  context('when account recovery is disabled by default', function() {

    it('should redirect to login page', async function() {
      // given / when
      await visit('/recuperer-mon-compte');

      // then
      expect(currentURL()).to.equal('/connexion');
    });
  });

  context('when account recovery is enabled', () => {

    it('should access to account recovery page and show student information form', async function() {
      // given
      server.create('feature-toggle', { id: 0, isScoAccountRecoveryEnabled: true });

      //when
      await visit('/recuperer-mon-compte');

      // then
      expect(currentURL()).to.equal('/recuperer-mon-compte');
      expect(contains(this.intl.t('pages.recover-account-after-leaving-sco.student-information.title'))).to.exist;
    });

    context('when submitting information form with valid data', () => {

      it('should hide student information form and show recover account confirmation step', async function() {
        // given
        const ineIna = '0123456789A';
        const lastName = 'Lecol';
        const firstName = 'Manuela';
        const dayOfBirth = 20;
        const monthOfBirth = 5;
        const yearOfBirth = 2000;
        const birthdate = '2000-05-20';
        const username = 'manuela.lecol2005';

        server.create('user', { id: 1, firstName, lastName, username });
        server.create('student-information', { id: 2, ineIna, firstName, lastName, birthdate });
        server.create('feature-toggle', { id: 0, isScoAccountRecoveryEnabled: true });

        // when
        await visit('/recuperer-mon-compte');
        await fillInByLabel(this.intl.t('pages.recover-account-after-leaving-sco.student-information.form.ine-ina'), ineIna);
        await fillInByLabel(this.intl.t('pages.recover-account-after-leaving-sco.student-information.form.first-name'), firstName);
        await fillInByLabel(this.intl.t('pages.recover-account-after-leaving-sco.student-information.form.last-name'), lastName);
        await fillIn('#dayOfBirth', dayOfBirth);
        await fillIn('#monthOfBirth', monthOfBirth);
        await fillIn('#yearOfBirth', yearOfBirth);
        await clickByLabel(this.intl.t('pages.recover-account-after-leaving-sco.student-information.form.submit'));

        // then
        expect(contains(this.intl.t('pages.recover-account-after-leaving-sco.student-information.title'))).to.not.exist;
        expect(contains(this.intl.t('pages.recover-account-after-leaving-sco.confirmation-step.good-news', { firstName }))).to.exist;
      });
    });

    context('when two students used same account', function() {

      it('should redirect to account recovery conflict page', async function() {
        // given
        server.create('feature-toggle', { id: 0, isScoAccountRecoveryEnabled: true });

        const ineIna = '0123456789A';
        const lastName = 'Lecol';
        const firstName = 'Manuela';
        const dayOfBirth = 20;
        const monthOfBirth = 5;
        const yearOfBirth = 2000;

        server.create('user', {
          id: 1,
          firstName,
          lastName,
        });

        server.create('student-information', {
          id: 2,
          ineIna,
          firstName,
          lastName,
          birthdate: '2000-5-20',
        });

        //when
        await visit('/recuperer-mon-compte');
        await fillInByLabel(this.intl.t('pages.recover-account-after-leaving-sco.student-information.form.ine-ina'), ineIna);
        await fillInByLabel(this.intl.t('pages.recover-account-after-leaving-sco.student-information.form.first-name'), firstName);
        await fillInByLabel(this.intl.t('pages.recover-account-after-leaving-sco.student-information.form.last-name'), lastName);
        await fillIn('#dayOfBirth', dayOfBirth);
        await fillIn('#monthOfBirth', monthOfBirth);
        await fillIn('#yearOfBirth', yearOfBirth);
        await clickByLabel(this.intl.t('pages.recover-account-after-leaving-sco.student-information.form.submit'));

        // then
        expect(contains(this.intl.t('pages.recover-account-after-leaving-sco.conflict.found-you-but', { firstName }))).to.exist;
        expect(contains(this.intl.t('pages.recover-account-after-leaving-sco.student-information.title'))).to.not.exist;
      });
    });
  });

});
