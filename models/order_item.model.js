'use strict';

module.exports = db =>
    db.ModelBase.extend({
        tableName: 'order_items',

        user() {
            return this.belongsTo(db.User, 'user_id');
        },

        order() {
            return this.belongsTo(db.User, 'order_id');
        },

        product() {
            return this.belongsTo(db.User, 'product_id');
        },
    });
