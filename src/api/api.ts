import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import Cookies from 'js-cookie';
import { richNotify } from "../utils/notify";

export interface ApiRequestOptions extends AxiosRequestConfig {
  url: string;
  service?: boolean;
  data?: any;
  params?: any;
  headers?: any;
  [key: string]: any;
}

export interface DownloadFileOptions {
  url: string;
  params?: any;
}

// User & Auth Payload Types for Buy2Go
export interface CreateAccountPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface RegisterPayload extends CreateAccountPayload {}

export interface SignInPayload {
  email: string;
  password: string;
  userName?: string;
}

let isLogoutNotified = false;
let isLoggingOut = false;

export const setLoggingOutFlag = (status: boolean) => {
  isLoggingOut = status;
  if (!status) {
    isLogoutNotified = false;
  }
};

const showLogoutNotification = (): void => {
  if (isLogoutNotified || isLoggingOut) return;
  isLogoutNotified = true;
  richNotify.error("Session Expired", {
    description: "Your session has expired. Please sign in again.",
    key: "session-expired-notification",
  });
};

const redirectToLogin = (): void => {
  if (isLoggingOut) return;

  isLoggingOut = true;
  showLogoutNotification();
  setTimeout(async () => {
    Cookies.remove("accessToken");
    Cookies.remove("userId");
    Cookies.remove("loginTimestamp");
    try {
      const savedTheme = localStorage.getItem('buy2go-theme');
      localStorage.clear();
      sessionStorage.clear();
      if (savedTheme) {
        localStorage.setItem('buy2go-theme', savedTheme);
      }
    } catch {
      // ignore
    }
    try {
      const [{ store }, { logoutAsync }] = await Promise.all([
        import("../redux/store"),
        import("../redux/slices/authSlice"),
      ]);
      store.dispatch(logoutAsync());
    } catch (err) {
      console.error("Error dispatching logoutAsync on session expiry:", err);
    }
  }, 2500);
};

const request = async function (options: ApiRequestOptions, service: boolean = false): Promise<any> {
  const accessToken = Cookies.get("accessToken");

  const client = axios.create({
    withCredentials: false,
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
    },
  });

  const onSuccess = function (response: AxiosResponse<any>) {
    return response?.data;
  };

  const handleStatusCode = function (statusCode: number) {
    switch (statusCode) {
      case 200:
      case 201:
        break;
      case 401:
        console.warn("Unauthorized request - status 401");
        break;
      case 403:
        console.warn("Forbidden request - status 403");
        break;
      case 404:
        console.warn("Resource not found - status 404");
        break;
      case 500:
        console.error("Internal Server Error - status 500");
        break;
      default:
        console.log("Response status:", statusCode);
    }
  };

  const onError = function (error: any) {
    if (error?.response) {
      handleStatusCode(error.response.status);
    } else {
      console.error("API Request error:", error?.message);
    }
    return Promise.reject(error?.response || error);
  };

  try {
    const response = await client(options);
    return onSuccess(response);
  } catch (error) {
    return onError(error);
  }
};

export const GetAPIRequest = (options: ApiRequestOptions): Promise<any> | void => {
  const { url, service, ...otherOptions } = options;

  if (Cookies.get("accessToken")) {
    return request(
      {
        url,
        withCredentials: false,
        method: "GET",
        ...otherOptions,
      },
      service
    );
  } else {
    redirectToLogin();
  }
};

export const PostAPIRequest = (
  options: ApiRequestOptions
): Promise<any> | void => {
  const { url, service, ...otherOptions } = options;
  const accessToken = Cookies.get("accessToken");

  if (!accessToken) {
    redirectToLogin();
    return;
  }

  return request(
    {
      ...otherOptions,
      url,
      method: "POST",
      withCredentials: false,
      data: options.data,
      headers: {
        ...(otherOptions.headers || {}),
        Authorization: `Bearer ${accessToken}`,
      },
    },
    service
  );
};

export const PatchAPIRequest = (options: ApiRequestOptions): Promise<any> | void => {
  const { url, service, ...otherOptions } = options;
  if (Cookies.get("accessToken")) {
    return request(
      {
        url,
        withCredentials: false,
        method: "PATCH",
        data: options.data,
        ...otherOptions,
      },
      service
    );
  } else {
    redirectToLogin();
  }
};

export const PutAPIRequest = (options: ApiRequestOptions): Promise<any> | void => {
  const { url, service, ...otherOptions } = options;
  if (Cookies.get("accessToken")) {
    return request(
      {
        url,
        withCredentials: false,
        method: "PUT",
        data: options.data,
        ...otherOptions,
      },
      service
    );
  } else {
    redirectToLogin();
  }
};

export const DeleteAPIRequest = (options: ApiRequestOptions): Promise<any> | void => {
  const { url, service, ...otherOptions } = options;
  if (Cookies.get("accessToken")) {
    return request(
      {
        url,
        withCredentials: false,
        method: "DELETE",
        ...otherOptions,
      },
      service
    );
  } else {
    redirectToLogin();
  }
};

// Public endpoints (registration, login, catalog browse)
export const FreeGetAPIRequest = (options: ApiRequestOptions): Promise<any> => {
  const { url, service, ...otherOptions } = options;
  return request(
    {
      url,
      withCredentials: false,
      method: "GET",
      ...otherOptions,
    },
    service
  );
};

export const FreePostAPIRequest = (options: ApiRequestOptions): Promise<any> => {
  const { url, service, ...otherOptions } = options;
  return request(
    {
      url,
      withCredentials: false,
      method: "POST",
      ...otherOptions,
    },
    service
  );
};

// File upload / download utilities
export const downloadFile = async ({ url, params }: DownloadFileOptions): Promise<any> => {
  const queryString = params ? new URLSearchParams(params).toString() : '';
  const URL = queryString ? `${url}?${queryString}` : url;

  try {
    const token = Cookies.get("accessToken");
    const response = await axios.get(URL, {
      responseType: "arraybuffer",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  } catch (error) {
    console.error("Failed to download file:", error);
    throw error;
  }
};

export const fileUpload = async (url: string, formData: FormData): Promise<any> => {
  try {
    const response = await axios.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: Cookies.get("accessToken")
          ? `Bearer ${Cookies.get("accessToken")}`
          : undefined,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error("Failed to upload file: " + (error.message || error));
  }
};

export default request;
