# MarketLink – Database Documentation

## 1. Overview

MarketLink uses a relational PostgreSQL database to manage users, roles, products, categories, shopping carts, orders, payments, deliveries, reviews, notifications and administrative activities.

The current database contains 18 tables and 114 columns. It supports product management, shopping, order processing, simulated payments and user administration.

## 2. Database Tables

### 2.1 `users`

Stores registered user account information.

| Column        | Data type                   | Constraints                         |
| :------------ | :-------------------------- | :---------------------------------- |
| user_id       | integer                     | PK, GENERATED ALWAYS AS IDENTITY    |
| email         | character varying           | NOT NULL, UNIQUE                    |
| password_hash | character varying           | NOT NULL                            |
| first_name    | character varying           | NOT NULL                            |
| last_name     | character varying           | NOT NULL                            |
| phone         | character varying           | NULL                                |
| account_type  | character varying           | NOT NULL, CHECK                     |
| company_name  | character varying           | NULL                                |
| tax_id        | character varying           | NULL                                |
| is_active     | boolean                     | NOT NULL, DEFAULT true              |
| created_at    | timestamp without time zone | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at    | timestamp without time zone | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

The account type must be either `individual` or `company`. Company accounts must have a company name, while individual accounts must not.

### 2.2 `roles`

Stores the roles available in the application.

| Column      | Data type         | Constraints                      |
| :---------- | :---------------- | :------------------------------- |
| role_id     | integer           | PK, GENERATED ALWAYS AS IDENTITY |
| role_name   | character varying | NOT NULL, UNIQUE                 |
| description | text              | NULL                             |

### 2.3 `user_roles`

Associates users with their assigned roles.

| Column      | Data type                   | Constraints                         |
| :---------- | :-------------------------- | :---------------------------------- |
| user_id     | integer                     | PK, FK → users.user_id              |
| role_id     | integer                     | PK, FK → roles.role_id              |
| assigned_at | timestamp without time zone | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

The table uses a composite primary key consisting of `user_id` and `role_id`.

### 2.4 `categories`

Stores product categories and their hierarchy.

| Column             | Data type         | Constraints                       |
| :----------------- | :---------------- | :-------------------------------- |
| category_id        | integer           | PK, GENERATED ALWAYS AS IDENTITY  |
| name               | character varying | NOT NULL, UNIQUE                  |
| description        | text              | NULL                              |
| parent_category_id | integer           | FK → categories.category_id, NULL |

A category can have a parent category, allowing hierarchical organization.

### 2.5 `products`

Stores products offered by sellers.

| Column         | Data type                   | Constraints                         |
| :------------- | :-------------------------- | :---------------------------------- |
| product_id     | integer                     | PK, GENERATED ALWAYS AS IDENTITY    |
| seller_id      | integer                     | FK → users.user_id                  |
| name           | character varying           | NOT NULL                            |
| description    | text                        | NULL                                |
| price          | numeric                     | NOT NULL, CHECK >= 0                |
| stock_quantity | integer                     | NOT NULL, DEFAULT 0, CHECK >= 0     |
| unit           | character varying           | NULL                                |
| status         | character varying           | NOT NULL, DEFAULT 'active', CHECK   |
| created_at     | timestamp without time zone | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at     | timestamp without time zone | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

Product status can be `active`, `inactive` or `removed`.

### 2.6 `product_categories`

Connects products with categories.

| Column      | Data type | Constraints                     |
| :---------- | :-------- | :------------------------------ |
| product_id  | integer   | PK, FK → products.product_id    |
| category_id | integer   | PK, FK → categories.category_id |

The table uses a composite primary key to implement a many-to-many relationship.

### 2.7 `carts`

Stores customer shopping carts.

| Column      | Data type                   | Constraints                         |
| :---------- | :-------------------------- | :---------------------------------- |
| cart_id     | integer                     | PK, GENERATED ALWAYS AS IDENTITY    |
| customer_id | integer                     | FK → users.user_id, UNIQUE          |
| created_at  | timestamp without time zone | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at  | timestamp without time zone | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

Each customer can have one shopping cart.

