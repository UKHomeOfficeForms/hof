// Update with your config settings.

module.exports = {

  development: {
    client: 'pg',
    connection: {
      host: 'localhost',
      port: 5432,
      user: 'alicelui',
      password: '',
      database: 'hof_example_al'
    },

    migrations: {
      tableName: 'knex_migrations'
    }
  },

  test: {
    client: 'pg',
    connection: {
      host: 'localhost',
      port: 5432,
      user: 'alicelui',
      password: 'passalice',
      database: 'hof_example_al_test'
    },

    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
