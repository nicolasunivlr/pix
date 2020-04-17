import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import ENV from 'mon-pix/config/environment';

describe('Integration | Component | warning-banner', function() {
  setupRenderingTest();

  const originalIsStagingBannerEnabled = ENV.APP.IS_STAGING_BANNER_ENABLED;
  const originalIsProdProblemBannerEnabled = ENV.APP.IS_PROD_HAVING_PROBLEMS_BANNER_ENABLED;

  afterEach(function() {
    ENV.APP.IS_STAGING_BANNER_ENABLED = originalIsStagingBannerEnabled;
    ENV.APP.IS_PROD_HAVING_PROBLEMS_BANNER_ENABLED = originalIsProdProblemBannerEnabled;
  });

  it('should not display the banner when not in staging', async function() {
    // given
    ENV.APP.IS_STAGING_BANNER_ENABLED = false;
    ENV.APP.IS_PROD_HAVING_PROBLEMS_BANNER_ENABLED = false;

    // when
    await render(hbs`<WarningBanner />`);

    // then
    expect(find('.warning-banner')).to.not.exist;
  });

  it('should display the banner when in staging', async function() {
    // given
    ENV.APP.IS_STAGING_BANNER_ENABLED = true;
    ENV.APP.IS_PROD_HAVING_PROBLEMS_BANNER_ENABLED = false;

    // when
    await render(hbs`<WarningBanner />`);

    // then
    expect(find('.warning-banner')).to.exist;
    expect(find('.warning-banner__staging-text')).to.exist;
    expect(find('.warning-banner__problem-text')).to.not.exist;
  });

  it('should display the banner when having problem in production', async function() {
    // given
    ENV.APP.IS_STAGING_BANNER_ENABLED = false;
    ENV.APP.IS_PROD_HAVING_PROBLEMS_BANNER_ENABLED = true;

    // when
    await render(hbs`<WarningBanner />`);

    // then
    expect(find('.warning-banner')).to.exist;
    expect(find('.warning-banner__staging-text')).to.not.exist;
    expect(find('.warning-banner__prod-problem-text')).to.exist;
  });
});
