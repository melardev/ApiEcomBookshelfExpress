const PageMetaDto = require('./page_meta.dto');

function buildPagedList(categories, page, pageSize, totalProductsCount, basePath) {
    return {
        success: true,
        page_meta: PageMetaDto.build(categories.length, page, pageSize, totalProductsCount, basePath),
        ...buildDtos(categories),
    }
}

function buildDtos(categories) {
    if (!categories)
        return {categories: []};
    return {
        categories: categories.map(category => buildDto(category, true))
    }
}

function buildDto(category, includeUrls = false) {
    const summary = {
        id: category.id,
        name: category.name,
    };

    if (includeUrls && category.images) {
        // replace all back slashes with forward slashes
        summary.image_urls = category.images.map(image => image.file_path);
    }
    return summary;
}

module.exports = {
    buildDtos, buildPagedList, buildDto
};
