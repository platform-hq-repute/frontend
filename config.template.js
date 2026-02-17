// config.template.js
// This file should never contain real keys — they are injected at build time via Cloud Build substitutions.

export const SUPABASE_URL = "__SUPABASE_URL__";
export const SUPABASE_ANON_KEY = "__SUPABASE_ANON_KEY__";
export const OPENAI_API_KEY = "__OPENAI_API_KEY__";

// Optional: other config variables
export const APP_NAME = "ReputeHQ";
export const ENVIRONMENT = process.env.NODE_ENV || "production";

// Feature flags (example)
export const FEATURES = {
  aiResponses: true,
  locationTracking: true,
  reviewFiltering: true,
};

// Endpoints (example)
export const API_ENDPOINTS = {
  reviews: "/api/reviews",
  locations: "/api/locations",
  users: "/api/users",
};
