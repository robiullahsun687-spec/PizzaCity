# Security Specification for Pizza City Oman Firestore

## 1. Data Invariants
- **No Direct Admin Writes from Clients**: All write operations on `menuItems`, `promos`, and `banners` are strictly denied for direct Client SDKs. All changes must go through the authenticated secure Express backend.
- **Bulk Order Privacy**: Users can fetch single order documents using `get` (via the order tracking ID), but `list` queries are strictly denied to prevent listing other customers' orders.
- **Strict Order Schema**: Direct client order creations must conform exactly to structural requirements (such as possessing a customer map containing name and phone, and non-empty items).

## 2. The "Dirty Dozen" Audit Payloads
The following payloads are designed to violate integrity and must return `PERMISSION_DENIED`:
1. **Unauthenticated Menu Creation**: Attempting to add a new menu item.
2. **Unauthenticated Banner Modification**: Attempting to set an active banner's status.
3. **Unauthenticated Coupon Inject**: Trying to add a `WELCOME100` coupon with 100% discount.
4. **Order Status Hijack**: Submitting an order directly with `status: "delivered"`.
5. **Junk Order Total**: Submitting a negative order total.
6. **No Items Order**: Submitting an order with an empty items list.
7. **Missing Customer Phone**: Submitting an order with customer details but missing a phone number.
8. **Bulk Orders Scraping**: Performing a collection query list against `/orders`.
9. **SQL Injection in Order ID**: Requesting a document ID with malicious special characters.
10. **Malicious Menu Overwrite**: Trying to set a menu item's price to OMR 0.00.
11. **Malicious Banner Text size overflow**: Submitting a title over 1MB.
12. **Malicious Promo Expiry updates**: Trying to overwrite isActive directly on a promo document.

## 3. Test Verification Result
Verified that the drafted security rules enforce these constraints natively and secure all database collections.
