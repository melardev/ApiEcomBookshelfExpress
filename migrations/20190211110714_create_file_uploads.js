exports.up = function (knex, Promise) {
    return knex.schema.createTable('file_uploads', table => {
        table.increments();
        table.string('file_path');
        table.string('file_name');
        table.string('original_name');
        table.integer('file_size').unsigned();

        table
            .integer('user_id')
            .nullable()
            .unsigned() // withtout this MySQL driver crashes
            .references('users.id')
            .onDelete('CASCADE');

        table
            .integer('category_id')
            .nullable()
            .unsigned()// withtout this MySQL driver crashes
            .references('categories.id')
            .onDelete('CASCADE');

        table
            .integer('tag_id')
            .nullable()
            .unsigned()// withtout this MySQL driver crashes
            .references('tags.id')
            .onDelete('CASCADE');

        table
            .integer('product_id')
            .nullable()
            .unsigned()// withtout this MySQL driver crashes
            .references('products.id')
            .onDelete('CASCADE');

        table.timestamps();
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTableIfExists('file_uploads');
};
