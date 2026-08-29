import { ToolLoopAgent, stepCountIs, tool } from 'ai';
import { z } from 'zod';
import { homes } from '@/data/homes';
import { siteInfo } from '@/data/site';

export type ChatAction = 'text' | 'homes' | 'lead_form' | 'tour_booking' | 'financing_info';
export type ConversationItem = { role?: string; content?: string };

export type AgentUiState = {
  homeSlugs: Set<string>;
  actionType: ChatAction;
};

const MAX_HISTORY_ITEMS = 16;
const MAX_HISTORY_ITEM_LENGTH = 1600;

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

function createAgent(uiState: AgentUiState) {
  return new ToolLoopAgent({
    model: process.env.EHS_CHAT_MODEL?.trim() || 'openai/gpt-5.6-sol',
    instructions: instructions(),
    stopWhen: stepCountIs(8),
    maxOutputTokens: 900,
    temperature: 0.35,
    tools: {
      get_home_details: tool({
        description: 'Find and return verified Easy HomeSource catalog details for one specific home or model. Use this whenever the customer names a home, model, or manufacturer + model combination.',
        inputSchema: z.object({
          query: z.string().min(1).describe('The customer wording for the home, model, or manufacturer + model combination.'),
        }),
        execute: async ({ query }) => {
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
        },
      }),

      search_home_catalog: tool({
        description: 'Search the verified Easy HomeSource home catalog by natural language, manufacturer, bedrooms, budget, or on-display status. Use this for comparisons and recommendations.',
        inputSchema: z.object({
          query: z.string().optional().describe('Natural-language home/model/manufacturer wording, if any.'),
          bedrooms: z.number().int().min(1).max(10).optional(),
          minBedrooms: z.number().int().min(1).max(10).optional(),
          maxPrice: z.number().positive().optional(),
          onDisplayOnly: z.boolean().optional(),
          manufacturer: z.string().optional(),
          limit: z.number().int().min(1).max(8).optional(),
        }),
        execute: async (input) => {
          const matches = searchCatalog(input);
          for (const home of matches.slice(0, 4)) uiState.homeSlugs.add(home.slug);
          return {
            count: matches.length,
            homes: matches.map((home) => compactHome(home)),
          };
        },
      }),

      get_dealership_info: tool({
        description: 'Return verified Brooksville dealership address, phone, hours, local time, and display-home count. Use for visit, hours, phone, address, and open-now questions.',
        inputSchema: z.object({}),
        execute: async () => ({
          address: siteInfo.address,
          phone: siteInfo.phoneDisplay,
          email: siteInfo.email,
          hours: siteInfo.businessHours,
          localTime: brooksvilleLocalTime(),
          activeDisplayHomes: homes.filter((home) => home.isActive !== false && home.isOnDisplay).length,
        }),
      }),

      open_quote_request: tool({
        description: 'Signal the website to open the quote-request UI. Use only after the customer explicitly asks to start/request/build/get a quote or clearly accepts an offer to do so.',
        inputSchema: z.object({
          reason: z.string().optional(),
        }),
        execute: async ({ reason }) => {
          uiState.actionType = 'lead_form';
          return { opened: true, reason: reason || 'Customer explicitly requested a quote.' };
        },
      }),

      open_tour_request: tool({
        description: 'Signal the website to open the tour-request UI. Use only when the customer explicitly asks to schedule/book/reserve/set up a tour or appointment.',
        inputSchema: z.object({
          reason: z.string().optional(),
        }),
        execute: async ({ reason }) => {
          uiState.actionType = 'tour_booking';
          return { opened: true, reason: reason || 'Customer explicitly requested a tour appointment.' };
        },
      }),
    },
  });
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

  const agent = createAgent(uiState);
  const result = await agent.generate({
    messages: [...normalizedHistory, { role: 'user' as const, content: message }],
    timeout: { totalMs: 30000, stepMs: 12000 },
  });

  if (!result.text?.trim()) {
    throw new Error(`EHS sales agent returned no final text (finishReason=${result.finishReason}).`);
  }

  if (uiState.actionType === 'text' && uiState.homeSlugs.size > 0) {
    uiState.actionType = 'homes';
  }

  return {
    reply: result.text.trim(),
    actionType: uiState.actionType,
    homeSlugs: [...uiState.homeSlugs].slice(0, 4),
    model: result.response?.modelId || process.env.EHS_CHAT_MODEL?.trim() || 'openai/gpt-5.6-sol',
    steps: result.steps.length,
  };
}

export const __test = {
  queryMatchesHome,
  homeMatchScore,
  searchCatalog,
};
