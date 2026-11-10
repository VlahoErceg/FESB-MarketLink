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
- A listing requires a title, description, category, location, and an image. A `FIXED_PRICE` product also requires a price; an `AUCTION` product uses its auction's starting price and bids.
- A fixed sale price must be greater than or equal to zero.
- A product can be sold either at a fixed price (`FIXED_PRICE`) or by auction (`AUCTION`). Existing fixed-price purchasing behavior remains unchanged.
- Each auction sells one unit of a product. The seller sets a starting price, minimum bid increment, and start and end times.
- Auction statuses are `SCHEDULED`, `ACTIVE`, `ENDED`, and `CANCELLED`. The seller may create a new auction after an earlier auction ends without a sale.
- For a `FIXED_PRICE` product, the product price is used. For an `AUCTION` product, the auction's starting price, current price, and minimum increment govern bidding.
- A product may have auction history, but may have at most one `SCHEDULED` or `ACTIVE` auction at a time.
- Only administrators can create and edit categories.
- A listing can be permanently deleted or marked inactive/archived.
- The catalog must support search, filtering, sorting, and pagination.
- The system must track product inventory.

## Auctions and Bids

- Users cannot bid on their own products.
- Bids are accepted only while the auction is `ACTIVE` and within its scheduled start and end times.
- The first valid bid must be at least the starting price. Each later bid must exceed the current highest bid by at least the auction's minimum increment.
- Concurrent bids must be handled safely: every accepted bid must satisfy the current minimum-increment rule, and the current price must not move backwards.
- When the auction ends, the highest valid bid receives the first purchase offer.
- Each purchase offer records the auction, selected buyer and bid, final price, associated order, offer status, award time, and offer expiry.
- A selected bidder has 24 hours from the offer time to accept and start checkout. Until the offer expires or is marked `PAYMENT_REJECTED` or `PAYMENT_TIMED_OUT`, the auction's product unit cannot be sold through a fixed-price listing or another auction offer.
- Offer statuses are `OFFER_PENDING`, `PAYMENT_PENDING`, `PAID`, `PAYMENT_REJECTED`, `PAYMENT_TIMED_OUT`, and `EXPIRED`. Only one offer can be pending for an auction at a time, and at most one offer can become the paid winner.
- Auction checkout reuses the existing order and payment system; it does not introduce a separate payment process.
- Once payment starts, the existing 15-minute payment timeout applies. If payment is rejected or times out, that offer ends and the next-highest valid bidder receives a new 24-hour offer. The failed order attempt is cancelled before moving to the next bidder.
- If every valid bidder fails to pay or lets their offer expire, the auction ends without a sale.
- An auction that ends without bids is marked `ENDED` with no winner or order. The seller may create a new auction for the product.
- Whenever a new valid bid raises the current price, all earlier bidders whose highest bid is now lower receive a stored in-app notification. The current bidder is not notified; email and push notifications are not included.

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
- Whether a seller may cancel a scheduled or active auction, and what happens to bids if it is cancelled.
- Additional delivery statuses beyond basic shipped and delivered states. The specification does not require integration with a courier service.
- The return shipping process and whether returned inventory is restored for resale.
- Other notification types and where users view them; outbid notifications are stored in-app.
- Review format, such as rating range and allowed text.
- Recommendation criteria, sales overview metrics, and search, filter, and sort fields and behavior.