exports.up = function (knex, Promise) {
    return knex.schema.createTable('order_items', table => {
        table.increments();

        table.string('name');
        table.string('slug');
        table.integer('price');
        table.integer('quantity');


        table
            .integer('product_id')
            .notNullable()
            .unsigned()
            .references('products.id')
            .onDelete('CASCADE');

        table
            .integer('user_id')
            .nullable()
            .unsigned()
            .references('users.id')
            .onDelete('CASCADE');

        table
            .integer('order_id')
            .notNullable().unsigned()
            .references('orders.id')
            .onDelete('CASCADE');
        table.timestamps();
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTableIfExists('order_items');
};
