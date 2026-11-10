# MarketLink – ER Diagram and Relational Data Model

This is a proposed logical model for the required MarketLink marketplace workflows. It complements the database table and constraint documentation in [PR #20](https://github.com/VlahoErceg/FESB-MarketLink/pull/20); it does not modify that document or represent a database that has already been created.

The model uses one category per product and requires an image URL, as decided for this ER model. The database-level columns and constraints should be finalized together with the detailed schema.

## ER Diagram

```mermaid
erDiagram
    USERS {
        int user_id PK
        string email UK
        string password_hash
        string first_name
        string last_name
        string phone
    }

    ROLES {
        int role_id PK
        string role_name UK
    }

    USER_ROLES {
        int user_id PK, FK
        int role_id PK, FK
        datetime assigned_at
    }

    SELLER_REQUESTS {
        int seller_request_id PK
        int user_id FK
        int reviewed_by FK
        int request_number
        string status
        datetime submitted_at
        datetime reviewed_at
    }

    CATEGORIES {
        int category_id PK
        string name UK
        int parent_category_id FK
    }

    PRODUCTS {
        int product_id PK
        int seller_id FK
        int category_id FK
        string sale_type
        string name
        string description
        decimal price
        int stock_quantity
        string location
        string image_url
        string status
    }

    AUCTIONS {
        int auction_id PK
        int product_id FK
        decimal starting_price
        decimal current_price
        decimal minimum_increment
        datetime start_time
        datetime end_time
        string status
    }

    BIDS {
        int bid_id PK
        int auction_id FK
        int bidder_id FK
        decimal amount
        datetime created_at
    }

    CARTS {
        int cart_id PK
        int customer_id FK, UK
    }

    CART_ITEMS {
        int cart_item_id PK
        int cart_id FK
        int product_id FK
        int quantity
    }

    ORDERS {
        int order_id PK
        int customer_id FK
        string status
        decimal total_amount
        datetime created_at
    }

    AUCTION_WINNERS {
        int winner_id PK
        int auction_id FK
        int buyer_id FK
        int winning_bid_id FK
        decimal final_price
        int order_id FK
        datetime awarded_at
        string status
        datetime offer_expires_at
    }

    SELLER_ORDERS {
        int seller_order_id PK
        int order_id FK
        int seller_id FK
        string fulfillment_status
    }

    ORDER_ITEMS {
        int order_item_id PK
        int seller_order_id FK
        int product_id FK
        int quantity
        decimal unit_price
        decimal subtotal
    }

    PAYMENTS {
        int payment_id PK
        int order_id FK
        decimal amount
        string status
        string idempotency_key UK
        datetime created_at
    }

    STOCK_RESERVATIONS {
        int reservation_id PK
        int order_item_id FK
        int quantity
        string status
        datetime expires_at
    }

    SHIPMENTS {
        int shipment_id PK
        int order_item_id FK, UK
        string status
        datetime shipped_at
        datetime delivered_at
    }

    RETURNS {
        int return_id PK
        int order_item_id FK
        int quantity
        string status
        datetime requested_at
        datetime seller_received_at
        datetime refunded_at
    }

    REVIEWS {
        int review_id PK
        int customer_id FK
        int product_id FK
        int order_item_id FK, UK
        int rating
        datetime created_at
    }

    NOTIFICATIONS {
        int notification_id PK
        int user_id FK
        string title
        string message
        boolean is_read
        datetime created_at
    }

    AUDIT_LOGS {
        int log_id PK
        int user_id FK
        string action
        string entity_type
        int entity_id
        datetime created_at
    }

    SUPPORT_TICKETS {
        int ticket_id PK
        int user_id FK
        int assigned_to FK
        string subject
        string status
    }

    REPORTS {
        int report_id PK
        int reported_by FK
        int product_id FK
        int review_id FK
        string reason
        string status
    }

    USERS ||--o{ USER_ROLES : has
    ROLES ||--o{ USER_ROLES : assigned_to
    USERS ||--o{ SELLER_REQUESTS : submits
    USERS o|--o{ SELLER_REQUESTS : reviews
    CATEGORIES o|--o{ CATEGORIES : parent_of
    CATEGORIES ||--o{ PRODUCTS : categorizes
    USERS ||--o{ PRODUCTS : sells
    PRODUCTS ||--o{ AUCTIONS : offered_in
    AUCTIONS ||--o{ BIDS : receives
    USERS ||--o{ BIDS : places
    USERS ||--o| CARTS : owns
    CARTS ||--o{ CART_ITEMS : contains
    PRODUCTS ||--o{ CART_ITEMS : added_as
    USERS ||--o{ ORDERS : places
    AUCTIONS ||--o{ AUCTION_WINNERS : awards
    USERS ||--o{ AUCTION_WINNERS : offered_to
    BIDS ||--o| AUCTION_WINNERS : selected_bid
    ORDERS ||--o| AUCTION_WINNERS : checkout_order
    ORDERS ||--|{ SELLER_ORDERS : split_into
    USERS ||--o{ SELLER_ORDERS : fulfills
    SELLER_ORDERS ||--|{ ORDER_ITEMS : contains
    PRODUCTS ||--o{ ORDER_ITEMS : ordered_as
    ORDERS ||--o{ PAYMENTS : has_attempts
    ORDER_ITEMS ||--o{ STOCK_RESERVATIONS : reserves
    ORDER_ITEMS ||--o| SHIPMENTS : ships
    ORDER_ITEMS ||--o{ RETURNS : may_be_returned
    USERS ||--o{ REVIEWS : writes
    PRODUCTS ||--o{ REVIEWS : receives
    ORDER_ITEMS ||--o| REVIEWS : reviewed_after_delivery
    USERS ||--o{ NOTIFICATIONS : receives
    USERS o|--o{ AUDIT_LOGS : performs
    USERS ||--o{ SUPPORT_TICKETS : creates
    USERS o|--o{ SUPPORT_TICKETS : assigned_to
    USERS ||--o{ REPORTS : submits
    PRODUCTS o|--o{ REPORTS : reported_product
    REVIEWS o|--o{ REPORTS : reported_review
```

## Relational Model

| Relation | Purpose and key relationships |
|---|---|
| `users` | User accounts. New accounts receive the buyer role through `user_roles`. |
| `roles`, `user_roles` | Role catalog and user-to-role assignments, including buyer, seller, and administrator. |
| `seller_requests` | Seller applications, decision status, administrator reviewer, and request number. The maximum of three requests per user must be enforced transactionally by the application or database. |
| `categories` | Product categories, optionally arranged in a parent-child hierarchy. |
| `products` | Seller-owned catalog items. Each product references exactly one category and stores its sale type, stock, location, required image URL, and active/archive state. For `FIXED_PRICE`, the existing `price` field is used; for `AUCTION`, the auction record stores the bidding prices. |
| `auctions` | Auction schedules and current state for products sold by auction. Each auction sells one product unit. A product can have auction history, but no more than one scheduled, active, or awaiting a winner's purchase at a time. |
| `bids` | Accepted bid history for an auction. Each bid belongs to one bidder and one auction. |
| `carts`, `cart_items` | One cart per buyer and its product quantities. |
| `orders` | Buyer checkout and order-level amount/status. |
| `auction_winners` | Sequential purchase offers to the highest remaining valid bidder. Each attempt references the selected bid and its order; status and offer expiry track whether it is awaiting checkout, awaiting payment, paid, payment-rejected, payment-timed-out, or expired. |
| `seller_orders` | Groups an order's items by seller so each seller can manage only their fulfillment portion. A unique constraint on `(order_id, seller_id)` identifies each seller portion. |
| `order_items` | Purchased product and quantity snapshots, including unit price and subtotal at checkout. |
| `payments` | Simulated payment attempts and outcomes. An idempotency key supports safe processing of repeated payment events. |
| `stock_reservations` | Inventory reserved for order items while payment is pending, including expiry and release state. |
| `shipments` | Delivery status for an order item. Tracking through a real courier is outside this model. |
| `returns` | Return request and lifecycle for an order item, including when the seller receives it and when the simulated refund is issued. |
| `reviews` | Buyer review tied to a delivered order item; one review per order item. |
| `notifications` | Persisted in-app notifications received by users, including auction outbid alerts. |
| `audit_logs`, `support_tickets`, `reports` | Supporting administrative and support relations included in the companion database proposal; these are not required for the core marketplace ER model. |

## Relationship and Integrity Rules

- One user can have multiple roles and multiple seller requests. A seller request belongs to one applicant and may be reviewed by one administrator.
- A user's seller role is granted only after an administrator approves a request. Pending applicants remain buyers. The request limit is three per user.
- Each product belongs to one seller and one category. Sellers can manage only their own products; administrator permissions are enforced by the application.
- A product uses either `FIXED_PRICE` or `AUCTION` sale type. Fixed-price purchases continue to use the existing cart and checkout flow unchanged; auction purchases use the same order and payment system after a bidder is selected.
- For `FIXED_PRICE`, `products.price` remains the sale price. For `AUCTION`, `auctions.starting_price`, `current_price`, and `minimum_increment` govern bids; fixed-price behavior is otherwise unchanged.
- Each auction is for one unit of the product. A product can have multiple auctions over time, but at most one may be `SCHEDULED` or `ACTIVE` at a time, and no new sale/auction may begin while a winner has an unexpired purchase offer. Auction status is `SCHEDULED`, `ACTIVE`, `ENDED`, or `CANCELLED`.
- A user cannot bid on their own product. A bid is accepted only while its auction is `ACTIVE`, within the start/end time, and only if its amount is at least the current highest bid plus the auction's minimum increment (or at least the starting price when there are no bids).
- Concurrent bids must be serialized or otherwise handled atomically so every accepted bid satisfies the minimum-increment rule and the current price cannot move backwards.
- Whenever a new valid bid raises the current price, create an in-app notification in `notifications` for every earlier bidder whose highest bid in that auction is now below the new highest bid. Do not notify the user who placed the new bid. Notifications are stored for viewing in the application; email and push delivery are not included.
- At auction end, the highest valid bid is offered the purchase first. The bidder has 24 hours from `awarded_at` to accept the offer and start checkout through the existing order/payment flow. The auction product is not available for another sale while a purchase offer is pending.
- Once the winner starts payment, the existing 15-minute payment/reservation timeout applies. If payment is rejected or times out, that offer ends immediately and the next-highest valid bidder is offered the purchase with a new 24-hour deadline. If the winner does not start checkout within 24 hours, the offer expires and the next-highest valid bidder is offered the purchase.
- Each purchase offer is recorded in `auction_winners` with its selected bid, buyer, final price, associated order, status, and `offer_expires_at`. Offer statuses are `OFFER_PENDING`, `PAYMENT_PENDING`, `PAID`, `PAYMENT_REJECTED`, `PAYMENT_TIMED_OUT`, and `EXPIRED`. `OFFER_PENDING` lasts up to 24 hours; `PAYMENT_PENDING` begins when checkout/payment starts and follows the existing 15-minute timeout. Each failed order attempt is cancelled before advancing.
- Only one offer per auction may be pending at a time, and no more than one offer may become the paid final winner. If all valid bidders fail to pay or let their offer expire, the auction ends unsold.
- An auction that ends without bids is marked `ENDED` with no winner or order; the seller may create a new auction for the product.
- Each buyer has at most one cart. A cart contains cart items, and the same product should appear at most once per cart.
- An order belongs to one buyer and is split into one or more seller orders. Each seller order belongs to one seller and contains one or more order items.
- Order items preserve the purchased product, quantity, and confirmed unit price so later product edits do not change historical orders.
- Inventory reservation and payment result processing must be atomic and idempotent. A repeated request or payment event must not duplicate an order, refund, or inventory adjustment.
- A review is allowed only for a delivered order item and at most one review is allowed per order item.
- A return request is tied to an order item, may be submitted within seven days after delivery, and is refunded after the seller receives the returned product.
- Price/quantity checks, allowed status transitions, role permissions, the 24-hour cancellation window, reservation expiry, and one-time stock/refund effects require application validation and transactional handling in addition to relational constraints.

## Scope Notes

- This file is the ER diagram and logical relationship model for issue #8. It intentionally does not repeat the full column types, constraint definitions, or referential actions documented for issue #9.
- `product_categories` from the companion proposal is replaced here by `products.category_id`, matching the agreed one-category-per-product model and the existing API's single `categoryId`.
- Auction-specific tables extend the model alongside fixed-price sales; they do not replace the existing fixed-price cart/order/payment workflow.
- The auction lifecycle and outcomes for seller-initiated cancellation of an already scheduled or active auction must be agreed before implementation.
- Recommendations and sales dashboards are derived from catalog and order data; separate persistence tables are not required by the current requirements.
- The return shipping cost and whether returned stock becomes available for sale remain undecided.
