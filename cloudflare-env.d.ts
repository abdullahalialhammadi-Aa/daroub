declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    DAROUB_OWNER_IDS?: string;
    DAROUB_EDITOR_IDS?: string;
    AI_BASE_URL?: string; AI_MODEL?: string; AI_API_KEY?: string;
    AI_GROK_API_KEY?: string; AI_GROK_MODEL?: string; AI_GROK_BASE_URL?: string;
    AI_OPENAI_API_KEY?: string; AI_OPENAI_MODEL?: string; AI_OPENAI_BASE_URL?: string;
    AI_CLAUDE_API_KEY?: string; AI_CLAUDE_MODEL?: string; AI_CLAUDE_BASE_URL?: string;
    AI_DEFAULT_PROVIDER?: string;
    IMAGERY_GOOGLE_KEY?: string; IMAGERY_MAPBOX_TOKEN?: string; IMAGERY_DEFAULT?: string;
  }
}
