import {
  GetAPIRequest,
  PostAPIRequest,
  PutAPIRequest,
  DeleteAPIRequest,
  FreeGetAPIRequest,
  fileUpload,
  downloadFile,
} from "../api/api";
import {
  ORDERS_ENDPOINT,
  ORDER_BY_ID_ENDPOINT,
  ORDER_STATUS_ENDPOINT,
  ORDER_SHIPMENT_ENDPOINT,
  ORDER_CANCEL_ENDPOINT,
  ORDER_UPLOAD_PHOTO_ENDPOINT,
  ORDER_UPLOAD_PHOTOS_ENDPOINT,
  ORDER_PHOTO_ENDPOINT,
  ORDER_ITEM_PHOTO_ENDPOINT,
  ORDER_DOWNLOAD_PHOTO_BY_URL_ENDPOINT,
  ORDER_DOWNLOAD_PHOTO_BY_ID_ENDPOINT,
  ORDER_ITEM_DOWNLOAD_PHOTO_ENDPOINT,
  ORDER_CREATE_ENDPOINT,
  ORDER_BULK_CREATE_ENDPOINT,
  ORDER_TRACK_ENDPOINT,
  ORDER_MY_ORDERS_ENDPOINT,
  ORDER_CUSTOMER_ENDPOINT,
  ORDER_DOWNLOAD_EXCEL_ENDPOINT,
  ORDER_ITEM_CUSTOMIZATION_ENDPOINT,
} from "../constants/constants";
import {
  Buy2GoOrder,
  CreateOrderRequest,
  OrderStatusUpdatePayload,
  ShipmentUpdatePayload,
  ItemCustomizationPayload,
  ApiResponse,
  PaginatedResponse,
  OrderStatus,
  CustomerOrdersQueryParams,
} from "../interfaces";
import Cookies from "js-cookie";

export interface GetOrdersParams {
  page?: number;
  size?: number;
  status?: OrderStatus | string;
  search?: string;
  [key: string]: any;
}

