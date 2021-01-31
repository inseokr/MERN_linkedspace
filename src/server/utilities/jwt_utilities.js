const passportJWT = require('passport-jwt');
const jwt = require('jsonwebtoken');

const { ExtractJwt } = passportJWT;
const JwtStrategy = passportJWT.Strategy;

const jwtOptions = {};

jwtOptions.jwtFromRequest = passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = 'tasmanianDevil';

module.exports = {
  jwtOptions
};
