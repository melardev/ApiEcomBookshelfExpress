const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const AppResponseDto = require('../dtos/responses/app_response.dto');

const checkToken = expressJwt({
    secret: process.env.JWT_SECRET || 'JWT_SUPER_SECRET',
    getToken: getTokenFromHeader,
    userProperty: 'decodedJwt'
});

function getTokenFromHeader(req) {
    if (req.hasOwnProperty('headers') && req.headers.hasOwnProperty('authorization')
        && req.headers.authorization.split(' ')[0] === 'Token' ||
        req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
    }

    return null;
}

const User = require('../config/db.config').User;

/**
 *  Decode user's token
 * */
const readToken = function (req, res, next) {
    // if the loadoUser middleware has already laoded the user then no need to reload it again
    if (req.user != null)
        return next();

    if (req.hasOwnProperty('headers') && req.headers.hasOwnProperty('authorization')
        && req.headers.authorization.split(' ')[0] === 'Bearer' ||
        req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') {
        checkToken(req, res, next);
    } else {
        return next();
    }

};

exports.isAdmin = (req, res, next) => {

    if (req.user === null)
        return res.json(AppResponseDto.buildWithErrorMessages('Access denied, you re not Logged In'));

    if (req.user.roles.some(role => role.name === 'ROLE_ADMIN'))
        next();
    else
        return res.json(AppResponseDto.buildWithErrorMessages('Access denied, you re not an Author'));
};

const getFreshUser = (required) => {
    return (req, res, next) => {
        if (req.decodedJwt == null || req.decodedJwt.user_id == null) {
            if (required) // no jwt, and it is required
                return res.json(AppResponseDto.buildWithErrorMessages('Permission denied'));
            else // no jwt, but it is not required
                return next();
        }
        User.where({id: req.decodedJwt.user_id}).fetch({
            withRelated: [{
                'roles': queryBuilder => {
                    queryBuilder.column('roles.id', 'name');
                }
            }]
        })
            .then((user) => {
                if (!user) {
                    // if no user is found, but
                    // it was a valid JWT but didn't decode
                    // to a real user in our DB. Either the user was deleted
                    // since the client got the JWT, or
                    // it was a JWT from some other source
                    return res.status(401).send({error: 'Unauthorized'});
                } else {
                    req.rawUser = user;
                    req.user = user.serialize();
                    next();
                }
            })
            .catch((err) => {
                res.json(AppResponseDto.buildWithErrorMessages(err));
            });
    };
};

exports.isAuthenticated = (req, res, next) => {
    if (req.user != null) {
        next();
        return;
    }
    return res.json(AppResponseDto.buildWithErrorMessages('Permission denied, you must be authenticated'))
};

exports.generateJwtSync = function (user) {

    const roles = user.roles || [];
    return jwt.sign(
        {
            user_id: user.id,
            username: user.username,
            roles: roles.map(role => role.name)
        },
        process.env.JWT_SECRET || 'JWT_SUPER_SECRET',
        {expiresIn: process.env.EXPIRE_TIME || 360000}
    );
};
exports.mustBeAuthenticated = [readToken, getFreshUser(true)];
exports.loadUser = [readToken, getFreshUser(false)];

exports.userOwnsItOrIsAdmin = (req, res, next) => {
    if (req.user != null && (req.rawUser.isAdminSync() || req.userOwnable.user_id === req.user.id))
        next();
    else
        return res.json(AppResponseDto.buildWithErrorMessages('This resource does not belong to you'));
};

// TODO: replace by userOwnsItOrIsOnly
exports.ownsCommentOrIsAdmin = (req, res, next) => {
    if (req.user != null && (req.user.roles.some(role => role.name === 'ROLE_ADMIN') // is admin ?
        || req.comment.userId === req.user.id))
        next();
    else
        return res.json(AppResponseDto.buildWithErrorMessages('This comment does not belong to you'));
};
