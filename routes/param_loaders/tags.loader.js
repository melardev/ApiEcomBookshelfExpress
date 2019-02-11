const Tag = require('../../config/db.config').Tag;
const AppResponseDto = require('./../../dtos/responses/app_response.dto');

function init(router) {
    router.param('tag_slug', function (req, res, next, slug) {
        Tag.where({slug}).fetch({
            columns: ['id'],
            debug: process.env.DEBUG
        }).then(tag => {
            req.tagId = tag.id;
            return next();
        }).catch(err => {
            return res.json(AppResponseDto.buildWithErrorMessages(err.message));
        });
    });

    router.param('tag_id', function (req, res, next, id) {
        req.tagId = id;
        next();
    });

}

module.exports = {
    init
};