exports.up = function (knex, Promise) {
    return knex.schema.createTable('comments', table => {
        table.increments();
        table.text('content').notNullable();
        table.integer('rating');
        table
            .integer('user_id').unsigned()
            .notNullable()
            .references('users.id')
            .onDelete('CASCADE');
        table
            .integer('product_id').unsigned()
            .notNullable()
            .references('products.id')
            .onDelete('CASCADE');
        table.timestamps(false, true);
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTableIfExists('comments');
};
