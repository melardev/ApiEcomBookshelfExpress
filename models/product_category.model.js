'use strict';

module.exports = db => {
    return db.ModelBase.extend({
        tableName: 'products_categories',
        hasTimestamps: false,
        product() {
            return this.belongsTo(db.Product, 'product_id');
        },

        category() {
            return this.belongsTo(db.Category, 'category_id');
        },

    });
};