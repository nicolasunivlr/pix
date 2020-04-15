const { expect, databaseBuilder } = require('$root/tests/test-helper');

const knexDatabaseConnection = require('$root/db/knex-database-connection');

const { UserNotFoundError } = require('$root/lib/domain/errors');
const userRepository = require('$root/lib/infrastructure/repositories/user-repository');

describe('Integration | Infrastructure | knex-database-connection', () => {

  it('should connect to the database', async () => {
    // when
    const resultSet = await knexDatabaseConnection.knex.raw('SELECT 1 as value');
    // then
    expect(resultSet.rows || resultSet).to.deep.equal([{ value: 1 }]);
  });

  it('should list all tables, including the "users" table', async () => {
    // when
    const tableNames = await knexDatabaseConnection.listAllTableNames();
    // then
    expect(tableNames).to.include('users');
  });

  it('should empty all tables', async () => {
    // given
    const { id } = databaseBuilder.factory.buildUser();
    await databaseBuilder.commit();

    // when
    await knexDatabaseConnection.emptyAllTables();

    // then
    await expect(userRepository.get(id)).to.be.rejectedWith(UserNotFoundError);
  });
});
