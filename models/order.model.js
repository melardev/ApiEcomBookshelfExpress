'use strict';

module.exports = db =>
    db.ModelBase.extend({
        tableName: 'orders',

        user() {
            return this.belongsTo(db.User, 'user_id');
        },
        address() {
            return this.belongsTo(db.Address, 'address_id');
        },
        orderItems() {
            return this.hasMany(db.OrderItem, 'order_id');
        },
    });