export const orderService = {
  /**
   * Get paginated orders list with status and customer search (Admin / Owner)
   * GET /api/orders
   */
  getAllOrders: async (
    params?: GetOrdersParams
  ): Promise<ApiResponse<PaginatedResponse<Buy2GoOrder> | Buy2GoOrder[]>> => {
    return GetAPIRequest({
      url: ORDERS_ENDPOINT,
      params,
    });
  },

  /**
   * Get single order details by ID or order number
   * GET /api/orders/{id}
   */
  getOrderById: async (
    id: string | number
  ): Promise<ApiResponse<Buy2GoOrder>> => {
    return GetAPIRequest({
      url: ORDER_BY_ID_ENDPOINT(id),
    });
  },

  /**
   * Public track order status by order number or ID
   * GET /api/orders/track/{orderNumber}
   */
  trackOrder: async (
    orderNumber: string
  ): Promise<ApiResponse<Buy2GoOrder>> => {
    return FreeGetAPIRequest({
      url: ORDER_TRACK_ENDPOINT(orderNumber),
    });
  },

  /**
   * Get all orders for the currently authenticated customer
   * GET /api/orders/my-orders
   */
  getMyOrders: async (): Promise<ApiResponse<Buy2GoOrder[]>> => {
    return GetAPIRequest({
      url: ORDER_MY_ORDERS_ENDPOINT,
    });
  },

  /**
   * Place a new customer order with customized product photo and text to print
   * POST /api/orders/create
   */
  createOrder: async (
    payload: CreateOrderRequest
  ): Promise<ApiResponse<Buy2GoOrder>> => {
    const accessToken = Cookies.get("accessToken");
    const requestFn = accessToken ? PostAPIRequest : (options: any) => {
      // Allow unauthenticated guest checkout or authenticated customer checkout
      const { url, ...otherOptions } = options;
      return fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(payload),
      }).then((res) => {
        if (!res.ok) {
          throw new Error(`Order placement failed: HTTP ${res.status}`);
        }
        return res.json();
      });
    };

    return requestFn({
      url: ORDER_CREATE_ENDPOINT,
      data: payload,
    });
  },

  /**
   * Place multiple customer orders in a single request (bulk ordering)
   * POST /api/orders/bulk-create
   */
  createBulkOrders: async (
    orders: CreateOrderRequest[]
  ): Promise<ApiResponse<Buy2GoOrder[]>> => {
    return PostAPIRequest({
      url: ORDER_BULK_CREATE_ENDPOINT,
      data: orders,
    });
  },

  /**
   * Update order status with audit trail logging (Admin / Owner)
   * PUT /api/orders/{id}/status
   */
  updateOrderStatus: async (
    id: string | number,
    payload: OrderStatusUpdatePayload
  ): Promise<ApiResponse<Buy2GoOrder>> => {
    return PutAPIRequest({
      url: ORDER_STATUS_ENDPOINT(id),
      data: payload,
    });
  },

  /**
   * Update shipment details (courier, tracking, status, notes)
   * PUT /api/orders/{id}/shipment
   */
  updateShipment: async (
    id: string | number,
    payload: ShipmentUpdatePayload
  ): Promise<ApiResponse<Buy2GoOrder>> => {
    return PutAPIRequest({
      url: ORDER_SHIPMENT_ENDPOINT(id),
      data: payload,
    });
  },

  /**
   * Cancel an order
   * PUT /api/orders/{id}/cancel
   */
  cancelOrder: async (
    id: string | number,
    remarks: string = "Cancelled by admin"
  ): Promise<ApiResponse<Buy2GoOrder>> => {
    return PutAPIRequest({
      url: ORDER_CANCEL_ENDPOINT(id),
      params: { remarks },
    });
  },

  /**
   * Upload single photo to MinIO for product printing
   * Returns MinIO URL string directly
   * POST /api/orders/upload-photo
   */
  uploadOrderPhoto: async (
    file: File | FormData
  ): Promise<string> => {
    let formData: FormData;
    if (file instanceof FormData) {
      formData = file;
    } else {
      formData = new FormData();
      formData.append("file", file);
    }
    const res = await fileUpload(ORDER_UPLOAD_PHOTO_ENDPOINT, formData);
    return typeof res === "string" ? res : res?.data?.url || res?.data || "";
  },

  /**
   * Edit photo, textToPrint, color, or notes for an item in an existing order
   * PUT /api/orders/{id}/items/{itemId}/customization
   */
  updateItemCustomization: async (
    orderId: string | number,
    itemId: string | number,
    payload: ItemCustomizationPayload
  ): Promise<ApiResponse<Buy2GoOrder>> => {
    return PutAPIRequest({
      url: ORDER_ITEM_CUSTOMIZATION_ENDPOINT(orderId, itemId),
      data: payload,
    });
  },

  /**
   * Upload multiple photos to MinIO for product printing
   * Returns list of MinIO URL strings
   * POST /api/orders/upload-photos
   */
  uploadMultipleOrderPhotos: async (files: File[] | FileList): Promise<string[]> => {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });
    const res = await fileUpload(ORDER_UPLOAD_PHOTOS_ENDPOINT, formData);
    return res?.data || res || [];
  },

  /**
   * Download any order photo from MinIO with direct attachment stream using downloadFile
   * GET /api/orders/download-photo?url=...
   */
  downloadPhotoByUrl: async (photoUrl: string, fileName?: string): Promise<void> => {
    const data = await downloadFile({
      url: ORDER_DOWNLOAD_PHOTO_BY_URL_ENDPOINT,
      params: { url: photoUrl },
    });
    const name = fileName || photoUrl.split("/").pop() || `order_photo_${Date.now()}.jpg`;
    triggerBlobDownload(data, name);
  },

  /**
   * Download primary photo for order
   * GET /api/orders/{id}/download-photo
   */
  downloadOrderPhoto: async (orderId: string | number, fileName?: string): Promise<void> => {
    const data = await downloadFile({
      url: ORDER_DOWNLOAD_PHOTO_BY_ID_ENDPOINT(orderId),
    });
    const name = fileName || `order_${orderId}_primary_${Date.now()}.jpg`;
    triggerBlobDownload(data, name);
  },

  /**
   * Download customized photo for specific order item
   * GET /api/orders/{id}/items/{itemId}/download-photo
   */
  downloadOrderItemPhoto: async (
    orderId: string | number,
    itemId: string | number,
    fileName?: string
  ): Promise<void> => {
    const data = await downloadFile({
      url: ORDER_ITEM_DOWNLOAD_PHOTO_ENDPOINT(orderId, itemId),
    });
    const name = fileName || `order_${orderId}_item_${itemId}_${Date.now()}.jpg`;
    triggerBlobDownload(data, name);
  },

  /**
   * Update order-level photo URL
   * PUT /api/orders/{id}/photo?photoUrl=...
   */
  updateOrderPhoto: async (
    orderId: string | number,
    photoUrl: string
  ): Promise<ApiResponse<Buy2GoOrder>> => {
    return PutAPIRequest({
      url: ORDER_PHOTO_ENDPOINT(orderId),
      params: { photoUrl },
    });
  },

  /**
   * Remove order-level photo
   * DELETE /api/orders/{id}/photo
   */
  removeOrderPhoto: async (orderId: string | number): Promise<ApiResponse<Buy2GoOrder>> => {
    return DeleteAPIRequest({
      url: ORDER_PHOTO_ENDPOINT(orderId),
    });
  },

  /**
   * Update single photo URL on an order item
   * PUT /api/orders/{id}/items/{itemId}/photo?photoUrl=...
   */
  updateOrderItemPhoto: async (
    orderId: string | number,
    itemId: string | number,
    photoUrl: string
  ): Promise<ApiResponse<Buy2GoOrder>> => {
    return PutAPIRequest({
      url: ORDER_ITEM_PHOTO_ENDPOINT(orderId, itemId),
      params: { photoUrl },
    });
  },

  /**
   * Remove photo from an order item
   * DELETE /api/orders/{id}/items/{itemId}/photo
   */
  removeOrderItemPhoto: async (
    orderId: string | number,
    itemId: string | number
  ): Promise<ApiResponse<Buy2GoOrder>> => {
    return DeleteAPIRequest({
      url: ORDER_ITEM_PHOTO_ENDPOINT(orderId, itemId),
    });
  },

  /**
   * Get all orders for a customer by email or phone number
   * GET /api/orders/customer
   */
  getOrdersByCustomer: async (
    params: CustomerOrdersQueryParams
  ): Promise<ApiResponse<Buy2GoOrder[]>> => {
    return FreeGetAPIRequest({
      url: ORDER_CUSTOMER_ENDPOINT,
      params,
    });
  },

  /**
   * Download orders Excel report (Apache POI)
   * GET /api/orders/download-excel
   */
  downloadOrdersExcel: async (status?: string): Promise<void> => {
    const params = status && status !== "All" ? { status } : undefined;
    const data = await downloadFile({
      url: ORDER_DOWNLOAD_EXCEL_ENDPOINT,
      params,
    });
    triggerBlobDownload(
      data,
      `orders_${status || "all"}_${Date.now()}.xlsx`,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
  },
};

const triggerBlobDownload = (
  data: ArrayBuffer | Blob,
  fileName: string,
  mimeType: string = "image/jpeg"
) => {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
};

export default orderService;
