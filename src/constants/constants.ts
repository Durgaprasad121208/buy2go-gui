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
export const UPLOAD_PRODUCT_IMAGE_ENDPOINT = `${BASE_URL}products/upload-image`;

// Orders & Shipments
export const ORDERS_ENDPOINT = `${BASE_URL}orders`;
export const ORDER_BY_ID_ENDPOINT = (id: string | number) => `${BASE_URL}orders/${id}`;
export const ORDER_STATUS_ENDPOINT = (id: string | number) => `${BASE_URL}orders/${id}/status`;
export const ORDER_SHIPMENT_ENDPOINT = (id: string | number) => `${BASE_URL}orders/${id}/shipment`;
export const ORDER_CANCEL_ENDPOINT = (id: string | number) => `${BASE_URL}orders/${id}/cancel`;
export const ORDER_UPLOAD_PHOTO_ENDPOINT = `${BASE_URL}orders/upload-photo`;
export const ORDER_CREATE_ENDPOINT = `${BASE_URL}orders/create`;
export const ORDER_BULK_CREATE_ENDPOINT = `${BASE_URL}orders/bulk-create`;
export const ORDER_TRACK_ENDPOINT = (orderNumber: string) => `${BASE_URL}orders/track/${orderNumber}`;
export const ORDER_MY_ORDERS_ENDPOINT = `${BASE_URL}orders/my-orders`;
export const ORDER_DOWNLOAD_EXCEL_ENDPOINT = `${BASE_URL}orders/download-excel`;
export const ORDER_ITEM_CUSTOMIZATION_ENDPOINT = (id: string | number, itemId: string | number) =>
  `${BASE_URL}orders/${id}/items/${itemId}/customization`;
