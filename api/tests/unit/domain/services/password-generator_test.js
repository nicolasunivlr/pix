const { expect } = require('../../../test-helper');
const service = require('../../../../lib/domain/services/password-generator');

describe('Unit | Service | password-generator', () => {

  const allowedUpperCaseLetters = /[A-HJ-NP-Z]/;
  const allowedLowerCaseLetters = /[a-km-z]/;
  const allowedDigits = /[2-9]/;
  let generatedPassword;

  beforeEach(() => {
    generatedPassword = service.generate();
  });

  it('should have a length of 8 characters', function() {
    expect(generatedPassword.length).to.equal(8);
  });

  it('should have at least one uppercase character', function() {
    expect(RegExp(allowedUpperCaseLetters).test(generatedPassword)).to.be.true;
  });

  it('should have at least one lowercase character', function() {
    expect(RegExp(allowedLowerCaseLetters).test(generatedPassword)).to.be.true;
  });

  it('should have at least one digit', function() {
    expect(RegExp(allowedDigits).test(generatedPassword)).to.be.true;
  });

  it('should respect all rules', () => {
    expect(RegExp(/^(?=.*?[a-km-z])(?=.*?[A-HJ-NP-Z])(?=.*?[2-9])[a-km-zA-HJ-NP-Z2-9]{8}$/).test(generatedPassword)).to.be.true;
  });
});
