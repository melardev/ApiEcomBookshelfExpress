'use strict';

const bcrypt = require('bcrypt-nodejs');
const {isString} = require('lodash/fp');
const jwt = require('jsonwebtoken');

module.exports = db =>
    db.ModelBase.extend({
        tableName: 'users',

        comments() {
            return this.hasMany(db.Comment, 'user_id');
        },
        addresses() {
            return this.hasMany(db.Address, 'user_id');
        },
        products() {
            return this.hasMany(db.Product, 'user_id');
        },
        roles() {
            return this.belongsToMany(db.Role).through(db.UserRole, 'user_id', 'role_id');
        },

        initialize() {
            this.on('saving', this.handleSaving);
        },

        async handleSaving(model, attrs, options) {
            const validatePassword = this.isNew() || this.hasChanged('password');

            if (validatePassword) {
                const hashedPassword = await bcrypt.hashSync(this.get('password'), await bcrypt.genSaltSync(10));
                this.set('password', hashedPassword);
            }
        },

        async isValidPasswordAsync(password, cb) {
            return await bcrypt.compare(password, this.get('password'), (err, isValid) => {
                if (err)
                    cb(err);
                else
                    cb(null, isValid);
            });
        },
        isValidPasswordSync(password) {
            return bcrypt.compareSync(password, this.get('password'));
        },
        isAdminSync() {
            // return this.relations.roles.models.some(role => role.get('name') === 'ROLE_ADMIN');
            const roles = this.toJSON().roles || [];
            return roles.some(role => role.name === 'ROLE_ADMIN');
        },
        async isAdminAsync() {
            await this.related('roles').fetch().then(async roles => {
                return roles.some(role => role.get('name') === 'ROLE_ADMIN');
            }).catch(err => {
                throw err;
            });
        },
        generateJwtSync() {
            const roles = this.toJSON().roles || [];
            return jwt.sign(
                {
                    user_id: this.id,
                    username: this.get('username'),
                    roles: roles.map(role => role.get('name'))
                },
                process.env.JWT_SECRET || 'JWT_SUPER_SECRET',
                {expiresIn: process.env.EXPIRE_TIME || 360000}
            );
        },
        async generateJwtAsync() {

            return await this.related('roles').fetch().then(roles => {
                return jwt.sign(
                    {
                        user_id: this.id,
                        username: this.get('username,'),
                        roles: roles.map(role => role.get('name'))
                    },
                    process.env.JWT_SECRET || 'JWT_SUPER_SECRET',
                    {expiresIn: process.env.EXPIRE_TIME || 360000}
                );
            });
        }
    });
