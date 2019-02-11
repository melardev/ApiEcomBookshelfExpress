const ORDER_STATUS = require('../constants').ORDER_STATUS;
const faker = require('faker');
const _ = require('lodash');

const knex = require('../config/db.config').knex;
const User = require('../config/db.config').User;
const Address = require('../config/db.config').Address;
const Product = require('../config/db.config').Product;
const Comment = require('../config/db.config').Comment;
const Order = require('../config/db.config').Order;
const OrderItem = require('../config/db.config').OrderItem;
const Role = require('../config/db.config').Role;
const Tag = require('../config/db.config').Tag;
const Category = require('../config/db.config').Category;
const UserRole = require('../config/db.config').UserRole;

async function seedAdminFeature() {

    console.log('[+] Seeding Admin feature');

    await Promise.all([
        Role.findOrCreate({name: 'ROLE_ADMIN'}, {
            defaults: {description: 'For Admin Users'}
        }),
        User.findOrCreate({username: 'admin'}, {
            defaults: {
                password: 'password',
                email: 'admin@api_mongoose.com',
                first_name: 'adminFN',
                last_name: 'adminLN',
            },
            withRelated: ['roles'],
        })
    ]).then(async results => {
        const role = results[0];
        const user = results[1];

        if (!user.isAdminSync()) {
            //user.roles().model.fetchAll().then();
            await user.roles().attach(role.id, {debug: true}).then(res => {
                console.log(res);
            }).catch(err => {
                throw err;
            });
        }
    }).catch(err => {
        throw err;
    });
}

async function seedUsersFeature() {
    console.log('[+] Seeding Author feature');

    await Role.findOrCreate({name: 'ROLE_USER'}, {
        defaults: {description: 'For standard Users'}
    }).then(async role => {

        await UserRole.where('role_id', role.id).count('*').then(async count => {
            const usersSeed = 30 - count;
            if (usersSeed > 0) {
                for (let i = 0; i < usersSeed; i++) {
                    await User.create({
                        first_name: faker.name.firstName(),
                        last_name: faker.name.lastName(),
                        email: faker.internet.email(),
                        username: faker.name.firstName() + faker.name.lastName(),
                        password: 'password'
                    }).then(async user => {
                        await user.roles().attach(role.id).then(res => {
                            console.log('[+] Seeded a standard user ' + user.get('username'));
                        }).catch(err => {
                            throw err;
                        });
                    }).catch(err => {
                        throw err;
                    });
                }
            }
        }).catch(err => {
            throw err;
        });

    }).catch(err => {
        throw err;
    });
}

function seedTags() {
    return Promise.all([
        Tag.findOrCreate({name: 'jeans'}, {
            defaults: {
                description: 'jeans for everyone'
            }
        }),
        Tag.findOrCreate({name: 'shoes'}, {
            defaults: {
                description: 'shoes for everyone'
            }
        }),
        Tag.findOrCreate({name: 'jackets'}, {
            defaults: {
                description: 'jackets for everyone'
            }
        })]).then(results => {
        console.log('[+] Seeded tags')
    }).catch(err => console.error(err));
}

function seedCategories() {
    return Promise.all([
        Category.findOrCreate({name: 'men'}, {
            default: {
                description: 'men fashion'
            }
        }),
        Category.findOrCreate({name: 'women'}, {
            defaults: {
                description: 'Java fashion'
            }
        }),
        Category.findOrCreate({name: 'kids'}, {
            defaults: {
                description: 'Ruby fashion'
            }
        })]).then(results => {
        console.log('[+] Seeded categories');
    }).catch(err => console.error(err));

}

async function seedProducts() {
    // faker.lorem.paragraphs
    // faker.lorem.sentence
    // faker.random.number

    await Product.query().count('* as productCount').then(async products => {
        const count = products[0].productCount;
        let productsToSeed = 17;
        productsToSeed -= count;
        if (productsToSeed <= 0) {
            return;
        }

        await Promise.all([
            Tag.fetchAll({columns: ['id']}),
            Category.fetchAll({columns: ['id']}),
        ]).then(async results => {
            const tags = results[0].serialize();
            const categories = results[1].serialize();

            for (let i = 0; i < productsToSeed; i++) {
                let tag = tags[Math.floor(Math.random() * tags.length)];
                let category = categories[Math.floor(Math.random() * categories.length)];
                await Product.create({
                    name: faker.commerce.productName() + faker.random.number({min: 0, max: 120}),
                    description: faker.lorem.text(),
                    price: parseInt(faker.commerce.price(10, 1000, 2)) * 100,
                    stock: faker.random.number({min: 0, max: 120}),
                }).then(async product => {
                    const promises = [];
                    promises.push(product.tags().attach(tag.id));
                    promises.push(product.categories().attach(category.id));
                    await Promise.all(promises).then(res => {
                        console.log('[+] seeded product successfully')
                    }).catch(err => {
                        throw err;
                    });
                }).catch(err => {
                    throw err;
                });
            }
        }).catch(err => {
            throw err;
        });
    }).catch(err => {
        throw err;
    });
}

