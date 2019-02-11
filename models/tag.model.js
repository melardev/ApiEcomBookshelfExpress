'use strict';

const slugify = require('slugify');

const _ = require("lodash");
module.exports = db =>
    db.ModelBase.extend({
        tableName: 'tags',

        product() {
            return this.belongsToMany(db.Product).through(
                db.ProducTag,
                'tag_id',
                'product_id',
            );
        },
        images() {
            return this.hasMany(db.TagImage, 'tag_id');
        },
        initialize() {
            this.on('saving', this.handleSaving);
        },

        async handleSaving(model, attrs, options) {
            if (this.hasChanged('name')) {
                this.set('slug', slugify(this.get('name')));
                return model
                    .query('where', 'slug', slugify(this.get('name')))
                    .fetch(_.pick(options || {}, 'transacting'))
                    .then(function (existing) {
                        if (existing) {
                            throw new Error('This role already exists: Role id #' + existing.id);
                        }
                    });
            }
        },
    });
