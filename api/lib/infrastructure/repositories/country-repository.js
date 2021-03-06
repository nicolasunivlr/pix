const { Country } = require('../../domain/read-models/Country');
const { knex } = require('../bookshelf');

module.exports = {
  async findAll() {
    const result = await knex
      .from('certification-cpf-countries')
      .select('commonName', 'code')
      .where('commonName', '=', knex.ref('originalName'))
      .orderBy('commonName', 'asc');

    return result.map(_toDomain);
  },
};

function _toDomain(row) {
  return new Country({
    ...row,
    name: row.commonName,
  });
}
