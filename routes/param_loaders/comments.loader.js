const Comment = require('../../config/db.config').Comment;
const Product = require('../../config/db.config').Product;
const User = require('../../config/db.config').User;

const AppResponseDto = require('../../dtos/responses/app_response.dto');

function init(router) {
    router.param('comment', function (req, res, next, id) {
        Comment.query('where', 'id', id).fetch({
            withRelated: [{
                user: (queryBuilder) => queryBuilder.column('id', 'username')
            }, {
                product: (queryBuilder) => queryBuilder.column('id', 'name', 'slug')
            }],
            debug: process.env.SHOW_SQL
        })
            .then(function (comment) {
                if (!comment)
                    return res.json(AppResponseDto.buildWithErrorMessages('Comment not found'), 404);

                req.comment = comment.serialize();
                req.rawComment = comment;
                return next();
            }).catch(err => {
            return res.json(AppResponseDto.buildWithErrorMessages('Error ' + err));
        });
    });


    router.param('comment_load_ids', function (req, res, next, id) {
        Comment.where({id}).fetch({
            columns: ['id', 'user_id', 'product_id']
        }).then(function (comment) {
            if (!comment) {
                return res.json(AppResponseDto.buildWithErrorMessages('Comment not found'), 404);
            }
            req.comment = comment.serialize();
            req.rawComment = comment;
            req.userOwnable = comment.serialize();
            next();
        }).catch(err => {
            return res.json(AppResponseDto.buildWithErrorMessages(err.message));
        });
    });
};

module.exports = {
    init
};