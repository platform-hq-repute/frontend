// config.template.js
// This file is processed by Cloud Build — placeholders are replaced with real values.
// The output file (config.js) is served as a plain script tag — NO ES module syntax.

window.REPUTEHQ_CONFIG = {
  SUPABASE_URL: "__SUPABASE_URL__",
  SUPABASE_ANON_KEY: "__SUPABASE_ANON_KEY__",
  OPENAI_API_KEY: "__OPENAI_API_KEY__",
  APP_NAME: "ReputeHQ",
  ENVIRONMENT: "production"
};