### 2.8 `cart_items`

Stores products and quantities added to shopping carts.

| Column       | Data type                   | Constraints                         |
| :----------- | :-------------------------- | :---------------------------------- |
| cart_item_id | integer                     | PK, GENERATED ALWAYS AS IDENTITY    |
| cart_id      | integer                     | FK → carts.cart_id                  |
| product_id   | integer                     | FK → products.product_id            |
| quantity     | integer                     | NOT NULL, CHECK > 0                 |
| added_at     | timestamp without time zone | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

A unique constraint on `(cart_id, product_id)` prevents the same product from appearing more than once as a separate cart item.

### 2.9 `orders`

Stores customer orders.

| Column           | Data type                   | Constraints                         |
| :--------------- | :-------------------------- | :---------------------------------- |
| order_id         | integer                     | PK, GENERATED ALWAYS AS IDENTITY    |
| customer_id      | integer                     | FK → users.user_id                  |
| order_date       | timestamp without time zone | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| status           | character varying           | NOT NULL, DEFAULT 'pending', CHECK  |
| total_amount     | numeric                     | NOT NULL, DEFAULT 0, CHECK >= 0     |
| shipping_address | text                        | NOT NULL                            |
| notes            | text                        | NULL                                |

Order status can be `pending`, `confirmed`, `processing`, `shipped`, `delivered` or `cancelled`.

### 2.10 `order_items`

Stores individual products included in orders.

| Column        | Data type         | Constraints                        |
| :------------ | :---------------- | :--------------------------------- |
| order_item_id | integer           | PK, GENERATED ALWAYS AS IDENTITY   |
| order_id      | integer           | FK → orders.order_id               |
| product_id    | integer           | FK → products.product_id           |
| seller_id     | integer           | FK → users.user_id                 |
| quantity      | integer           | NOT NULL, CHECK > 0                |
| unit_price    | numeric           | NOT NULL, CHECK >= 0               |
| subtotal      | numeric           | NOT NULL, CHECK >= 0               |
| status        | character varying | NOT NULL, DEFAULT 'pending', CHECK |

The table stores the product quantity, unit price and subtotal for each order item.

Order item status can be `pending`, `confirmed`, `processing`, `shipped`, `delivered` or `cancelled`.

### 2.11 `payments`

Stores payment attempts and their results.

| Column                | Data type                   | Constraints                         |
| :-------------------- | :-------------------------- | :---------------------------------- |
| payment_id            | integer                     | PK, GENERATED ALWAYS AS IDENTITY    |
| order_id              | integer                     | FK → orders.order_id                |
| amount                | numeric                     | NOT NULL, CHECK >= 0                |
| payment_method        | character varying           | NOT NULL, DEFAULT 'simulated'       |
| status                | character varying           | NOT NULL, DEFAULT 'pending', CHECK  |
| transaction_reference | character varying           | UNIQUE, NULL                        |
| created_at            | timestamp without time zone | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

Payment status can be `pending`, `successful`, `rejected` or `timeout`.

### 2.12 `stock_reservations`

Tracks reserved product quantities during order processing.

| Column         | Data type                   | Constraints                         |
| :------------- | :-------------------------- | :---------------------------------- |
| reservation_id | integer                     | PK, GENERATED ALWAYS AS IDENTITY    |
| order_item_id  | integer                     | FK → order_items.order_item_id      |
| quantity       | integer                     | NOT NULL, CHECK > 0                 |
| status         | character varying           | NOT NULL, DEFAULT 'reserved', CHECK |
| reserved_at    | timestamp without time zone | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| expires_at     | timestamp without time zone | NULL                                |

Reservation status can be `reserved`, `confirmed`, `released` or `expired`.

### 2.13 `shipments`

Stores delivery information for individual order items.

| Column           | Data type                   | Constraints                            |
| :--------------- | :-------------------------- | :------------------------------------- |
| shipment_id      | integer                     | PK, GENERATED ALWAYS AS IDENTITY       |
| order_item_id    | integer                     | FK → order_items.order_item_id, UNIQUE |
| tracking_number  | character varying           | UNIQUE, NULL                           |
| shipping_address | text                        | NOT NULL                               |
| status           | character varying           | NOT NULL, DEFAULT 'pending', CHECK     |
| shipped_at       | timestamp without time zone | NULL                                   |
| delivered_at     | timestamp without time zone | NULL                                   |
| created_at       | timestamp without time zone | NOT NULL, DEFAULT CURRENT_TIMESTAMP    |

