exports.up = function (knex, Promise) {
    return knex.schema.createTable('users', table => {
        table.increments();

        table.string('first_name');
        table.string('last_name');

        table.string('username')
            .notNullable()
            .unique();

        table
            .string('email')
            .notNullable()
            .unique();

        table.string('password').notNullable();
        table.timestamps();
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTableIfExists('users');
};
