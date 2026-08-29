import { homes } from '@/data/homes';
import { siteInfo } from '@/data/site';

export type ChatAction = 'text' | 'homes' | 'lead_form' | 'tour_booking' | 'financing_info';
export type ConversationItem = { role?: string; content?: string };

export type AgentUiState = {
  homeSlugs: Set<string>;
  actionType: ChatAction;
};

type JsonObject = Record<string, unknown>;

type CloudflareToolCall = {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
};

type CloudflareMessage =
  | { role: 'system' | 'user'; content: string }
  | { role: 'assistant'; content: string | null; tool_calls?: CloudflareToolCall[] }
  | { role: 'tool'; tool_call_id: string; name: string; content: string };

type CloudflareCompletion = {
  model: string;
  finishReason: string | null;
  message: Extract<CloudflareMessage, { role: 'assistant' }>;
};

const MAX_HISTORY_ITEMS = 16;
const MAX_HISTORY_ITEM_LENGTH = 1600;
const MAX_AGENT_STEPS = 8;
const MAX_OUTPUT_TOKENS = 900;
const AGENT_TOTAL_TIMEOUT_MS = 30_000;
const AGENT_STEP_TIMEOUT_MS = 12_000;
const DEFAULT_CLOUDFLARE_MODEL = '@cf/qwen/qwen3-30b-a3b-fp8';

const CLOUDFLARE_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'get_home_details',
      description: 'Find and return verified Easy HomeSource catalog details for one specific home or model. Use this whenever the customer names a home, model, or manufacturer + model combination.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The customer wording for the home, model, or manufacturer + model combination.',
          },
        },
        required: ['query'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_home_catalog',
      description: 'Search the verified Easy HomeSource home catalog by natural language, manufacturer, bedrooms, budget, or on-display status. Use this for comparisons and recommendations.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Natural-language home/model/manufacturer wording, if any.' },
          bedrooms: { type: 'integer', minimum: 1, maximum: 10 },
          minBedrooms: { type: 'integer', minimum: 1, maximum: 10 },
          maxPrice: { type: 'number', exclusiveMinimum: 0 },
          onDisplayOnly: { type: 'boolean' },
          manufacturer: { type: 'string' },
          limit: { type: 'integer', minimum: 1, maximum: 8 },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_dealership_info',
      description: 'Return verified Brooksville dealership address, phone, hours, local time, and display-home count. Use for visit, hours, phone, address, and open-now questions.',
      parameters: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'open_quote_request',
      description: 'Signal the website to open the quote-request UI. Use only after the customer explicitly asks to start/request/build/get a quote or clearly accepts an offer to do so.',
      parameters: {
        type: 'object',
        properties: {
          reason: { type: 'string' },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'open_tour_request',
      description: 'Signal the website to open the tour-request UI. Use only when the customer explicitly asks to schedule/book/reserve/set up a tour or appointment.',
      parameters: {
        type: 'object',
        properties: {
          reason: { type: 'string' },
        },
        additionalProperties: false,
      },
    },
  },
] as const;

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function compact(value: string) {
  return normalize(value).replace(/\s+/g, '');
}

function homeSearchText(home: (typeof homes)[number]) {
  return [
    home.name,
    home.displayName,
    home.alternateName,
    home.slug,
    home.manufacturer,
    home.series,
    home.modelNumber,
    home.homeType,
  ]
    .filter((value): value is string => Boolean(value))
    .join(' ');
}

function queryMatchesHome(home: (typeof homes)[number], query: string) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return true;

  const haystack = homeSearchText(home);
  const normalizedHaystack = normalize(haystack);
  const compactHaystack = compact(haystack);
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

  if (normalizedHaystack.includes(normalizedQuery)) return true;
  if (compactHaystack.includes(compact(normalizedQuery))) return true;

  return tokens.every((token) => compactHaystack.includes(compact(token)));
}

function homeMatchScore(home: (typeof homes)[number], query: string) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return 1;

  const candidates = [
    home.name,
    home.displayName,
    home.alternateName,
    home.modelNumber,
    home.slug.replace(/-/g, ' '),
    `${home.manufacturer || ''} ${home.name}`,
    `${home.manufacturer || ''} ${home.displayName || home.name}`,
  ].filter((value): value is string => Boolean(value));

  let score = 0;
  const compactQuery = compact(normalizedQuery);

  for (const candidate of candidates) {
    const normalizedCandidate = normalize(candidate);
    const compactCandidate = compact(candidate);
    if (normalizedCandidate === normalizedQuery || compactCandidate === compactQuery) score = Math.max(score, 100);
    else if (normalizedCandidate.includes(normalizedQuery) || compactCandidate.includes(compactQuery)) score = Math.max(score, 80);
    else if (normalizedQuery.includes(normalizedCandidate) || compactQuery.includes(compactCandidate)) score = Math.max(score, 65);
  }

  if (queryMatchesHome(home, query)) score = Math.max(score, 50);
  return score;
}

