'use strict';

module.exports = db =>
    db.ModelBase.extend({
        tableName: 'file_uploads',

        product() {
            return this.belongsTo(db.Product, 'product_id');
        },

        tag() {
            return this.belongsTo(db.Tag, 'tag_id');
        },

        category() {
            return this.belongsTo(db.Category, 'category_id');
        },

    });
