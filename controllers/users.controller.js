const _ = require('lodash');

const User = require('../config/db.config').User;
const UserRole = require('../config/db.config').UserRole;
const Role = require('../config/db.config').Role;

const UserResponseDto = require('../dtos/responses/users.dto');
const UserRequestDto = require('../dtos/requests/users.dto');

const AppResponseDto = require('../dtos/responses/app_response.dto');


exports.register = (req, res) => {
    const body = req.body;
    const resultBinding = UserRequestDto.createUserRequestDto(req.body);
    if (!_.isEmpty(resultBinding.errors)) {
        return res.status(422).json(AppResponseDto.buildWithErrorMessages(resultBinding.errors));
    }

    const email = resultBinding.validatedData.email;
    const username = resultBinding.validatedData.username;

    User.query(queryBuilder => {
        queryBuilder.select('username', 'email');
        queryBuilder.where('username', username).orWhere('email', email)
    }).fetch({
        debug: process.env.DEBUG
    })
        .then((user) => {

            if (user) {
                const errors = {};
                // If the user exists, return Error
                if (user.username === body.username)
                    errors.username = 'username: ' + body.username + ' is already taken';

                if (user.email === body.email)
                    errors.email = 'Email: ' + body.email + ' is already taken';

                if (!_.isEmpty(errors)) {
                    return res.status(403).json(AppResponseDto.buildWithErrorMessages(errors));
                }
            }

            Promise.all([
                User.create(resultBinding.validatedData),
                Role.findOrCreate({name: 'ROLE_USER'}, {
                    defaults: {description: 'For standard Users'}
                })
            ])
                .then((results) => {
                    const user = results[0];
                    const role = results[1];
                    if (user === null) {
                        throw user
                    }

                    if (user) {
                        UserRole.create({
                            user_id: user.id,
                            role_id: role.id
                        }).then(result => {
                            res.json(UserResponseDto.registerDto(user));
                        }).catch(err => {
                            return res.json(AppResponseDto.buildWithErrorMessages(err));
                        });
                    } else
                        return res.json(AppResponseDto.buildWithErrorMessages('I do not know what happened'));
                })
                .catch((err) => {
                    return res.status(400).send(AppResponseDto.buildWithErrorMessages(err));
                });
        })
        .catch((err) => {
            return res.status(400).send(AppResponseDto.buildWithErrorMessages(err));
        });
};

exports.login = (req, res) => {
    // TODO: move this to UserRequestDto
    const username = req.body.username;
    const password = req.body.password;

    // if no email or password then send
    if (!username || !password) {
        res.status(400).send({error: 'You need a email and password'});
        return;
    }

    // check 1: lookup the user if it already exists
    // check2: compare passwords
    User.where({
        username,
    }).fetch({
        withRelated: [
            {
                roles: function (queryBuilder) {
                    queryBuilder.column('roles.id', 'name')
                }
            }
        ], debug: process.env.DEBUG
    }).then(function (user) {
        if (user && user.isValidPasswordSync(password)) {
            req.user = user.serialize();
            return res.status(200).json(UserResponseDto.loginSuccess(req.user));
        } else
            return res.json(AppResponseDto.buildWithErrorMessages('Invalid credentials'));
    }).catch(err => {
        res.json(AppResponseDto.buildWithErrorMessages(err));
    });
};
