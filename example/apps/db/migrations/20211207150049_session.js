
exports.up = function (knex) {
  return knex.schema.createTable('session', table => {
    table.increments();
    table.json('session').notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('session');
};
