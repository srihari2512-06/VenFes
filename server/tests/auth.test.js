import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { assertOwnership, requireRole } from '../src/middleware/auth.js';
import { generateTokens } from '../src/utils/token.js';

test('Auth - Password hashing and comparison (FR-06)', async () => {
  const plainPassword = 'SuperSecretPassword123!';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(plainPassword, salt);

  assert.notEqual(hash, plainPassword);
  assert.equal(await bcrypt.compare(plainPassword, hash), true);
  assert.equal(await bcrypt.compare('WrongPassword', hash), false);
});

test('Auth - Token generation and payload', () => {
  const mockUser = {
    _id: '66f123456789abcdef012345',
    email: 'vendor@example.com',
    role: 'vendor'
  };

  const { accessToken, refreshToken } = generateTokens(mockUser);
  assert.ok(accessToken);
  assert.ok(refreshToken);
  assert.equal(typeof accessToken, 'string');
});

test('Auth - S3: assertOwnership prevents Vendor A from accessing Vendor B resource', () => {
  const vendorAId = '66f123456789abcdef000001';
  const vendorBId = '66f123456789abcdef000002';

  const userA = { _id: vendorAId, role: 'vendor' };
  const userB = { _id: vendorBId, role: 'vendor' };
  const adminUser = { _id: '66f123456789abcdef999999', role: 'admin' };

  // Vendor A accessing Vendor A's product -> true
  assert.equal(assertOwnership(vendorAId, userA), true);

  // Vendor B accessing Vendor A's product -> false (S3)
  assert.equal(assertOwnership(vendorAId, userB), false);

  // Admin accessing Vendor A's product -> true
  assert.equal(assertOwnership(vendorAId, adminUser), true);
});

test('Auth - S4: requireRole blocks users lacking appropriate role', () => {
  const middleware = requireRole('admin');
  let statusSet = null;
  let jsonSent = null;

  const mockRes = {
    status(code) {
      statusSet = code;
      return this;
    },
    json(body) {
      jsonSent = body;
      return this;
    }
  };

  const customerReq = { user: { role: 'customer' } };
  middleware(customerReq, mockRes, () => {});

  assert.equal(statusSet, 403);
  assert.equal(jsonSent.error.code, 'FORBIDDEN');
});
