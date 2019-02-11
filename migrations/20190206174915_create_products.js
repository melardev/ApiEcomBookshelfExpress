exports.up = function (knex, Promise) {
    return knex.schema.createTable('products', table => {
        table.increments();

        table.string('name');
        table
            .string('slug')
            .notNullable()
            .unique();

        table.text('description');

        table.integer('content_type');
        table.integer('price').unsigned();
        table.integer('stock').unsigned();
        table.integer('visiblity_type');

        if (knex.client.config.client === 'sqlite3')
            table.dateTime('publish_on');
        else if (knex.client.config.client.indexOf('mysql') !== -1)
            table.dateTime('publish_on').defaultTo(knex.fn.now());
        else
            table.dateTime('publish_on').defaultTo(knex.fn.now(6));

        table.timestamps(false, true);
    });

};

exports.down = function (knex, Promise) {
    return knex.schema.dropTableIfExists('products');
};
