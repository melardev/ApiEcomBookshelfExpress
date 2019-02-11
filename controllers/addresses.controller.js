const AddressDto = require('../dtos/responses/address.dto');
const AppResponseDto = require('../dtos/responses/app_response.dto');
const AddressRequestDto = require('../dtos/requests/addresses.dto');
const Address = require('./../config/db.config').Address;
const _ = require('lodash');

exports.getAddresses = function (req, res, next) {
    Address.where({user_id: req.user.id}).fetchPage({
        page: req.page,
        pageSize: req.pageSize
    }).then(function (addresses) {
        return res.json(AddressDto.buildPagedList(addresses.serialize(), req.page, req.pageSize, addresses.pagination.rowCount, req.baseUrl));
    }).catch(err => {
        return res.json(AppResponseDto.buildWithErrorMessages(err));
    });
};

exports.createAddress = function (req, res, next) {
    const resultBinding = AddressRequestDto.createAddressDto(req.body, req.user);
    if (!_.isEmpty(resultBinding.errors)) {
        return res.status(422).json(AppResponseDto.buildWithErrorMessages(resultBinding.errors));
    }

    new Address(resultBinding.validatedData).save().then(address => {
        return res.json(AppResponseDto.buildWithDtoAndMessages(AddressDto.buildDto(address), 'Address created successfully'));
    }).catch(err => {
        return res.json(AppResponseDto.buildWithErrorMessages(err.message));
    });
};

