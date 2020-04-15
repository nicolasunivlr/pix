const { expect } = require('$root/tests/test-helper');
const { injectDependencies } = require('$root/lib/infrastructure/utils/dependency-injection');

describe('Unit | Utils | #injectDependencies', function() {

  it('should inject dependencies by name', () => {
    // given
    const dependency = Symbol('a dependency');
    const dependencies = { dependency };
    const toBeInjected = {
      functionToBeInjected: function({ dependency }) {
        return dependency;
      }
    };

    // when
    const injected = injectDependencies(toBeInjected, dependencies);

    // then
    expect(injected.functionToBeInjected({})).to.equal(dependency);
  });
});
