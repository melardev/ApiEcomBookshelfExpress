'use strict';

module.exports = db =>
    db.ModelBase.extend({
        tableName: 'addresses',
        hasTimestamps: false,

        user() {
            return this.belongsTo(db.User, 'user_id');
        },

        orders() {
            return this.hasMany(db.Order, 'address_id');
        },
    });
