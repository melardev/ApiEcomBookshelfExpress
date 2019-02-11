const User = require('../../config/db.config').User;
const Role = require('../../config/db.config').Role;

function init(router) {
    // Preload product objects on routes with ':product'
    router.param('user', function (req, res, next, username) {
        User.findOne({
            where: {username: username},
            include: [Role]
        })
            .then(function (user) {
                if (!user) {
                    return res.sendStatus(404);
                }

                req.requested_user = user.serialize();
                return next();
            }).catch(next);
    });
}

module.exports = {
    init
};