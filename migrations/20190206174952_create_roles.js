exports.up = function (knex, Promise) {
    return knex.schema.createTable('roles', table => {
        table.increments();
        table
            .string('name')
            .notNullable()
            .unique();

        table.string('description').nullable();
        table.timestamps();
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTableIfExists('roles');
};
