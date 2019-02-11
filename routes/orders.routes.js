const router = require('express').Router();
require('./param_loaders/orders.loader').init(router);

const ordersController = require('../controllers/orders.controller');
const AuthMiddleware = require('../middlewares/auth.middleware');
const parsePaginationParams = require('../middlewares/paging.middleware').parsePaginationParams;


router.get('', parsePaginationParams, AuthMiddleware.mustBeAuthenticated, ordersController.getOrders);
router.get('/:order_load_ids', AuthMiddleware.mustBeAuthenticated, AuthMiddleware.userOwnsItOrIsAdmin, ordersController.getOrderDetails);
router.post('', ordersController.createOrder);

module.exports = router;