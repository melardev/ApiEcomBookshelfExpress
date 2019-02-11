const _ = require('lodash');
const CommentResponseDto = require('../dtos/responses/comments.dto');
const CommentRequestDto = require('../dtos/requests/comments.dto');
const AppResponseDto = require('../dtos/responses/app_response.dto');
const Comment = require('../config/db.config').Comment;
const User = require('../config/db.config').User;

exports.getCommentsFromProduct = function (req, res, next) {
    return Comment.where({product_id: req.productId}).fetchPage({
        page: req.page,
        pageSize: req.pageSize,
        withRelated: [{
            'user': (queryBuilder) => {
                queryBuilder.column('id', 'username');
            }
        }],
        // If we use columns attribute we MUST include user_id column otherwise the queryBuilder.column above will not work
        columns: ['id', 'content', 'created_at', 'updated_at', 'user_id'],
        debug: process.env.SHOW_SQL,
    }).then(function (comments) {
        const commentsCount = comments.pagination.rowCount;
        return res.json(CommentResponseDto.buildPagedList(comments.serialize(), req.page, req.pageSize, commentsCount, req.baseUrl, true));
    }).catch(err => {
        return res.json(AppResponseDto.buildSuccessWithMessages(err.message));
    });
};

exports.createComment = function (req, res, next) {
    const bindingResult = CommentRequestDto.createCommentDto(req.body);
    if (!_.isEmpty(bindingResult.errors)) {
        return res.json(AppResponseDto.buildWithErrorMessages(bindingResult.errors));
    }

    Comment.create({
        product_id: req.product.id,
        user_id: req.user.id,
        content: req.body.content,
        rating: req.body.rating
    }, {debug: process.env.SHOW_SQL}).then(comment => {
        return res.json(CommentResponseDto.buildDetails(comment.serialize(), false, false));
    }).catch(err => {
        return res.json(AppResponseDto.buildWithErrorMessages(err.message));
    });
};

exports.updateComment = function (req, res, ext) {
    return res.json(AppResponseDto.buildNotImplementedResponse());
};
exports.deleteComment = function (req, res, next) {
    req.rawComment.destroy().then(result => {
        return res.json(AppResponseDto.buildSuccessWithMessages('comment removed successfully'));
    }).catch(err => {
        return res.json(AppResponseDto.buildWithErrorMessages('Error ' + err));
    });
};

exports.getCommentDetails = function (req, res, next) {
    return res.json(CommentResponseDto.buildDetails(req.comment, true, true))
};
