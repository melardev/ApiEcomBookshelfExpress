exports.up = function (knex, Promise) {

    return knex.schema.createTable('orders', table => {
        table.increments();

        table.string('tracking_number');
        table.integer('order_status');

        table
            .integer('user_id')
            .nullable()
            .unsigned()
            .references('users.id')
            .onDelete('CASCADE');
        table
            .integer('address_id')
            .notNullable()
            .unsigned()
            .references('addresses.id')
            .onDelete('CASCADE');
        table.timestamps();
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTableIfExists('orders');
};
