const Order = require('./../../config/db.config').Order;
const OrderItem = require('./../../config/db.config').OrderItem;
const AppResponseDto = require('../../dtos/responses/app_response.dto');

function init(router) {
    router.param('order_load_ids', function (req, res, next) {

        Order.where({id: req.params.order_load_ids}).fetch({
            columns: ['id', 'user_id'],
        }).then(function (order) {
            if (!order)
                return res.json(AppResponseDto.buildWithErrorMessages('Order not found'), 404);
            req.order = order.serialize();
            req.userOwnable = order.serialize(); // userOwnable is read by the authorization middleware
            return next();
        }).catch(err => {
            return res.json(AppResponseDto.buildWithErrorMessages(err), 404);
        });
    });
}

module.exports = {
    init
};