const RolesDto = require("./roles.dto");
const generateJwtSync = (require('./../../middlewares/auth.middleware')).generateJwtSync;


function registerDto(user) {
    return {
        success: true,
        full_messages: ['User registered successfully']
    };
}

function loginSuccess(user) {
    const token = generateJwtSync(user);
    return {
        success: true,
        token,
        user: {
            id: user.id,
            username: user.username,
            first_name: user.first_name,
            lastName: user.last_name,
            roles: RolesDto.toNameList(user.roles || []),
        }
    }
}

function buildOnlyForIdAndUsername(user) {
    if (user == null)
        return {};
    return {
        id: user.id,
        username: user.username
    }
}

module.exports = {
    registerDto, loginSuccess, buildOnlyForIdAndUsername
};