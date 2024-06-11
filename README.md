# InventoryX - Inventory Management System

## Problem Statement
An ecommerce store needs a robust inventory management system to track products, manage stock levels, and ensure smooth operations. The system should allow administrators to add new products to inventory, update existing product details, and remove products that are no longer available. Additionally, the system should provide insights into inventory levels and generate reports for better decision-making.

## Solution Overview
InventoryX is a Node.js-based inventory management system designed to meet the needs of online stores. It provides a set of RESTful APIs for managing inventory, including adding, updating, and removing products. The system stores inventory data in a JSON file for simplicity, but it can be easily adapted to use a database like MongoDB or MySQL in a production environment. Postman is used for testing the API endpoints, ensuring reliability and performance.

## POSTMAN COLLECTION LINK
https://www.postman.com/navigation-cosmologist-91296973/workspace/devdynamic-assignment/collection/23475903-5729b00d-0a3c-4f12-8b19-9f8e3984ad45?action=share&creator=23475903
## POSTMAN DOCUMENTATION LINK
https://documenter.getpostman.com/view/23475903/2sA3XMjPGk
## HOSTED URL
https://devdynamic-backend-vpp.onrender.com  (For Routes Refer Above Documentation)

## EDGE CASE VALIDATION

| Test Case Description                                     | Input                                                                                                 | Expected Output                                      |
|-----------------------------------------------------------|-------------------------------------------------------------------------------------------------------|------------------------------------------------------|
| Add item to inventory with valid data                     | `{ productId: '1', name: 'Item 1', price: 10, quantity: 20 }`                                         | Success message and updated inventory                 |
| Add item to inventory with invalid quantity               | `{ productId: '2', name: 'Item 2', price: 20, quantity: 0 }`                                           | Error message: Quantity must be greater than zero     |
| Edit item in inventory with valid data                    | `{ productId: '1', name: 'Updated Item 1', price: 15, quantity: 25 }`                                  | Success message and updated inventory                 |
| Edit item in inventory with invalid product ID            | `{ productId: '100', name: 'Item 100', price: 50, quantity: 30 }`                                       | Error message: Product not found in inventory         |
| Remove item from inventory with valid product ID          | `{ productId: '1' }`                                                                                  | Success message and updated inventory                 |
| Remove item from inventory with invalid product ID        | `{ productId: '100' }`                                                                                | Error message: Product not found in inventory         |
| Create a new discount coupon with valid data              | `{ couponId: 'DISCOUNT20', percentage: 20, maxCap: 100, validAbove: 200 }`                              | Success message and updated discount coupons         |
| Create a new discount coupon with invalid percentage      | `{ couponId: 'INVALIDDISCOUNT', percentage: -10, maxCap: 50, validAbove: 100 }`                          | Error message: Invalid percentage value               |
| Create a new discount coupon with invalid maxCap          | `{ couponId: 'INVALIDCAP', percentage: 15, maxCap: 0, validAbove: 50 }`                                 | Error message: Invalid maxCap value                   |
| Create a new discount coupon with invalid validAbove      | `{ couponId: 'INVALIDABOVE', percentage: 25, maxCap: 75, validAbove: -20 }`                              | Error message: Invalid validAbove value               |
| Add customer with valid data                              | `{ customerId: 'CUST1', name: 'John Doe' }`                                                            | Success message and updated customers                 |
| Add customer with existing customer ID                     | `{ customerId: 'CUST1', name: 'Jane Doe' }`                                                            | Error message: Customer ID already exists             |
| Add customer with invalid customer ID                     | `{ customerId: '', name: 'Jane Doe' }`                                                                 | Error message: Invalid customer ID                    |
