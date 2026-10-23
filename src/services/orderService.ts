import {
  GetAPIRequest,
  PostAPIRequest,
  PutAPIRequest,
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
  ORDER_CREATE_ENDPOINT,
  ORDER_BULK_CREATE_ENDPOINT,
  ORDER_TRACK_ENDPOINT,
  ORDER_MY_ORDERS_ENDPOINT,
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
    return fileUpload(ORDER_UPLOAD_PHOTO_ENDPOINT, formData);
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
   * Download orders Excel report (Apache POI)
   * GET /api/orders/download-excel
   */
  downloadOrdersExcel: async (status?: string): Promise<void> => {
    const params = status && status !== "All" ? { status } : undefined;
    const data = await downloadFile({
      url: ORDER_DOWNLOAD_EXCEL_ENDPOINT,
      params,
    });
    const blob = new Blob([data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `orders_${status || "all"}_${Date.now()}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },
};

export default orderService;
