# Security Policy

## Overview

SEN-MOOL PROTECT 2.0 is a critical maritime safety system. Security is our highest priority.

## Supported Versions

| Version | Status | Support Until |
|---------|--------|---|
| 1.0.x | Active | 2026-12-31 |
| 0.9.x | Deprecated | 2026-06-30 |

## Reporting Vulnerabilities

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, please email: security@senmoolprotect.sn

Include:
- Type of vulnerability
- Location in codebase
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

Response time: We aim to respond within 48 hours.

## Security Best Practices

### Authentication & Authorization

✅ **Implemented:**
- JWT token-based authentication
- Role-based access control (RBAC)
- Permission-based authorization
- Password hashing with bcrypt
- Token expiration and refresh

⚠️ **Recommendations:**
- Use strong passwords (min 12 characters)
- Rotate JWT_SECRET regularly
- Enable 2FA for admin accounts
- Use HTTPS only in production
- Implement rate limiting

### Data Protection

✅ **Implemented:**
- MongoDB encryption at rest (enable in production)
- MQTT TLS/SSL support
- CORS protection
- XSS prevention with Helmet
- CSRF protection

⚠️ **Recommendations:**
- Encrypt sensitive data in transit
- Use VPN for device communication
- Enable database backups
- Sanitize user inputs
- Use prepared statements

### Infrastructure Security

✅ **Implemented:**
- Docker containerization
- Network isolation
- Health checks
- Automated scaling

⚠️ **Recommendations:**
- Run in private subnets
- Use security groups
- Enable firewall rules
- Monitor access logs
- Keep dependencies updated

### API Security

✅ **Implemented:**
- Bearer token authentication
- Input validation
- Rate limiting
- Error sanitization
- CORS whitelisting
- Request signing

⚠️ **Recommendations:**
- Use API keys for service-to-service
- Implement request throttling
- Log sensitive operations
- Monitor suspicious activity
- Use API versioning

### Third-party Services

**Secure Configuration:**
- Twilio: Use auth tokens, never embed in client code
- Firebase: Restrict API keys by IP and domain
- External APIs: Use environment variables

## Vulnerability Response Process

1. **Receive Report**: Confirm receipt within 24 hours
2. **Investigate**: Verify and assess severity
3. **Patch**: Create fix and test thoroughly
4. **Release**: Deploy security patch ASAP
5. **Disclose**: Public vulnerability notice after patch
6. **Document**: Update security guidelines

## Severity Levels

- **Critical**: Immediate action required, affects all users
- **High**: Significant risk, affects many users
- **Medium**: Moderate risk, specific scenarios
- **Low**: Minor risk, edge cases

## Security Headers

The application includes:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`
- `Content-Security-Policy: default-src 'self'`

## Compliance

- **GDPR**: User data minimization, right to deletion
- **Senegal Data Protection**: Compliance with local regulations
- **Maritime Safety**: Adherence to international standards
- **IoT Security**: OWASP IoT Top 10 compliance

## Regular Security Audits

- Monthly dependency checks
- Quarterly penetration testing
- Annual security assessment
- Continuous vulnerability scanning

## Contact

Security Questions: security@senmoolprotect.sn
General Support: support@senmoolprotect.sn