async function seedComments() {
    await Promise.all([
        Comment.query().count('* as commentCount'),
        Product.fetchAll({columns: ['id']}),
        User.fetchAll({columns: ['id']})
    ]).then(async res => {
        const count = res[0][0]['commentCount'];
        const product_ids = res[1];
        const user_ids = res[2];

        let commentsToSeed = 35;
        commentsToSeed -= count;
        if (commentsToSeed <= 0) {
            console.log('[+] Skipping comments seeds, there are many already.');
            return;
        }

        console.log(`[+] Seeding ${commentsToSeed} comments`);

        for (let i = 0; i < commentsToSeed; i++) {
            const product_id = product_ids.models[Math.floor(Math.random() * product_ids.models.length)].id;
            const user_id = user_ids.models[Math.floor(Math.random() * user_ids.models.length)].get('id');
            const comment = new Comment({
                content: faker.lorem.sentence(),
                rating: faker.random.boolean() ? faker.random.number({min: 1, max: 5}) : null,
                user_id: user_id,
                product_id: product_id,
            });
            await comment.save().then(comment => {

            }).catch(err => {
                throw err;
            });
        }
        console.log('[+] seeded coments ');
    }).catch(err => {
    });

}

async function seedAddresss() {
    await Address.query().count('* as addressesCount').then(async result => {
            const addressesCount = result[0]['addressesCount'];
            let addressesToSeed = 23;
            addressesToSeed -= addressesCount;

            await User.fetchAll({
                columns: ['id', 'first_name', 'last_name']
            }).then(async users => {
                users = users.serialize();
                const userIds = users.map(user => user.id); // or results[0].pluck('id')

                for (let i = 0; i < addressesToSeed; i++) {
                    let address = new Address({
                        address: faker.address.streetAddress(true),
                        country: faker.address.country(),
                        city: faker.address.city(),
                        zip_code: faker.address.zipCode(),
                    });

                    if (faker.random.boolean() || faker.random.boolean()) {
                        const user = users[Math.floor(Math.random() * users.length)];
                        address.set('user_id', user.id);
                        address.set('first_name', user.first_name);
                        address.set('last_name', user.last_name);
                    } else {
                        address.set('first_name', faker.name.firstName());
                        address.set('last_name', faker.name.lastName());
                    }

                    await address.save(null, {debug: true}).then(result => {
                    }).catch(err => {
                        throw err;
                    });
                }

                console.log('seeded addresses successfully');
            });
        }
    ).catch(err => {
        throw err;
    });
}

async function seedOrders() {
    await Order.fetchAll({
        columns: ['id']
    }).then(res => {

        const ordersCount = res.length;
        let ordersToSeed = 30;
        ordersToSeed -= ordersCount;
        const promises = [];
        if (ordersToSeed > 0) {
            promises.push(User.fetchAll({
                columns: ['id'],
                withRelated: [{
                    'addresses': (queryBuilder) => {
                        queryBuilder.select('id', 'user_id');
                    },
                }]
            }));
            promises.push(Address.findAll(null, {columns: ['id', 'user_id']}));
            promises.push(Product.findAll(null, {columns: ['id', 'name', 'slug', 'price']}));

            return Promise.all(promises).then(res => {
                promises.length = 0; // Clear the array
                const users = res[0].serialize();
                const addresses = res[1].serialize();
                const products = res[2].serialize();
                const guestAddresses = addresses.filter(a => a.user_id == null);

                for (let i = 0; i < ordersToSeed; i++) {

                    const order = {
                        tracking_number: faker.random.alphaNumeric(16), // 16 alphaNumeric chars long
                        order_status: _.sample(ORDER_STATUS).ordinal,
                    };

                    let user = users[Math.floor(Math.random() * users.length)];
                    if ((user.addresses.length > 0)
                        &&
                        (faker.random.boolean() || faker.random.boolean() || faker.random.boolean())) {

                        order.user_id = user.id;
                        order.address_id = user.addresses[Math.floor(Math.random() * user.addresses.length)].id;
                    } else
                        order.address_id = guestAddresses[Math.floor(Math.random() * guestAddresses.length)].id;

                    promises.push(Order.create(order, {debug: true}));
                }

                return Promise.all(promises).then(res => {
                    const orders = res;
                    promises.length = 0; // Clear the array

                    for (let i = 0; i < orders.length; i++) {
                        let order = orders[i];
                        const orderItemsToSeed = faker.random.number({min: 1, max: 12});
                        for (let j = 0; j < orderItemsToSeed; j++) {
                            let product = products[Math.floor(Math.random() * products.length)];
                            promises.push(OrderItem.create({
                                name: product.name,
                                slug: product.slug,
                                user_id: order.get('user_id'),
                                order_id: order.id,
                                product_id: product.id,
                                price: Math.min(10, product.price - faker.random.number({min: -50, max: 50})),
                                quantity: faker.random.number({min: 1, max: 10})
                            }));
                        }
                    }

                    return Promise.all(promises).then(res => {
                        const orderItems = res;

                        console.log('Done');
                    }).catch(err => {
                        throw err;
                    })
                }).catch(err => {
                    throw err;
                });
            }).catch(err => {
                throw err;
            });

        }


    }).catch(err => {
        throw err;
    });
    // Create Order, ORderInfo and Address all at Once
    /*Order.create({
        trackingCode: faker.random.some(),
        userId: user.id,
        orderInfo: {
            status: 1,
            address: {}
        }
    }, {
        include: [
            {
                association: Order.OrderInfo,
                include: [OrderInfo.Address]
            }
        ]
    });
    */
}

async function seedAll() {
    await seedAdminFeature();
    await seedUsersFeature();
    await seedTags();
    await seedCategories();

    await seedProducts();
    await seedComments();

    await seedAddresss();

    await seedOrders();

    console.log('[+] Finished seeding');
    process.exit();
}

seedAll().then(() => {

    process.exit(0);
}).catch(err => {
    throw err;
});