Shipment status can be `pending`, `preparing`, `shipped`, `delivered` or `failed`.

### 2.14 `reviews`

Stores customer reviews of purchased products.

| Column        | Data type                   | Constraints                            |
| :------------ | :-------------------------- | :------------------------------------- |
| review_id     | integer                     | PK, GENERATED ALWAYS AS IDENTITY       |
| customer_id   | integer                     | FK → users.user_id                     |
| product_id    | integer                     | FK → products.product_id               |
| order_item_id | integer                     | FK → order_items.order_item_id, UNIQUE |
| rating        | integer                     | NOT NULL, CHECK 1–5                    |
| comment       | text                        | NULL                                   |
| created_at    | timestamp without time zone | NOT NULL, DEFAULT CURRENT_TIMESTAMP    |

The unique constraint on `order_item_id` allows only one review per order item.

### 2.15 `notifications`

Stores notifications sent to users.

| Column          | Data type                   | Constraints                         |
| :-------------- | :-------------------------- | :---------------------------------- |
| notification_id | integer                     | PK, GENERATED ALWAYS AS IDENTITY    |
| user_id         | integer                     | FK → users.user_id                  |
| title           | character varying           | NOT NULL                            |
| message         | text                        | NOT NULL                            |
| is_read         | boolean                     | NOT NULL, DEFAULT false             |
| created_at      | timestamp without time zone | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

### 2.16 `audit_logs`

Stores records of important actions performed in the application.

| Column      | Data type                   | Constraints                         |
| :---------- | :-------------------------- | :---------------------------------- |
| log_id      | integer                     | PK, GENERATED ALWAYS AS IDENTITY    |
| user_id     | integer                     | FK → users.user_id, NULL            |
| action      | character varying           | NOT NULL                            |
| entity_type | character varying           | NOT NULL                            |
| entity_id   | integer                     | NULL                                |
| details     | text                        | NULL                                |
| created_at  | timestamp without time zone | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

### 2.17 `support_tickets`

Stores customer support requests.

| Column      | Data type                   | Constraints                         |
| :---------- | :-------------------------- | :---------------------------------- |
| ticket_id   | integer                     | PK, GENERATED ALWAYS AS IDENTITY    |
| user_id     | integer                     | FK → users.user_id                  |
| assigned_to | integer                     | FK → users.user_id, NULL            |
| subject     | character varying           | NOT NULL                            |
| description | text                        | NOT NULL                            |
| status      | character varying           | NOT NULL, DEFAULT 'open', CHECK     |
| created_at  | timestamp without time zone | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at  | timestamp without time zone | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

Ticket status can be `open`, `in_progress`, `resolved` or `closed`.

### 2.18 `reports`

Stores reports submitted by users about products or reviews.

| Column      | Data type                   | Constraints                         |
| :---------- | :-------------------------- | :---------------------------------- |
| report_id   | integer                     | PK, GENERATED ALWAYS AS IDENTITY    |
| reported_by | integer                     | FK → users.user_id                  |
| product_id  | integer                     | FK → products.product_id, NULL      |
| review_id   | integer                     | FK → reviews.review_id, NULL        |
| reason      | text                        | NOT NULL                            |
| status      | character varying           | NOT NULL, DEFAULT 'pending', CHECK  |
| created_at  | timestamp without time zone | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

A CHECK constraint ensures that each report refers to exactly one target: either a product or a review.

Report status can be `pending`, `under_review`, `accepted` or `rejected`.

## 3. Relationships

### 3.1 One-to-many relationships

- One user can have multiple orders.
- One user can have multiple products.
- One user can receive multiple notifications.
- One order can contain multiple order items.
- One order can have multiple payment attempts.
- One category can have multiple subcategories.
- One product can have multiple reviews.
- One order item can have multiple stock reservations.

