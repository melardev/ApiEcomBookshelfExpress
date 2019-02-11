exports.up = function (knex, Promise) {
    return knex.schema.createTable('categories', table => {
        table.increments();
        table
            .string('name')
            .notNullable();

        table
            .string('slug')
            .notNullable()
            .unique();
        table.string('description').nullable();
        table.timestamps();
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTableIfExists('categories');
};