function money(value: number) {
  return `$${Math.round(value).toLocaleString('en-US')}`;
}

function displayPrice(home: (typeof homes)[number]) {
  if (typeof home.salePrice === 'number') return `Sale price ${money(home.salePrice)}`;
  if (typeof home.startingPrice === 'number') return `Starting at ${money(home.startingPrice)}`;
  return 'Price requires an EHS quote';
}

function compactHome(home: (typeof homes)[number]) {
  return {
    slug: home.slug,
    name: home.displayName || home.name,
    manufacturer: home.manufacturer || null,
    series: home.series || null,
    modelNumber: home.modelNumber || null,
    bedrooms: home.bedrooms ?? null,
    bathrooms: home.bathrooms ?? null,
    squareFeet: home.squareFeet ?? null,
    size: home.size || null,
    price: displayPrice(home),
    availability: home.isOnDisplay ? 'on display in Brooksville' : home.isCatalogModel ? 'catalog/order model' : home.status,
    description: home.shortDescription || null,
    features: home.features?.slice(0, 8) || [],
    brochureUrl: home.brochureUrl || null,
  };
}

function searchCatalog(input: {
  query?: string;
  bedrooms?: number;
  minBedrooms?: number;
  maxPrice?: number;
  onDisplayOnly?: boolean;
  manufacturer?: string;
  limit?: number;
}) {
  const query = input.query?.trim() || '';
  const manufacturer = input.manufacturer?.trim() || '';
  const limit = Math.min(Math.max(input.limit || 5, 1), 8);

  return homes
    .filter((home) => home.isActive !== false)
    .filter((home) => !input.onDisplayOnly || home.isOnDisplay)
    .filter((home) => input.bedrooms == null || home.bedrooms === input.bedrooms)
    .filter((home) => input.minBedrooms == null || (home.bedrooms ?? 0) >= input.minBedrooms)
    .filter((home) => input.maxPrice == null || (home.salePrice ?? home.startingPrice ?? Number.POSITIVE_INFINITY) <= input.maxPrice)
    .filter((home) => !manufacturer || compact(home.manufacturer || '').includes(compact(manufacturer)))
    .filter((home) => !query || queryMatchesHome(home, query))
    .map((home) => ({ home, score: query ? homeMatchScore(home, query) : 1 }))
    .sort((a, b) => b.score - a.score || Number(b.home.isOnDisplay) - Number(a.home.isOnDisplay))
    .slice(0, limit)
    .map(({ home }) => home);
}

function brooksvilleLocalTime() {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: siteInfo.timezone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(new Date());
}

function instructions() {
  return `You are the Easy HomeSource AI Sales Agent for the Brooksville, Florida manufactured-home dealership.

You are an actual conversational sales agent, not a menu bot and not a keyword-response system. Think about the customer's meaning, preserve context across turns, use tools when factual EHS data is needed, and answer the question they actually asked.

CORE BEHAVIOR
- Help first, sell second.
- Speak naturally and concisely. Usually 2-5 sentences is enough.
- Never reset the conversation with a generic list of things you can do.
- Never ignore a home or preference the customer just mentioned.
- Resolve natural phrasing, misspellings, spacing differences, manufacturer + model combinations, and conversational references when possible.
- If a customer says something like "Timber Creek Lakewood," understand that they may mean a Timber Creek Housing model named Lake Wood and use the catalog tools to verify it.
- Ask one useful follow-up question at a time only when it genuinely helps.
- Do not repeatedly ask for contact information.

TOOL RULES
- When the customer mentions or asks about a specific home, model, manufacturer/model combination, floorplan, bedroom count, price range, or what's on display, use the catalog tools before answering factual details.
- Use get_home_details for a specific named/model home.
- Use search_home_catalog for comparisons, budgets, bedroom counts, display inventory, or uncertain model wording.
- Use get_dealership_info for hours, address, phone, visit questions, or "are you open now?"
- Use open_quote_request only when the customer explicitly asks to start/request/build/get a quote or clearly accepts a prior offer to do so.
- Use open_tour_request only when the customer explicitly asks to schedule/book/reserve/set up a tour or appointment. Simply wanting to visit does not require a form.
- Tool results are authoritative for EHS-specific facts. Do not invent catalog facts.

BUSINESS GUARDRAILS
- Final home pricing, site work, delivery/setup, permitting, taxes, impact fees, utility work, septic/well, lender terms, rates, down payment, approval, factory options, and availability require verification/final quote when not explicitly provided by a tool.
- Do not promise zoning, permits, financing approval, exact lender terms, delivery dates, or contractor pricing.
- Do not claim a catalog/order model is physically on the Brooksville lot unless the tool says it is on display.
- If you do not have enough verified information, say what is missing instead of making it up.
- Current Brooksville local time is ${brooksvilleLocalTime()}.

CONVERSION
- You may offer a next step when it is genuinely relevant, but do not turn every exchange into a lead capture.
- A customer should be able to have a useful conversation without submitting a form.
- Keep the tone like a knowledgeable dealership employee, not an automated script.`;
}

