# API Reference

Base URL: `http://localhost:3000`

All endpoints return JSON. Authentication endpoints are public; user and store endpoints require a valid token (coming soon).

---

## Authentication

### Register

Create a new user account.

`POST /auth/register`

**Request Body**

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | Yes | Valid email address |
| `password` | string | Yes | Minimum 6 characters |
| `firstName` | string | Yes | First name |
| `lastName` | string | Yes | Last name |

**Example**

Windows (PowerShell):

```powershell
$body = '{"email":"nelit@test.com","password":"secret123","firstName":"Nelit","lastName":"Vlorzas"}'
Invoke-RestMethod -Uri "http://localhost:3000/auth/register" -Method POST -ContentType "application/json" -Body $body
```

Linux / macOS:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"nelit@test.com","password":"secret123","firstName":"Nelit","lastName":"Vlorzas"}'
```

**Response `201`**

```json
{
  "message": "This action registers a new user"
}
```

**Errors**

| Status | Condition |
|---|---|
| `400` | Missing required field, invalid email |

---

### Login

Authenticate an existing user.

`POST /auth/login`

**Request Body**

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | Yes | Registered email |
| `password` | string | Yes | Account password |

**Example**

Windows (PowerShell):

```powershell
$body = '{"email":"nelit@test.com","password":"secret123"}'
Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method POST -ContentType "application/json" -Body $body
```

Linux / macOS:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nelit@test.com","password":"secret123"}'
```

**Response `200`**

```json
{
  "message": "This action logs in a user"
}
```

> **Planned:** Will return a JWT token and user object.

**Errors**

| Status | Condition |
|---|---|
| `400` | Missing field, invalid email format |
| `401` | Invalid credentials *(planned)* |

---

## Users

### Get Profile

Return the authenticated user's profile.

`GET /users/me`

**Example**

Browser (all OS):

```
http://localhost:3000/users/me
```

**Response `200`**

```json
{
  "message": "This action returns the user profile with id: 1"
}
```

> **Planned:** Will return `{ id, email, firstName, lastName, phone, storeId }`.

---

### Update Profile

Update the authenticated user's profile. All fields optional.

`PUT /users/me`

**Request Body**

| Field | Type | Required | Description |
|---|---|---|---|
| `firstName` | string | No | First name |
| `lastName` | string | No | Last name |
| `email` | string | No | Valid email address |
| `phone` | string | No | Phone number |

**Example**

Windows (PowerShell):

```powershell
$body = '{"firstName":"Nelly"}'
Invoke-RestMethod -Uri "http://localhost:3000/users/me" -Method PUT -ContentType "application/json" -Body $body
```

Linux / macOS:

```bash
curl -X PUT http://localhost:3000/users/me \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Nelly"}'
```

**Response `200`**

```json
{
  "message": "This action updates the user profile with id: 1"
}
```

**Errors**

| Status | Condition |
|---|---|
| `400` | Invalid email format |

---

## Categories

### List Categories

`GET /categories`

**Example**

Browser (all OS):

```
http://localhost:3000/categories
```

**Response `200`**

```json
{
    "message": "This action returns all categories"
}
```

> **Planned:** Will return `{ id, name, slug }`.

---

### Get Category

`GET /categories/:id`

**Path Parameters**

| Param | Type | Description |
|---|---|---|
| `id` | integer | Category ID |

**Example**

Browser (all OS):

```
http://localhost:3000/categories/1
```

**Response `200`**

```json
{
    "message": "This action returns a #1 category"
}
```

> **Planned:** Will return `{ id, name, slug }`.

**Errors**

| Status | Condition |
|---|---|
| `404` | Category not found |

---

### Create Category

`POST /categories`

**Request Body**

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | Category name |
| `slug` | string | No | URL-safe identifier (auto-generated if omitted) |

**Example**

Windows (PowerShell):

```powershell
$body = '{"name":"Toys"}'
Invoke-RestMethod -Uri "http://localhost:3000/categories" -Method POST -ContentType "application/json" -Body $body
```

Linux / macOS:

```bash
curl -X POST http://localhost:3000/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Toys"}'
```

**Response `201`**

```json
{
    "message": "This action adds a new category"
}
```

**Errors**

| Status | Condition |
|---|---|
| `400` | Missing `name`, empty `name` |

---

### Update Category

All fields optional. Send only what changed.

`PUT /categories/:id`

**Request Body**

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | No | New category name |
| `slug` | string | No | New slug |

**Example**

Windows (PowerShell):

```powershell
$body = '{"slug":"toys-and-games"}'
Invoke-RestMethod -Uri "http://localhost:3000/categories/3" -Method PATCH -ContentType "application/json" -Body $body
```

Linux / macOS:

```bash
curl -X PATCH http://localhost:3000/categories/3 \
  -H "Content-Type: application/json" \
  -d '{"slug":"toys-and-games"}'
```

**Response `200`**

```json
{
    "message": "This action updates a #3 category"
}
```

**Errors**

| Status | Condition |
|---|---|
| `404` | Category not found |

---

### Delete Category

`DELETE /categories/:id`

**Example**

Windows (PowerShell):

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/categories/3" -Method DELETE
```

Linux / macOS:

```bash
curl -X DELETE http://localhost:3000/categories/3
```

**Response `200`**

```json
{
    "message": "This action removes a #3 category"
}
```

**Errors**

| Status | Condition |
|---|---|
| `404` | Category not found |

---

## Listings

### List Listings

`GET /listings`

**Example**

Browser (all OS):

```
http://localhost:3000/listings
```

**Response `200`**

```json
[
  {
    "id": 1,
    "title": "iPhone 14 Pro",
    "description": "95% battery, no scratches",
    "price": 750,
    "categoryId": 1,
    "location": "Berlin",
    "status": "active"
  }
]
```

> **Planned:** Query params for filtering — `http://localhost:3000/listings?categoryId=1&status=active&search=iphone`

---

### Get Listing

`GET /listings/:id`

**Example**

Browser (all OS):

```
http://localhost:3000/listings/1
```

**Response `200`**

```json
{
    "message": "This action returns all listings"
}
```

> **Planned:** Will return `{ id, title, description, price, categoryId, location, imageUrl, status }`.


**Errors**

| Status | Condition |
|---|---|
| `404` | Listing not found |

---

### Create Listing

`POST /listings`

**Request Body**

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | Yes | Listing title |
| `description` | string | Yes | Item description |
| `price` | number | Yes | Price (must be ≥ 0) |
| `categoryId` | integer | Yes | Must reference an existing category |
| `location` | string | Yes | Location of the item |
| `imageUrl` | string | No | URL to item photo |

**Example**

Windows (PowerShell):

```powershell
$body = '{"title":"Herman Miller Aeron","description":"Size B, great condition","price":450,"categoryId":2,"location":"Munich"}'
Invoke-RestMethod -Uri "http://localhost:3000/listings" -Method POST -ContentType "application/json" -Body $body
```

Linux / macOS:

```bash
curl -X POST http://localhost:3000/listings \
  -H "Content-Type: application/json" \
  -d '{"title":"Herman Miller Aeron","description":"Size B, great condition","price":450,"categoryId":2,"location":"Munich"}'
```

**Response `201`**

```json
{
    "message": "This action adds a new listing"
}
```

**Errors**

| Status | Condition |
|---|---|
| `400` | Missing required field, negative price, invalid categoryId |

---

### Update Listing

All fields optional. Send only what changed.

`PUT /listings/:id`

**Request Body**

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | No | New title |
| `description` | string | No | New description |
| `price` | number | No | New price (≥ 0) |
| `categoryId` | integer | No | New category |
| `location` | string | No | New location |
| `imageUrl` | string | No | New image URL |

**Example**

Windows (PowerShell):

```powershell
$body = '{"price": 380}'
Invoke-RestMethod -Uri "http://localhost:3000/listings/2" -Method PATCH -ContentType "application/json" -Body $body
```

Linux / macOS:

```bash
curl -X PATCH http://localhost:3000/listings/2 \
  -H "Content-Type: application/json" \
  -d '{"price": 380}'
```

**Response `200`**

```json
{
    "message": "This action updates a #2 listing"
}
```

**Errors**

| Status | Condition |
|---|---|
| `404` | Listing not found |

---

### Delete Listing

`DELETE /listings/:id`

**Example**

Windows (PowerShell):

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/listings/2" -Method DELETE
```

Linux / macOS:

```bash
curl -X DELETE http://localhost:3000/listings/2
```

**Response `200`**

```json
{
    "message": "This action removes a #2 listing"
}
```

**Errors**

| Status | Condition |
|---|---|
| `404` | Listing not found |

---

## Planned Endpoints

| Method | Route | Description |
|---|---|---|
| `GET` | `/stores` | List all stores/markets |
| `POST` | `/stores` | Create a store |
| `GET` | `/stores/:id/listings` | Listings scoped to a store |
| `POST` | `/orders` | Place an order |
| `GET` | `/orders` | List orders |

---

## Error Format

All errors follow this shape:

```json
{
  "message": "string or array of strings",
  "error": "Bad Request | Not Found | Internal Server Error",
  "statusCode": 400
}
```

| Status Code | Meaning |
|---|---|
| `400` | Validation failed, bad input |
| `401` | Unauthenticated *(planned)* |
| `404` | Resource not found |
| `500` | Server error |
