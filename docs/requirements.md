# MarketLink – Core Requirements and Business Rules

This document records the mandatory project requirements and the business rules agreed for MarketLink. Open questions are explicitly marked as undecided and must not be assumed during implementation.

## System Purpose

MarketLink is a multi-vendor marketplace. Buyers browse and order products, sellers manage their products and their portions of orders, and administrators moderate content.

## Roles and Accounts

| Role | Rules |
|---|---|
| Buyer | Every newly registered account starts as a buyer. Buyers can make purchases and view their own orders. |
| Seller | A buyer becomes a seller only after an administrator approves their request. While a request is pending, the user can continue buying but cannot publish listings. A user can submit no more than 3 requests in total; after the third rejection, they cannot submit another request. |
| Administrator | Approves or rejects seller requests, moderates content, and can manage all listings and categories. |

## Listings, Products, and Categories

- Sellers can manage only their own listings; administrators can manage all listings.
- A listing requires a title, description, price, category, location and an image.
- The price must be greater than or equal to zero.
- Only administrators can create and edit categories.
- A listing can be permanently deleted or marked inactive/archived.
- The catalog must support search, filtering, sorting, and pagination.
- The system must track product inventory.

## Cart, Orders, and Inventory

- Buyers can place orders and view only their own orders.
- Sellers can see only their portion of an order, not the portions belonging to other sellers.
- At checkout, the system atomically reserves the requested inventory while payment is pending. Two buyers must not be able to purchase the last unit of the same product.
- A reservation expires after 15 minutes if payment has no final result.
- A payment rejection, cancellation, or reservation expiry releases reserved inventory no more than once.
- Repeated requests or repeated payment results must not create another order or change inventory twice.
- If a successful payment result arrives after the reservation expires, the system checks inventory again. If inventory is available, it attempts to reserve it again and continue the order; otherwise, it simulates a refund.
- The server verifies prices and stores the prices applied when the order is placed. Amounts must be calculated precisely. If a price changes before purchase confirmation, the buyer must confirm the new price.

## Payments, Statuses, and Notifications

- Payment is simulated and must support success, rejection, and timeout outcomes.
- No real money or payment card data is processed.
- Order status and payment status are tracked separately.
- Order statuses are `PENDING_PAYMENT`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, and `CANCELLED`.
- The normal order flow is `PENDING_PAYMENT → CONFIRMED → PROCESSING → SHIPPED → DELIVERED`. `CANCELLED` is a terminal order status.
- Payment statuses are `PENDING`, `SUCCEEDED`, `REJECTED`, `TIMED_OUT`, and `REFUNDED`.
- A successful payment moves the order to `CONFIRMED`. A rejected payment cancels the order.
- A buyer may cancel a confirmed order within 24 hours of successful payment, provided the seller has not started processing it. Once processing has started, buyer-initiated cancellation is not available in the basic workflow.
- Cancelling a paid order triggers a simulated refund and restores the reserved inventory, with each effect applied no more than once.
- Sellers update the status of their own order portions through `CONFIRMED → PROCESSING → SHIPPED → DELIVERED`; buyers can view their orders and statuses.
- When an order contains products from multiple sellers, each seller's portion has its own fulfillment status.
- A payment timeout releases the inventory reservation. If a late success arrives, the system checks inventory again: if it can reserve the inventory, the order is confirmed; otherwise, the order is cancelled and a simulated refund is issued.
- Repeated payment events must not repeat inventory changes or refunds.
- A buyer may request a return for any reason within 7 days of delivery to the buyer.
- The buyer must return the product to the seller. A simulated refund is issued after the seller receives the returned product.
- The system stores notifications.

## Reviews, Recommendations, and Sales Overview

- A buyer may review an item only after purchasing and receiving it.
- Recommendations must be simple and explainable.
- The system must provide a sales overview appropriate to the user's role.

## Shared Technical Requirements

- The system includes a mobile-friendly web interface, a server application, and a database.
- Users have different access permissions based on their roles, and the server validates data.
- Main lists support search, filtering, sorting, and pagination.

## Open Questions

The following details are not defined in this document and must be agreed before implementation:

- How simulated payment outcomes are triggered and what the buyer sees during a timeout.
- How an order is split into seller portions when the cart contains products from multiple sellers.
- Additional delivery statuses beyond basic shipped and delivered states. The specification does not require integration with a courier service.
- The return shipping process and whether returned inventory is restored for resale.
- Notification types and where users view them.
- Review format, such as rating range and allowed text.
- Recommendation criteria, sales overview metrics, and search, filter, and sort fields and behavior.