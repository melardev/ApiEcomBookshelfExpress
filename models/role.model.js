'use strict';

const _ = require("lodash");

module.exports = db =>
    db.ModelBase.extend({
        tableName: 'roles',

        users() {
            return this.belongsToMany('User').through(
                'UserRole',
                'role_id',
                'user_id',
            );
        },

        initialize() {
            this.on('saving', this.handleSaving);
        },

        async handleSaving(model, attrs, options) {

            if (this.hasChanged('name')) {
                return model
                    .query('where', 'name', this.get('name'))
                    .fetch(_.pick(options || {}, 'transacting'))
                    .then(function (existing) {
                        if (existing) {
                            throw new Error('This role already exists: Role id #' + existing.id);
                        }
                    });
            }
        },
    });