function isRecord(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function boundedInteger(value: unknown, minimum: number, maximum: number) {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(numeric) || numeric < minimum || numeric > maximum) return undefined;
  return numeric;
}

function positiveNumber(value: unknown) {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return undefined;
  return numeric;
}

function booleanValue(value: unknown) {
  return typeof value === 'boolean' ? value : undefined;
}

function parseToolArguments(raw: string): JsonObject {
  try {
    const parsed = JSON.parse(raw);
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function cloudflareConfig() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const apiToken = process.env.CLOUDFLARE_AI_API_TOKEN?.trim();
  const model = process.env.EHS_CHAT_MODEL?.trim() || DEFAULT_CLOUDFLARE_MODEL;

  if (!accountId || !apiToken) {
    throw new Error('Cloudflare Workers AI is not configured. CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_AI_API_TOKEN are required.');
  }

  return { accountId, apiToken, model };
}

function normalizeToolCall(value: unknown, step: number, index: number): CloudflareToolCall | null {
  if (!isRecord(value) || !isRecord(value.function)) return null;
  const name = stringValue(value.function.name);
  if (!name) return null;

  const rawArguments = value.function.arguments;
  const argumentsText = typeof rawArguments === 'string'
    ? rawArguments
    : JSON.stringify(isRecord(rawArguments) ? rawArguments : {});

  return {
    id: stringValue(value.id) || `ehs_tool_${step}_${index}`,
    type: 'function',
    function: {
      name,
      arguments: argumentsText,
    },
  };
}

function parseCloudflareCompletion(payload: unknown, configuredModel: string, step: number): CloudflareCompletion {
  const root = isRecord(payload) && isRecord(payload.result) ? payload.result : payload;
  if (!isRecord(root) || !Array.isArray(root.choices) || !root.choices.length || !isRecord(root.choices[0])) {
    throw new Error('Cloudflare Workers AI returned an invalid chat-completion payload.');
  }

  const choice = root.choices[0];
  if (!isRecord(choice.message)) {
    throw new Error('Cloudflare Workers AI returned a chat completion without an assistant message.');
  }

  const rawToolCalls = Array.isArray(choice.message.tool_calls) ? choice.message.tool_calls : [];
  const toolCalls = rawToolCalls
    .map((item, index) => normalizeToolCall(item, step, index))
    .filter((item): item is CloudflareToolCall => Boolean(item));

  return {
    model: stringValue(root.model) || configuredModel,
    finishReason: stringValue(choice.finish_reason) || null,
    message: {
      role: 'assistant',
      content: typeof choice.message.content === 'string' ? choice.message.content : null,
      ...(toolCalls.length ? { tool_calls: toolCalls } : {}),
    },
  };
}

async function requestCloudflareCompletion(messages: CloudflareMessage[], deadline: number, step: number) {
  const { accountId, apiToken, model } = cloudflareConfig();
  const remainingMs = deadline - Date.now();
  if (remainingMs <= 0) throw new Error('EHS sales agent exceeded its total response timeout.');

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/ai/v1/chat/completions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        tools: CLOUDFLARE_TOOLS,
        tool_choice: 'auto',
        temperature: 0.35,
        max_tokens: MAX_OUTPUT_TOKENS,
        stream: false,
      }),
      signal: AbortSignal.timeout(Math.max(1, Math.min(AGENT_STEP_TIMEOUT_MS, remainingMs))),
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    const errorText = (await response.text()).replace(/\s+/g, ' ').slice(0, 350);
    throw new Error(`Cloudflare Workers AI request failed with HTTP ${response.status}${errorText ? `: ${errorText}` : ''}`);
  }

  const payload: unknown = await response.json();
  return parseCloudflareCompletion(payload, model, step);
}

