'use strict';


module.exports = db =>
    db.ModelBase.extend({
        tableName: 'comments',

        product() {
            return this.belongsTo(db.Product, 'product_id');
        },

        user() {
            return this.belongsTo(db.User, 'user_id');
        },
    });
