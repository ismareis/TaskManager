const jwt = require('jsonwebtoken');
const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../../.env')
});

class JwtService {
    static generateToken(user) {
        return jwt.sign(
            {
                id: user.id,
                username: user.username,
                accessLevel: user.accessLevel, 
                tokenVersion: user.tokenVersion
            },
            process.env.JWT_SECRET
        );
    }

    static verifyToken(token) {
        return jwt.verify(token, process.env.JWT_SECRET);
    }
}

module.exports = JwtService;