import axios from "axios";
import {
  AUTH_LOGIN,
  AUTH_REGISTER,
  AUTH_ME,
  AUTH_CHANGE_PASSWORD,
} from "../constants/constants";
import { GetAPIRequest, PutAPIRequest, RegisterPayload } from "../api/api";
import { Buy2GoUser, ApiResponse } from "../interfaces";

export interface LoginPayload {
  email: string;
  password: string;
  userName?: string;
}

export interface ChangePasswordPayload {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export const authService = {
  /**
   * Authenticate user with Buy2Go Service
   */
  login: async (payload: LoginPayload): Promise<ApiResponse<any>> => {
    try {
      const email = (payload.email || payload.userName || "").trim();
      const response = await axios.post<ApiResponse<any>>(
        AUTH_LOGIN,
        {
          email,
          password: payload.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Buy2Go Login Error:", error);
      throw error;
    }
  },

  /**
   * Register new customer account
   */
  register: async (payload: RegisterPayload): Promise<ApiResponse<Buy2GoUser>> => {
    try {
      const response = await axios.post<ApiResponse<Buy2GoUser>>(
        AUTH_REGISTER,
        {
          firstName: payload.firstName.trim(),
          lastName: payload.lastName.trim(),
          email: payload.email.trim(),
          phone: payload.phone.trim(),
          password: payload.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Buy2Go Register Error:", error);
      throw error;
    }
  },

  /**
   * Get authenticated user profile (/api/auth/me)
   */
  getCurrentUser: async (): Promise<ApiResponse<Buy2GoUser>> => {
    try {
      const response = await GetAPIRequest({ url: AUTH_ME });
      return response?.data ? response : { success: true, data: response };
    } catch (error) {
      console.error("Buy2Go Get Current User Error:", error);
      throw error;
    }
  },

  /**
   * Change user password (/api/auth/change-password)
   */
  changePassword: async (payload: ChangePasswordPayload): Promise<ApiResponse<string>> => {
    try {
      const response = await PutAPIRequest({
        url: AUTH_CHANGE_PASSWORD,
        data: payload,
      });
      return response;
    } catch (error) {
      console.error("Buy2Go Change Password Error:", error);
      throw error;
    }
  },
};

export default authService;
