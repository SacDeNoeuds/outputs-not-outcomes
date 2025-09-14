import assert from 'node:assert'
import { Result } from '../src/result.js'
import { RuntimeError } from '../src/runtime-error.js'

class InvalidPassword extends Error {}
class DbError extends Error {}
class AccountExistsWithEmail extends Error {}

export interface Account {
  id: string;
  email: string;
  password: string;
}

function validatePassword(password: string) {
  return new Result<InvalidPassword, void>((resolve, reject) => {
    if (password === 'invalid') reject(new InvalidPassword())
    // @ts-expect-error simulate a type error
    else if (password.includes('type-error')) a.b.c.d
    else resolve()
  })
}

function assertNoAccountExistsWithEmail(email: string) {
  return new Result<DbError | AccountExistsWithEmail, void>((resolve, reject) => {
    if (email.startsWith('db-error')) reject(new DbError())
    else if (email.startsWith('exists')) reject(new AccountExistsWithEmail())
    // @ts-expect-error simulate a type error
    else if (email.startsWith('type-error@')) a.b.c.d
    else resolve()
  })
}

function createAccount(email: string, password: string) {
  return new Result<DbError, Account>((resolve, reject) => {
    if (password.includes('db-error')) reject(new DbError())
    resolve({ id: 'random-id', email, password })
  })
}

function register(email: string, password: string) {
  return validatePassword(password)
    .then(() => {
      // @ts-expect-error simulate a type error
      if (email.includes('type-error-in-then')) a.b.c
      return assertNoAccountExistsWithEmail(email)
    })
    .then(() => createAccount(email, password))
}

async function test_invalid_password() {
  await assert.rejects(register('toto@example.com', 'invalid'), InvalidPassword)
}

async function test_db_error_from_account_exists_check() {
  await assert.rejects(register('db-error@example.com', 'pwd'), DbError)
}

async function test_db_error_from_create_account() {
  await assert.rejects(register('email@example.com', 'db-error-pwd'), DbError)
}

async function test_account_created() {
  const email = 'email@example.com'
  const password = 'valid-password'
  const account = await register(email, password)
  assert.equal(account.email, email)
  assert.equal(account.password, password)
  assert.ok(account.id)
}

async function test_runtime_error_in_validate_password() {
  await assert.rejects(register('test@example.com', 'type-error'), RuntimeError)
}

async function test_runtime_error_in_account_exists_check() {
  await assert.rejects(register('type-error@example.com', 'ok'), RuntimeError)
}
async function test_runtime_error_in_then() {
  await assert.rejects(register('type-error-in-then@example.com', 'ok'), RuntimeError)
}

async function run_tests() {
  const tests = [
    test_invalid_password,
    test_db_error_from_account_exists_check,
    test_db_error_from_create_account,
    test_account_created,
    test_runtime_error_in_validate_password,
    test_runtime_error_in_account_exists_check,
    test_runtime_error_in_then,
  ]
  for (const test of tests) {
    console.info('>', test.name.replaceAll('_', ' '))
    await test()
  }
  console.info()
}

run_tests().then(
  () => console.info('Tests passed ✅'),
  (error) => {
    console.info('Tests failed ❌')
    console.info()
    console.error(error)
  },
)
