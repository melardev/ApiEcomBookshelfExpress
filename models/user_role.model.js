'use strict';


module.exports = db => {
    return db.ModelBase.extend({
        tableName: 'users_roles',
        hasTimestamps: false,
        user() {
            return this.belongsTo(db.User, 'user_id');
        },

        role() {
            return this.belongsTo(db.Role, 'role_id');
        },
    });
};