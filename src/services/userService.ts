import { GetAPIRequest, DeleteAPIRequest } from "../api/api";
import { USERS_ENDPOINT, USER_BY_ID_ENDPOINT } from "../constants/constants";
import { Buy2GoUser, ApiResponse, PaginatedResponse } from "../interfaces";

export interface GetUsersParams {
  page?: number;
  size?: number;
  search?: string;
  role?: string;
}

export const userService = {
  /**
   * Get paginated users directory (Admin only)
   * GET /api/users
   */
  getUsers: async (params?: GetUsersParams): Promise<ApiResponse<PaginatedResponse<Buy2GoUser>>> => {
    return GetAPIRequest({
      url: USERS_ENDPOINT,
      params,
    });
  },

  /**
   * Get user details by ID
   * GET /api/users/{id}
   */
  getUserById: async (id: string | number): Promise<ApiResponse<Buy2GoUser>> => {
    return GetAPIRequest({
      url: USER_BY_ID_ENDPOINT(id),
    });
  },

  /**
   * Delete user account (soft delete, Admin only)
   * DELETE /api/users/{id}
   */
  deleteUser: async (id: string | number): Promise<ApiResponse<void>> => {
    return DeleteAPIRequest({
      url: USER_BY_ID_ENDPOINT(id),
    });
  },
};

export default userService;
