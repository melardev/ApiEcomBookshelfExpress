'use strict';
// const Scope = require('bookshelf-schema/lib/scopes'); https://bookshelf-schema.readthedocs.io/en/latest/scopes.html#default-scope
module.exports = db =>
    db.ModelBase.extend({
        tableName: 'file_uploads',

        tag() {
            return this.belongsTo(db.Product, 'product_id');
        },

        scopes: {
            default: function (qb) {
                qb.whereNot('product_id', null);
            }
        },

    });
