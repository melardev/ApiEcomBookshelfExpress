exports.up = function (knex, Promise) {
    return knex.schema.createTable('users_roles', table => {
        table.increments();

        table
            .integer('user_id').unsigned()
            .notNullable()
            .references('users.id')
            .onDelete('CASCADE');
        table
            .integer('role_id').unsigned()
            .notNullable()
            .references('roles.id')
            .onDelete('CASCADE');
        table.unique(['user_id', 'role_id']);

        if (knex.client.config.client === 'sqlite3')
            table.dateTime('created_at');
        else if (knex.client.config.client.indexOf('mysql') !== -1)
            table.dateTime('created_at').defaultTo(knex.fn.now());
        else
            table.dateTime('created_at').defaultTo(knex.fn.now(6));
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTableIfExists('users_roles');
};
