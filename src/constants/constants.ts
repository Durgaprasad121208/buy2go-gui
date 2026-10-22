/**
 * Buy2Go API Constants & Endpoints
 * Base URL for Buy2Go Spring Boot microservice
 */

export const BASE_URL = "http://localhost:8188/v1.0/buy2go-service/api/";

// Authentication & Account
export const AUTH_REGISTER = `${BASE_URL}auth/register`;
export const AUTH_LOGIN = `${BASE_URL}auth/login`;
export const AUTH_ME = `${BASE_URL}auth/me`;
export const AUTH_CHANGE_PASSWORD = `${BASE_URL}auth/change-password`;

// User Management (Admin / Owner)
export const USERS_ENDPOINT = `${BASE_URL}users`;
export const USER_BY_ID_ENDPOINT = (id: string | number) => `${BASE_URL}users/${id}`;

// Catalog & Inventory
export const PRODUCTS_ENDPOINT = `${BASE_URL}products`;
export const PRODUCT_BY_ID_ENDPOINT = (id: string | number) => `${BASE_URL}products/${id}`;

// Orders & Shipments
export const ORDERS_ENDPOINT = `${BASE_URL}orders`;
export const ORDER_BY_ID_ENDPOINT = (id: string | number) => `${BASE_URL}orders/${id}`;
