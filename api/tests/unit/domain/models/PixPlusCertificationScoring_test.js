const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | PixPlusCertificationScoring', () => {

  context('#isAcquired', () => {

    it('returns true when pix certification is acquired and reproducibility rate is over 75', () => {
      // given
      const reproducibilityRate = domainBuilder.buildReproducibilityRate({ value: 76 });
      const pixPlusCertificationScoring = domainBuilder.buildPixPlusCertificationScoring({ hasAcquiredPixCertification: true, reproducibilityRate });

      // when
      const isAcquired = pixPlusCertificationScoring.isAcquired();

      // then
      expect(isAcquired).to.be.true;
    });

    it('returns true when pix certification is acquired and reproducibility rate is equal 75', () => {
      // given
      const reproducibilityRate = domainBuilder.buildReproducibilityRate({ value: 75 });
      const pixPlusCertificationScoring = domainBuilder.buildPixPlusCertificationScoring({ hasAcquiredPixCertification: true, reproducibilityRate });

      // when
      const isAcquired = pixPlusCertificationScoring.isAcquired();

      // then
      expect(isAcquired).to.be.true;
    });

    it('returns false when pix certification is not acquired even if reproducibility rate is over 75', () => {
      // given
      const reproducibilityRate = domainBuilder.buildReproducibilityRate({ value: 75 });
      const pixPlusCertificationScoring = domainBuilder.buildPixPlusCertificationScoring({ hasAcquiredPixCertification: false, reproducibilityRate });

      // when
      const isAcquired = pixPlusCertificationScoring.isAcquired();

      // then
      expect(isAcquired).to.be.false;
    });

    it('returns false when reproducibility rate is under 75 even if pix certification is acquired', () => {
      // given
      const reproducibilityRate = domainBuilder.buildReproducibilityRate({ value: 74 });
      const pixPlusCertificationScoring = domainBuilder.buildPixPlusCertificationScoring({ hasAcquiredPixCertification: true, reproducibilityRate });

      // when
      const isAcquired = pixPlusCertificationScoring.isAcquired();

      // then
      expect(isAcquired).to.be.false;
    });
  });
});
