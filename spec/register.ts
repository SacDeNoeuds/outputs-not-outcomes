import assert from "node:assert"
import { Result } from "../src/result.js"

class InvalidEmail extends Error {}
class InvalidPassword extends Error {}
class DbError extends Error {}
class AccountExistsWithEmail extends Error {}

export interface Account {
  id: string
  email: string
  password: string
}

function validatePassword(password: string) {
  return new Result<InvalidPassword, void>((resolve, reject) => {
    if (password === "invalid") reject(new InvalidPassword())
    else resolve()
  })
}
function validateEmail(email: string) {
  return new Result<InvalidEmail, void>((resolve, reject) => {
    email.includes('@') ? resolve() : reject(new InvalidEmail())
  })
}

function assertNoAccountExistsWithEmail(email: string) {
  return new Result<DbError | AccountExistsWithEmail, void>(
    (resolve, reject) => {
      if (email.startsWith("db-error")) reject(new DbError())
      else if (email.startsWith("exists")) reject(new AccountExistsWithEmail())
      else resolve()
    },
  )
}

function createAccount(email: string, password: string) {
  return new Result<DbError, Account>((resolve, reject) => {
    if (password.includes("db-error")) reject(new DbError())
    resolve({ id: "random-id", email, password })
  })
}

function register(email: string, password: string) {
  return validatePassword(password)
    .then(() => validateEmail(email))
    .then(() => assertNoAccountExistsWithEmail(email))
    .then(() => createAccount(email, password))
}

async function test_invalid_password() {
  await assert.rejects(register("toto@example.com", "invalid"), InvalidPassword)
}

async function test_invalid_email() {
  await assert.rejects(register("toto_example.com", "pwd"), InvalidEmail)
}

async function test_db_error_from_account_exists_check() {
  await assert.rejects(register("db-error@example.com", "pwd"), DbError)
}

async function test_db_error_from_create_account() {
  await assert.rejects(register("email@example.com", "db-error-pwd"), DbError)
}

async function test_account_created() {
  const email = "email@example.com"
  const password = "valid-password"
  const account = await register(email, password)
  assert.equal(account.email, email)
  assert.equal(account.password, password)
  assert.ok(account.id)
}

const tests = [
  test_invalid_password,
  test_invalid_email,
  test_db_error_from_account_exists_check,
  test_db_error_from_create_account,
  test_account_created,
]
async function run_tests() {
  for (const test of tests) {
    console.info(">", test.name.replaceAll("_", " "))
    await test()
  }
  console.info()
}

run_tests().then(
  () => {
    console.info("Tests passed ✅")
    process.exit(0)
  },
  (error) => {
    console.info("Tests failed ❌")
    console.info()
    console.error(error)
    process.exit(1)
  },
)
