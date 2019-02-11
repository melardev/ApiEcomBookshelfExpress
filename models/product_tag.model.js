'use strict';


module.exports = db => {
    return db.ModelBase.extend({
        idAttribute: null,
        tableName: 'products_tags',
        hasTimestamps: false,
        product() {
            return this.belongsTo(db.Product, 'product_id');
        },
        tag() {
            return this.belongsTo(db.Category, 'tag_id');
        },
    });
};