const router = require('express').Router();
const AddressesController = require('../controllers/addresses.controller');
const AuthMiddleware = require('../middlewares/auth.middleware');
const parsePaginationParams = require('../middlewares/paging.middleware').parsePaginationParams;


router.get('/users/addresses', parsePaginationParams, AuthMiddleware.mustBeAuthenticated, AddressesController.getAddresses);
router.post('/users/addresses', AuthMiddleware.mustBeAuthenticated, AddressesController.createAddress);

module.exports = router;