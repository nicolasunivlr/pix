const TABLE_NAME = 'tutorial-evaluations';

exports.up = (knex) => {

  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments('id').primary();
    t.bigInteger('userId').notNullable().index();
    t.string('tutorialId').notNullable().index();
    t.unique(['userId', 'tutorialId']);
  });
};

exports.down = (knex) => {
  return knex.schema.dropTable(TABLE_NAME);
};
