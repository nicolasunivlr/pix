const RandExp = require('randexp');

module.exports = {

  generate() {
    const pattern = /^(?=.*?[a-km-z])(?=.*?[A-HJ-NP-Z])(?=.*?[2-9])[a-km-zA-HJ-NP-Z2-9]{8}$/;
    /**
    * Regular expressions lookahead are not well managed by the randexp lib
    * see: https://github.com/fent/randexp.js/issues/18
    */
    let generatedString;
    do {
      generatedString = new RandExp(pattern).gen();
    } while (!RegExp(pattern).test(generatedString));

    return generatedString;
  }
};
