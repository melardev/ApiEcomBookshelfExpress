exports.up = function (knex, Promise) {
    return knex.schema.createTable('addresses', table => {
        table.increments();
        table
            .integer('user_id')
            .nullable()
            .unsigned()
            .references('users.id')
            .onDelete('CASCADE');

        table.string('address');
        table.text('city');
        table.text('country');
        table.text('zip_code');
        table.string('first_name');
        table.string('last_name');
        table.timestamps();
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTableIfExists('addresses');
};
