const PagesDto = require('../dtos/responses/pages.dto');
const Tag = require('./../config/db.config').Tag;
const Category = require('./../config/db.config').Category;
const CategoryImage = require('./../config/db.config').CategoryImage;
const TagImage = require('./../config/db.config').TagImage;
const AppResponseDto = require('../dtos/responses/app_response.dto');

exports.index = (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;
    const offset = (page - 1) * pageSize;

    return Promise.all([
        Tag.fetchPage({
            offset: 0,
            limit: pageSize,
            order: [['createdAt', 'DESC'],],
            include: [
                {
                    model: TagImage,
                    required: false,
                    as: 'images',
                    attributes: ['id', 'filePath']
                },
            ]
        }),
        Category.fetchPage({
            offset: 0,
            limit: pageSize,
            order: [['createdAt', 'DESC'],],
            include: [
                {
                    model: CategoryImage,
                    attributes: ['id', 'filePath'],
                    as: 'images',
                    required: false,
                },
            ]
        }),
    ]).then(function (results) {
        const tags = results[0].serialize();
        const categories = results[1].serialize();

        return res.json(AppResponseDto.buildSuccessWithDto(PagesDto.buildHome(tags, categories)));
    }).catch(err => {
        return res.json(AppResponseDto.buildWithErrorMessages(err));
    });
};
