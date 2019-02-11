const OrderDto = require('../dtos/responses/orders.dto');
const AppResponseDto = require('../dtos/responses/app_response.dto');
const Order = require('./../config/db.config').Order;
const User = require('./../config/db.config').User;
const Product = require('./../config/db.config').Product;
const bookshelf = require('./../config/db.config').bookshelf;
const Address = require('./../config/db.config').Address;
const OrderItem = require('./../config/db.config').OrderItem;
const AddressRequestDto = require('../dtos/requests/addresses.dto');
const _ = require('lodash');
exports.getOrders = function (req, res, next) {
    return Promise.all([
        Order.where({user_id: req.user.id}).fetchPage({
            page: req.page,
            pageSize: req.pageSize,
            withRelated: [
                'orderItems',
                // TODO: why this does not work?
                // {'orderItems': (queryBuilder) => {queryBuilder.select('name')}},
            ],
            debug: process.env.SHOW_SQL
        }),
        Order.where({user_id: req.user.id}).count({debug: process.env.SHOW_SQL})
    ]).then(function (results) {
        const ordersCount = results[1];
        const orders = results[0].serialize();
        orders.forEach(order => order.order_items_count = (order.orderItems || []).length);
        return res.json(OrderDto.buildPagedList(orders, req.page, req.pageSize, ordersCount, req.baseUrl, false));
    }).catch(err => {
        return res.json(AppResponseDto.buildSuccessWithMessages(err.message));
    });
};

async function createOrderNewAddress(req, res, transaction) {
    const resultBinding = AddressRequestDto.createAddressDto(req.body, req.user);
    if (!_.isEmpty(resultBinding.errors)) {
        return res.status(422).json(AppResponseDto.buildWithErrorMessages(resultBinding.errors));
    }
    await Address.create(resultBinding.validatedData, {transaction}).then(async address => {
        address = address.serialize();
        address.user = req.user;
        await _createOrderFromAddress(req, res, address, transaction);
    }).catch(err => {
        throw err;
    });
}

exports.createOrder = async function (req, res, next) {
    const addressId = req.body.address_id;
    /*
    let transac = undefined;
    bookshelf.transaction(async function (transaction) {
        transac = transaction;

        */
    let err = null;
    if (req.user != null && addressId != null) {
        err = await _createOrderReuseAddress(req, res, addressId);
    } else if (addressId == null) {
        err = await createOrderNewAddress(req, res);
    } else {
        // since tthe createOrder endpoint is not required to be auth, it may be an user with a valid JWT, but deleted account
        // or from other app that uses the same JWT_SECRET(my case) where the user_id claim is not matched against a user, so address_id is != null but req.user == null
        return res.json(AppResponseDto.buildWithErrorMessages('Error, maybe your token is expired?'));
    }


    /* if (!err)
         transaction.commit();
     else
         transaction.rollback();
 }).exec(() => {
     console.log(2);
 });
 */
};

exports.getOrderDetails = function (req, res, next) {
    Order.where({id: req.order.id}).fetch({
        withRelated: ['address', 'address.user', 'orderItems']
    }).then(order => {
        const serializedOrder = order.serialize();
        serializedOrder.user = serializedOrder.address.user;
        serializedOrder.order_items_count = serializedOrder.orderItems.length;
        return res.json(OrderDto.buildDto(serializedOrder, true, true, true));
    }).catch(err => {
        return res.json(AppResponseDto.buildWithErrorMessages(err));
    });
};

// TODO
exports.updateOrder = (req, res, next) => {
    return res.json(AppResponseDto.buildWithErrorMessages('not implemented'));
};

async function _createOrderReuseAddress(req, res, addressId, transaction) {

    await Address.where({id: addressId}).fetch({
        columns: ['id', 'user_id', 'first_name', 'last_name', 'zip_code', 'address']
    }).then(async address => {
        address = address.serialize();
        if (req.user && req.rawUser && (req.rawUser.isAdminSync() || address.user_id !== req.user.id)) {
            return await _createOrderFromAddress(req, res, address, transaction);
        } else {
            throw new Error('You do not own this address');
        }
    }).catch(err => {
        throw err;
    });
}

async function _createOrderFromAddress(req, res, address, transaction) {

    await Order.create({
        user_id: address.user_id, address_id: address.id
    }, {transaction}).then(async order => {
        order = order.serialize();
        const cartItems = req.body.cart_items;
        const cartItemsIds = cartItems.map(cartItem => cartItem.id);

        await Product.where('id', 'in', cartItemsIds).fetchAll({
            columns: ['id', 'name', 'slug', 'price'],
            debug: process.env.SHOW_SQL
        }).then(async products => {
            products = products.serialize();

            if (products.length !== cartItems.length)
                return res.json(AppResponseDto.buildWithErrorMessages('Make sure the products still exist'));

            const promises = products.map((product, index) => {
                return new OrderItem({
                    name: product.name,
                    slug: product.slug,
                    price: product.price,
                    quantity: cartItems[index].quantity,
                    user_id: req.user ? req.user.id : undefined,
                    order_id: order.id,
                    product_id: product.id
                }).save(null, {transaction});
            });
            await Promise.all(promises).then(orderItems => {
                order.orderItems = orderItems.map(oi => oi.serialize());
                order.address = address;

                order.user = req.user;
                return res.json(OrderDto.buildDto(order, false, true, true));
            }).catch(err => {
                throw err;
            });
        }).catch(err => {
            throw err;
        });
    }).catch(err => {
        throw err;
    });
}