async function executeToolCall(call: CloudflareToolCall, uiState: AgentUiState) {
  const input = parseToolArguments(call.function.arguments);

  switch (call.function.name) {
    case 'get_home_details': {
      const query = stringValue(input.query);
      if (!query) return { error: 'query is required' };

      const matches = searchCatalog({ query, limit: 4 });
      if (!matches.length) {
        return {
          found: false,
          query,
          message: 'No verified catalog match was found. Ask one clarifying question rather than inventing a home.',
        };
      }

      const home = matches[0];
      uiState.homeSlugs.add(home.slug);
      return {
        found: true,
        home: compactHome(home),
        alternatives: matches.slice(1, 4).map((item) => compactHome(item)),
      };
    }

    case 'search_home_catalog': {
      const matches = searchCatalog({
        query: stringValue(input.query),
        bedrooms: boundedInteger(input.bedrooms, 1, 10),
        minBedrooms: boundedInteger(input.minBedrooms, 1, 10),
        maxPrice: positiveNumber(input.maxPrice),
        onDisplayOnly: booleanValue(input.onDisplayOnly),
        manufacturer: stringValue(input.manufacturer),
        limit: boundedInteger(input.limit, 1, 8),
      });

      for (const home of matches.slice(0, 4)) uiState.homeSlugs.add(home.slug);
      return {
        count: matches.length,
        homes: matches.map((home) => compactHome(home)),
      };
    }

    case 'get_dealership_info':
      return {
        address: siteInfo.address,
        phone: siteInfo.phoneDisplay,
        email: siteInfo.email,
        hours: siteInfo.businessHours,
        localTime: brooksvilleLocalTime(),
        activeDisplayHomes: homes.filter((home) => home.isActive !== false && home.isOnDisplay).length,
      };

    case 'open_quote_request': {
      uiState.actionType = 'lead_form';
      return {
        opened: true,
        reason: stringValue(input.reason) || 'Customer explicitly requested a quote.',
      };
    }

    case 'open_tour_request': {
      uiState.actionType = 'tour_booking';
      return {
        opened: true,
        reason: stringValue(input.reason) || 'Customer explicitly requested a tour appointment.',
      };
    }

    default:
      return { error: `Unknown EHS tool: ${call.function.name}` };
  }
}

export async function runEhsSalesAgent(message: string, history: ConversationItem[]) {
  const uiState: AgentUiState = {
    homeSlugs: new Set<string>(),
    actionType: 'text',
  };

  const normalizedHistory = history
    .slice(-MAX_HISTORY_ITEMS)
    .map((item) => ({
      role: item?.role === 'bot' || item?.role === 'assistant' ? ('assistant' as const) : ('user' as const),
      content: typeof item?.content === 'string' ? item.content.slice(0, MAX_HISTORY_ITEM_LENGTH) : '',
    }))
    .filter((item) => item.content.trim());

  const messages: CloudflareMessage[] = [
    { role: 'system', content: instructions() },
    ...normalizedHistory,
    { role: 'user', content: message },
  ];

  const deadline = Date.now() + AGENT_TOTAL_TIMEOUT_MS;
  let reply = '';
  let model = process.env.EHS_CHAT_MODEL?.trim() || DEFAULT_CLOUDFLARE_MODEL;
  let steps = 0;

  while (steps < MAX_AGENT_STEPS) {
    steps += 1;
    const completion = await requestCloudflareCompletion(messages, deadline, steps);
    model = completion.model;
    messages.push(completion.message);

    const toolCalls = completion.message.tool_calls || [];
    if (!toolCalls.length) {
      reply = completion.message.content?.trim() || '';
      if (!reply) {
        throw new Error(`EHS sales agent returned no final text (finishReason=${completion.finishReason || 'unknown'}).`);
      }
      break;
    }

    for (const call of toolCalls) {
      const toolResult = await executeToolCall(call, uiState);
      messages.push({
        role: 'tool',
        tool_call_id: call.id,
        name: call.function.name,
        content: JSON.stringify(toolResult),
      });
    }
  }

  if (!reply) {
    throw new Error(`EHS sales agent did not produce a final answer within ${MAX_AGENT_STEPS} tool-loop steps.`);
  }

  if (uiState.actionType === 'text' && uiState.homeSlugs.size > 0) {
    uiState.actionType = 'homes';
  }

  return {
    reply,
    actionType: uiState.actionType,
    homeSlugs: [...uiState.homeSlugs].slice(0, 4),
    model,
    steps,
  };
}

export const __test = {
  queryMatchesHome,
  homeMatchScore,
  searchCatalog,
  parseToolArguments,
  parseCloudflareCompletion,
};
