require('dotenv').config();
// Update with your config settings.

module.exports = {

    development: {
        client: process.env.DB_DIALECT || 'sqlite3',
        connection: {
            database: process.env.DB_DATABASE || null,
            filename: process.env.DB_FILENAME || './app.sqlite3',
            user: process.env.DB_USERNAME || 'root',
            password: process.env.DB_PASSWORD || ''
        },
        pool: {
            min: process.env.DB_MIN_POOL || 2,
            max: process.env.DB_MAX_POOL || 10
        },
        migrations: {
            tableName: process.env.DB_MIRATIONS_TABLE_NAME || 'knex_migrations'
        }
    },
    staging: {
        client: 'postgresql',
        connection: {
            database: 'my_db',
            user: 'username',
            password: 'password'
        },
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            tableName: 'knex_migrations'
        }
    },

    production: {
        client: 'postgresql',
        connection: {
            database: 'my_db',
            user: 'username',
            password: 'password'
        },
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            tableName: 'knex_migrations'
        }
    }

};
