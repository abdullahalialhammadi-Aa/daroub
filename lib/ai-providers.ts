/**
 * Optional generative providers for the assistant's "AI wording" mode.
 * The cited guide answer is always produced first; a provider may only rephrase it.
 * Nothing here reaches the browser except {id,label,model}: keys and endpoints stay server-side.
 */
export const aiProviderIds = ['grok', 'codex', 'claude', 'custom'] as const;
export type AIProviderId = typeof aiProviderIds[number];
export interface AIProviderEnv {
  AI_BASE_URL?: string; AI_MODEL?: string; AI_API_KEY?: string;
  AI_GROK_API_KEY?: string; AI_GROK_MODEL?: string; AI_GROK_BASE_URL?: string;
  AI_OPENAI_API_KEY?: string; AI_OPENAI_MODEL?: string; AI_OPENAI_BASE_URL?: string;
  AI_CLAUDE_API_KEY?: string; AI_CLAUDE_MODEL?: string; AI_CLAUDE_BASE_URL?: string;
  AI_DEFAULT_PROVIDER?: string;
}
export interface AIProvider { id: AIProviderId; label: string; kind: 'openai' | 'anthropic'; model: string; key: string; endpoint: URL }
/** What the client may learn about a provider. */
export interface AIProviderSummary { id: AIProviderId; label: string; model: string }
export interface AIChatMessage { role: 'system' | 'user'; content: string }

export const aiProviderLabels: Record<AIProviderId, string> = { grok: 'Grok', codex: 'Codex', claude: 'Claude', custom: 'AI' };
const defaults: Record<AIProviderId, { base: string; path: string; kind: AIProvider['kind']; model?: string }> = {
  grok: { base: 'https://api.x.ai/v1', path: '/chat/completions', kind: 'openai' },
  codex: { base: 'https://api.openai.com/v1', path: '/chat/completions', kind: 'openai' },
  claude: { base: 'https://api.anthropic.com/v1', path: '/messages', kind: 'anthropic', model: 'claude-opus-5' },
  custom: { base: '', path: '/chat/completions', kind: 'openai' },
};
const ANTHROPIC_VERSION = '2023-06-01';

function endpointFor(base: string | undefined, path: string): URL | null {
  if (!base) return null;
  let url: URL;
  try { url = new URL(base); } catch { return null; }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) return null;
  url.pathname = url.pathname.replace(/\/$/, '') + path;
  return url;
}
function valid(model: string | undefined, key: string | undefined) { return !!model && model.length <= 120 && !!key && key.length <= 4000; }

function build(id: AIProviderId, env: AIProviderEnv): AIProvider | null {
  const d = defaults[id];
  const source = id === 'grok' ? { key: env.AI_GROK_API_KEY, model: env.AI_GROK_MODEL, base: env.AI_GROK_BASE_URL || d.base }
    : id === 'codex' ? { key: env.AI_OPENAI_API_KEY, model: env.AI_OPENAI_MODEL, base: env.AI_OPENAI_BASE_URL || d.base }
    : id === 'claude' ? { key: env.AI_CLAUDE_API_KEY, model: env.AI_CLAUDE_MODEL || (env.AI_CLAUDE_API_KEY ? d.model : undefined), base: env.AI_CLAUDE_BASE_URL || d.base }
    : { key: env.AI_API_KEY, model: env.AI_MODEL, base: env.AI_BASE_URL };
  if (!valid(source.model, source.key)) return null;
  const endpoint = endpointFor(source.base, d.path);
  if (!endpoint) return null;
  return { id, label: aiProviderLabels[id], kind: d.kind, model: source.model as string, key: source.key as string, endpoint };
}

/** Configured providers, the operator's default first. Unconfigured or invalid entries are simply absent. */
export function configuredProviders(env: AIProviderEnv): AIProvider[] {
  const list = aiProviderIds.map((id) => build(id, env)).filter((p): p is AIProvider => !!p);
  const preferred = env.AI_DEFAULT_PROVIDER;
  return list.sort((a, b) => Number(b.id === preferred) - Number(a.id === preferred));
}
export function publicProviders(env: AIProviderEnv): AIProviderSummary[] {
  return configuredProviders(env).map(({ id, label, model }) => ({ id, label, model }));
}
export function isAIProviderId(value: unknown): value is AIProviderId { return typeof value === 'string' && (aiProviderIds as readonly string[]).includes(value); }
/** A requested provider must be configured; without a request the operator's default is used. */
export function resolveProvider(env: AIProviderEnv, requested?: AIProviderId): AIProvider | null {
  const list = configuredProviders(env);
  if (requested) return list.find((p) => p.id === requested) ?? null;
  return list[0] ?? null;
}

/** Builds the outbound request. OpenAI-compatible providers take the chat messages as-is; Claude takes the system text separately. */
export function providerRequest(provider: AIProvider, messages: AIChatMessage[], options: { maxTokens: number; timeoutMs: number }): { url: URL; init: RequestInit } {
  const common = { method: 'POST' as const, redirect: 'manual' as const, signal: AbortSignal.timeout(options.timeoutMs) };
  if (provider.kind === 'anthropic') {
    const system = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n\n');
    const user = messages.filter((m) => m.role === 'user').map((m) => ({ role: 'user' as const, content: m.content }));
    return { url: provider.endpoint, init: { ...common, headers: { 'x-api-key': provider.key, 'anthropic-version': ANTHROPIC_VERSION, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: provider.model, max_tokens: options.maxTokens, ...(system ? { system } : {}), messages: user }) } };
  }
  return { url: provider.endpoint, init: { ...common, headers: { Authorization: `Bearer ${provider.key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: provider.model, messages, max_tokens: options.maxTokens, temperature: 0.2 }) } };
}

/** Extracts plain text from a provider response, or null when there is none (including a Claude refusal). */
export function providerText(provider: AIProvider, result: unknown): string | null {
  if (!result || typeof result !== 'object') return null;
  const r = result as Record<string, unknown>;
  if (provider.kind === 'anthropic') {
    if (r.stop_reason === 'refusal' || !Array.isArray(r.content)) return null;
    const text = (r.content as { type?: unknown; text?: unknown }[]).filter((b) => b && b.type === 'text' && typeof b.text === 'string').map((b) => b.text as string).join('\n').trim();
    return text || null;
  }
  const choices = r.choices;
  if (!Array.isArray(choices)) return null;
  const content = (choices[0] as { message?: { content?: unknown } } | undefined)?.message?.content;
  return typeof content === 'string' && content.trim() ? content : null;
}
