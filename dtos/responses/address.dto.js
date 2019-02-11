const UserDto = require('./users.dto');
const PageMetaDto = require('./page_meta.dto');


function buildPagedList(addresses, page, pageSize, totalProductsCount, basePath) {
    return {
        success: true,
        page_meta: PageMetaDto.build(page, pageSize, totalProductsCount, basePath),
        ...buildDtos(addresses),
    }
}

function buildDtos(addresses) {
    return {
        addresses: addresses.map(address => buildDto(address))
    }
}

function buildDto(address, includeUser = false) {
    if (address == null)
        return {};
    const summary = {
        id: address.id,
        first_name: address.first_name,
        last_name: address.last_name,
        address: address.address,
        city: address.city,
        country: address.country,
        zip_code: address.zip_code,
    };

    if (includeUser)
        summary.user = UserDto.buildOnlyForIdAndUsername(address.user);

    return summary;
}

module.exports = {
    buildDtos, buildDto, buildPagedList
};