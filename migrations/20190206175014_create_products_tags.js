exports.up = function (knex, Promise) {
    return knex.schema.createTable('products_tags', table => {
        table.increments();

        table
            .integer('product_id').unsigned()
            .notNullable()
            .references('products.id')
            .onDelete('CASCADE');
        table
            .integer('tag_id').unsigned()
            .notNullable()
            .references('tags.id')
            .onDelete('CASCADE');
        table.unique(['product_id', 'tag_id']);

        if (knex.client.config.client === 'sqlite3')
            table.dateTime('created_at');
        else if (knex.client.config.client.indexOf('mysql') !== -1)
            table.dateTime('created_at').defaultTo(knex.fn.now());
        else
            table.dateTime('created_at').defaultTo(knex.fn.now(6));
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTableIfExists('products_tags');
};
