'use strict';

const slugify = require('slugify');


module.exports = function Product(db) {
    return db.ModelBase.extend({
        tableName: 'products',
        outputVirtuals: true,
        virtuals: {
            comments_count: {
                get: function () {
                    return this.commentsCount || 0;
                },
                set: function (value) {
                    this.commentsCount = value;
                },
            },
        },
        images() {
            return this.hasMany(db.ProductImage, 'product_id');
        },
        comments() {
            return this.hasMany(db.Comment, 'product_id');
        },
        tags() {
            return this.belongsToMany(db.Tag)
                .withPivot(['created_at'])
                .through(db.ProductTag, 'product_id', 'tag_id');
        },
        categories() {
            return this.belongsToMany(db.Category)
                .withPivot(['created_at'])
                .through(db.ProductCategory, 'product_id', 'category_id');
        },
        initialize() {
            this.on('saving', this.handleSaving);
        },

        async handleSaving(model, attrs, options) {
            if (this.hasChanged('slug')) {
                this.set({
                    slug: slugify(this.get('name'), {lower: true})
                });
            }
            if (!this.has('slug')) {
                this.set('slug', slugify(this.get('name'), {lower: true}));
            }
        },

    });
};