### 3.2 Many-to-many relationships

- Users and roles are connected through `user_roles`.
- Products and categories are connected through `product_categories`.

### 3.3 Other relationships

- Each customer can have one cart.
- Each cart can contain multiple cart items.
- Each order item can have one shipment.
- Each order item can have one review.
- Users can create and be assigned support tickets.
- Users can submit reports about products or reviews.

## 4. Database Constraints

The database uses the following constraints:

- **PRIMARY KEY (PK):** uniquely identifies each record.
- **FOREIGN KEY (FK):** connects related tables.
- **NOT NULL:** requires a value in a column.
- **UNIQUE:** prevents duplicate values.
- **CHECK:** ensures that values satisfy defined conditions.
- **DEFAULT:** provides a default value when one is not supplied.

### 4.1 Automatically Generated IDs

Sixteen tables use PostgreSQL identity columns with `GENERATED ALWAYS AS IDENTITY` for their primary keys.

The tables `user_roles` and `product_categories` use composite primary keys and do not have automatically generated ID columns.

### 4.2 Referential Actions

The following `ON DELETE` rules are configured on foreign keys:

| Table              | Column             | References                | ON DELETE |
| :----------------- | :----------------- | :------------------------ | :-------- |
| audit_logs         | user_id            | users.user_id             | SET NULL  |
| cart_items         | cart_id            | carts.cart_id             | CASCADE   |
| cart_items         | product_id         | products.product_id       | CASCADE   |
| carts              | customer_id        | users.user_id             | CASCADE   |
| categories         | parent_category_id | categories.category_id    | SET NULL  |
| notifications      | user_id            | users.user_id             | CASCADE   |
| order_items        | order_id           | orders.order_id           | RESTRICT  |
| order_items        | product_id         | products.product_id       | RESTRICT  |
| order_items        | seller_id          | users.user_id             | RESTRICT  |
| orders             | customer_id        | users.user_id             | NO ACTION |
| payments           | order_id           | orders.order_id           | RESTRICT  |
| product_categories | category_id        | categories.category_id    | CASCADE   |
| product_categories | product_id         | products.product_id       | CASCADE   |
| products           | seller_id          | users.user_id             | NO ACTION |
| reports            | product_id         | products.product_id       | CASCADE   |
| reports            | reported_by        | users.user_id             | NO ACTION |
| reports            | review_id          | reviews.review_id         | CASCADE   |
| reviews            | customer_id        | users.user_id             | NO ACTION |
| reviews            | order_item_id      | order_items.order_item_id | NO ACTION |
| reviews            | product_id         | products.product_id       | NO ACTION |
| shipments          | order_item_id      | order_items.order_item_id | RESTRICT  |
| stock_reservations | order_item_id      | order_items.order_item_id | RESTRICT  |
| support_tickets    | assigned_to        | users.user_id             | SET NULL  |
| support_tickets    | user_id            | users.user_id             | NO ACTION |
| user_roles         | role_id            | roles.role_id             | RESTRICT  |
| user_roles         | user_id            | users.user_id             | CASCADE   |

`ON UPDATE` is configured as `NO ACTION` for all listed foreign keys.

## 5. Business Rules Requiring Backend Validation

Some business rules require application-level validation and database transactions in addition to the constraints defined above.

Examples include:

- Ensuring that only users with the seller role can create products.
- Preventing purchases when product stock is insufficient.
- Preventing duplicate processing of successful payment results.
- Allowing reviews only after successful delivery.
- Updating product stock consistently when orders are processed.

These rules must be enforced by the backend application and, where appropriate, database transactions.

The `updated_at` columns have a `DEFAULT CURRENT_TIMESTAMP` value, which sets their initial value when a row is inserted. This default does not automatically change the value when the row is updated. The backend must update these columns when modifying a record, unless a database trigger is implemented for that purpose.

## 6. Database Summary

- **Database management system:** PostgreSQL
- **Number of tables:** 18
- **Number of columns:** 114
- **Number of foreign keys:** 26
- **Identity primary keys:** 16
- **Composite primary keys:** 2