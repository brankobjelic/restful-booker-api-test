# Restful-Booker API Test Suite

Automated API tests for the **[Restful-Booker API](https://restful-booker.herokuapp.com/apidoc/index.html)**, built using native JavaScript `fetch`, **Mocha**, and **Chai**.

## Prerequisites

- **Node.js** v18+ (required for native `fetch` support)
- **npm**

## Installation

Clone the repository and install dependencies:

```bash
git clone 
cd restful-booker-api-test
npm install
```

## Running the Tests

```bash
npm test
```

This runs all test files matching `test/**/*.test.js` using **Mocha**.

## Test Coverage

The suite covers the full booking lifecycle plus an authorization negative test:

1. **Authentication** — creates a token via `POST /auth` and reuses it in subsequent authorized requests
2. **Create booking** — `POST /booking`
3. **Get booking by ID** — `GET /booking/:id`
4. **Update booking** — `PUT /booking/:id` *(authorized, using token)*
5. **Reject unauthorized update** — `PUT /booking/:id` without a valid token, expecting `403 Forbidden`
6. **Delete booking** — `DELETE /booking/:id` *(authorized, using token)*

Each test includes assertions for:

- ✅ HTTP status code
- ✅ Response headers (`Content-Type`)
- ✅ Response body content/shape

## Notes on API Behavior

- `POST /booking` and `GET /booking/:id` do **not** require authentication.
- `PUT`, `PATCH`, and `DELETE` require either a `Cookie: token=<value>` header or HTTP Basic Auth.
- `DELETE /booking/:id` returns `201 Created` with the body text `"Created"` — unconventional, but reflects actual API behavior.
- Tests are **order-dependent**, since they simulate a realistic booking lifecycle (*create → read → update → delete*). Deletion is intentionally run last to avoid affecting earlier assertions.

## Tech Stack

| Tool | Purpose |
|------|---------|
| [Mocha](https://mochajs.org/) | Test runner |
| [Chai](https://www.chaijs.com/) | Assertion library |
| [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) | HTTP requests (native, no external library) |
