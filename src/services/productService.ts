import {
  GetAPIRequest,
  PostAPIRequest,
  PutAPIRequest,
  DeleteAPIRequest,
  FreeGetAPIRequest,
  fileUpload,
} from "../api/api";
import {
  PRODUCTS_ENDPOINT,
  PRODUCT_BY_ID_ENDPOINT,
  UPLOAD_PRODUCT_IMAGE_ENDPOINT,
} from "../constants/constants";
import {
  Buy2GoProduct,
  ProductPayload,
  ApiResponse,
  PaginatedResponse,
} from "../interfaces";
import Cookies from "js-cookie";

export interface GetProductsParams {
  page?: number;
  size?: number;
  search?: string;
  category?: string;
  isLive?: boolean;
  sort?: string;
  direction?: "ASC" | "DESC" | string;
  [key: string]: any;
}

export const productService = {
  /**
   * Get all products / catalog (Customer retrieval & Admin catalog)
   * GET /api/products
   */
  getAllProducts: async (
    params?: GetProductsParams
  ): Promise<ApiResponse<PaginatedResponse<Buy2GoProduct> | Buy2GoProduct[]>> => {
    const requestFn = Cookies.get("accessToken") ? GetAPIRequest : FreeGetAPIRequest;
    return requestFn({
      url: PRODUCTS_ENDPOINT,
      params,
    });
  },

  /**
   * Alias for getAllProducts
   * GET /api/products
   */
  getProducts: async (
    params?: GetProductsParams
  ): Promise<ApiResponse<PaginatedResponse<Buy2GoProduct> | Buy2GoProduct[]>> => {
    return productService.getAllProducts(params);
  },

  /**
   * Get single product details by ID
   * GET /api/products/{id}
   */
  getProductById: async (
    id: string | number
  ): Promise<ApiResponse<Buy2GoProduct>> => {
    const requestFn = Cookies.get("accessToken") ? GetAPIRequest : FreeGetAPIRequest;
    return requestFn({
      url: PRODUCT_BY_ID_ENDPOINT(id),
    });
  },

  /**
   * Upload product thumbnail image
   * POST /api/products/upload-image
   * multipart/form-data with file binary
   */
  uploadProductImage: async (
    file: File | FormData
  ): Promise<ApiResponse<{ imageUrl?: string; url?: string; fileName?: string } | any>> => {
    let formData: FormData;
    if (file instanceof FormData) {
      formData = file;
    } else {
      formData = new FormData();
      formData.append("file", file);
    }
    return fileUpload(UPLOAD_PRODUCT_IMAGE_ENDPOINT, formData);
  },

  /**
   * Create new product in catalog (Admin / Owner only)
   * POST /api/products
   */
  createProduct: async (
    payload: ProductPayload | FormData
  ): Promise<ApiResponse<Buy2GoProduct>> => {
    return PostAPIRequest({
      url: PRODUCTS_ENDPOINT,
      data: payload,
    });
  },

  /**
   * Update existing product by ID (Admin / Owner only)
   * PUT /api/products/{id}
   */
  updateProduct: async (
    id: string | number,
    payload: ProductPayload | FormData
  ): Promise<ApiResponse<Buy2GoProduct>> => {
    return PutAPIRequest({
      url: PRODUCT_BY_ID_ENDPOINT(id),
      data: payload,
    });
  },

  /**
   * Delete product by ID (Admin / Owner only)
   * DELETE /api/products/{id}
   */
  deleteProduct: async (
    id: string | number
  ): Promise<ApiResponse<void>> => {
    return DeleteAPIRequest({
      url: PRODUCT_BY_ID_ENDPOINT(id),
    });
  },
};

export default productService;
