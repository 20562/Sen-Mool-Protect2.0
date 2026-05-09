const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class AuthService {
  static generateToken(user, expiresIn = '24h') {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        permissions: user.permissions || [],
      },
      process.env.JWT_SECRET,
      { expiresIn }
    );
  }

  static verifyToken(token) {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error(`Invalid token: ${error.message}`);
    }
  }

  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  static async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }
}

module.exports = AuthService;
