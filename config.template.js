// config.template.js

export const SUPABASE_URL = "__SUPABASE_URL__";         // replaced during build
export const SUPABASE_ANON_KEY = "__SUPABASE_ANON_KEY__"; // replaced during build

export const APP_NAME = "ReputeHQ";
export const ENVIRONMENT = process.env.NODE_ENV || "production";

export const FEATURES = {
  aiResponses: true,
  locationTracking: true,
  reviewFiltering: true,
};

export const API_ENDPOINTS = {
  reviews: "/api/reviews",
  locations: "/api/locations",
  users: "/api/users",
};
