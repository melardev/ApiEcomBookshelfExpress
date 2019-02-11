exports.up = function (knex, Promise) {
    return knex.schema.createTable('products_categories', table => {
        table.increments();

        table
            .integer('product_id').unsigned()
            .notNullable()
            .references('products.id')
            .onDelete('CASCADE');

        table
            .integer('category_id').unsigned()
            .notNullable()
            .references('categories.id')
            .onDelete('CASCADE');
        table.unique(['product_id', 'category_id']);

        if (knex.client.config.client === 'sqlite3')
            table.dateTime('created_at');
        else if (knex.client.config.client.indexOf('mysql') !== -1)
            table.dateTime('created_at').defaultTo(knex.fn.now());
        else
            table.dateTime('created_at').defaultTo(knex.fn.now(6));

    });
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTableIfExists('products_categories');
};
