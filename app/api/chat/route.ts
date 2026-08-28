import { NextResponse } from 'next/server';
import { homes } from '@/data/homes';
import { siteInfo } from '@/data/site';

type ChatAction = 'text' | 'homes' | 'lead_form' | 'tour_booking' | 'financing_info';
type ConversationItem = { role?: string; content?: string };
type StructuredChatResponse = {
  reply: string;
  actionType: ChatAction;
  homeSlugs: string[];
};

type RateEntry = { count: number; resetAt: number };
const globalChatState = globalThis as typeof globalThis & {
  __ehsChatRateLimit?: Map<string, RateEntry>;
};
const chatRateLimit = globalChatState.__ehsChatRateLimit ?? new Map<string, RateEntry>();
globalChatState.__ehsChatRateLimit = chatRateLimit;

const ACTIONS = new Set<ChatAction>(['text', 'homes', 'lead_form', 'tour_booking', 'financing_info']);
const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_ITEMS = 10;
const MAX_HISTORY_ITEM_LENGTH = 1200;

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function money(value: number) {
  return `$${Math.round(value).toLocaleString('en-US')}`;
}

function displayPrice(home: (typeof homes)[number]) {
  if (typeof home.salePrice === 'number') return `Sale price ${money(home.salePrice)}`;
  if (typeof home.startingPrice === 'number') return `Starting at ${money(home.startingPrice)}`;
  return 'Call/Text for price';
}

function toRecommendedHome(home: (typeof homes)[number]) {
  return {
    slug: home.slug,
    name: home.displayName || home.name,
    bedrooms: home.bedrooms,
    bathrooms: home.bathrooms,
    squareFeet: home.squareFeet,
    size: home.size,
    displayPrice: displayPrice(home),
    image: home.gallery?.[0]?.src || home.images?.[0] || null,
    tagline: home.shortDescription ? `${home.shortDescription.slice(0, 110)}${home.shortDescription.length > 110 ? '…' : ''}` : undefined,
  };
}

function resolveHomes(slugs: string[]) {
  const unique = [...new Set(slugs)].slice(0, 4);
  const bySlug = new Map(homes.map((home) => [home.slug, home]));
  return unique.map((slug) => bySlug.get(slug)).filter((home): home is (typeof homes)[number] => Boolean(home));
}

function compactCatalogContext() {
  return homes
    .filter((home) => home.isActive !== false)
    .map((home) => {
      const parts = [
        `slug=${home.slug}`,
        `name=${home.displayName || home.name}`,
        home.modelNumber ? `model=${home.modelNumber}` : '',
        home.manufacturer ? `manufacturer=${home.manufacturer}` : '',
        home.series ? `series=${home.series}` : '',
        home.bedrooms != null ? `beds=${home.bedrooms}` : '',
        home.bathrooms != null ? `baths=${home.bathrooms}` : '',
        home.squareFeet != null ? `sqft=${home.squareFeet}` : '',
        home.size ? `size=${home.size}` : '',
        `availability=${home.isOnDisplay ? 'on-display' : home.isCatalogModel ? 'catalog-order' : home.status}`,
        `price=${displayPrice(home)}`,
      ].filter(Boolean);
      return `- ${parts.join(' | ')}`;
    })
    .join('\n');
}

function instructions() {
  return `You are the Easy HomeSource website sales assistant for a manufactured-home dealership in Brooksville, Florida.

Your job is HELP FIRST, CONVERT SECOND. Hold a normal, useful, multi-turn conversation. Answer the customer's actual question before asking anything else. Use prior conversation context so the customer does not have to repeat themselves.

BUSINESS FACTS
- Easy HomeSource address: ${siteInfo.address}
- Main phone/text line: ${siteInfo.phoneDisplay}
- Email: ${siteInfo.email}
- EHS sells manufactured homes and helps customers navigate home selection, delivery/setup, site work, permitting, land/home packages, and financing conversations.
- Final pricing, site-work costs, financing, availability, factory options, delivery, permitting, taxes, fees, and project costs require verification/final quote.
- Do not claim an exact lender rate, approval, down payment, zoning result, permit outcome, site-work price, or delivery price unless it is explicitly supplied in the conversation or catalog context.
- If a home's price is not in the catalog context, say EHS needs to quote it. Never invent a price.
- If asked about current business hours and no verified hours are supplied in the conversation, say you can provide the address and phone but the customer should confirm today's hours with the dealership.

CONVERSATION RULES
1. Be conversational, concise, knowledgeable, and human. Usually 2-5 sentences is enough; use short bullets only when they genuinely help.
2. Do not sound like a lead form. Do not repeatedly ask for name, phone, email, land status, or appointment details.
3. Mentioning price, cost, financing, land, zoning, septic, well, permitting, delivery, or a model does NOT by itself justify opening a lead form.
4. Use actionType="lead_form" ONLY when the customer explicitly asks to get/request/build a quote or estimate, asks EHS to contact/follow up with them, or clearly accepts a prior offer to start a quote.
5. Use actionType="tour_booking" ONLY when the customer explicitly asks to schedule/book/set up a visit or tour. Asking for the address, directions, or hours is not a booking request.
6. Use actionType="financing_info" when the response is primarily financing guidance and no form should open.
7. Use actionType="homes" when one or more real catalog homes are useful to show. Return only exact slugs from the catalog below. Never invent a slug or model.
8. Use actionType="text" for normal conversation when cards/forms are unnecessary.
9. If the customer is uncertain, help them narrow choices with one useful question at a time (for example bedrooms, budget, land status, preferred home size). Do not interrogate them.
10. Plain text only. Do not use markdown links or pretend you completed actions outside this chat.
11. Do not say a home is physically on the Brooksville lot unless its catalog line says availability=on-display.
12. If you cannot verify an EHS-specific fact, say so clearly and offer the best next step.

CURRENT EHS HOME CATALOG
${compactCatalogContext()}`;
}

function extractOutputText(payload: any) {
  if (typeof payload?.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  for (const item of Array.isArray(payload?.output) ? payload.output : []) {
    for (const content of Array.isArray(item?.content) ? item.content : []) {
      if (content?.type === 'output_text' && typeof content.text === 'string' && content.text.trim()) {
        return content.text.trim();
      }
    }
  }

  return '';
}

function sanitizeStructuredResponse(value: any): StructuredChatResponse | null {
  if (!value || typeof value.reply !== 'string' || !value.reply.trim()) return null;
  const actionType = ACTIONS.has(value.actionType as ChatAction) ? (value.actionType as ChatAction) : 'text';
  const homeSlugs = Array.isArray(value.homeSlugs)
    ? value.homeSlugs.filter((slug: unknown): slug is string => typeof slug === 'string').slice(0, 4)
    : [];

  return {
    reply: value.reply.trim(),
    actionType,
    homeSlugs,
  };
}

function findExplicitHomeMatches(message: string) {
  const query = normalize(message);
  if (!query) return [];

  return homes.filter((home) => {
    const candidates = [home.name, home.displayName || '', home.modelNumber || '', home.slug.replace(/-/g, ' ')];
    return candidates.some((candidate) => {
      const normalized = normalize(candidate);
      return normalized.length >= 4 && query.includes(normalized);
    });
  }).slice(0, 4);
}

function fallbackResponse(message: string): StructuredChatResponse {
  const query = normalize(message);
  const matched = findExplicitHomeMatches(message);

  if (matched.length > 0) {
    const descriptions = matched.map((home) => {
      const specs = [
        home.bedrooms != null ? `${home.bedrooms} bed` : '',
        home.bathrooms != null ? `${home.bathrooms} bath` : '',
        home.squareFeet != null ? `${home.squareFeet.toLocaleString()} sq ft` : '',
        home.size || '',
      ].filter(Boolean).join(', ');
      return `${home.displayName || home.name}: ${specs}. ${displayPrice(home)}.`;
    });

    return {
      reply: `${descriptions.join('\n')} What would you like to compare or know about ${matched.length === 1 ? 'this home' : 'these homes'}?`,
      actionType: 'homes',
      homeSlugs: matched.map((home) => home.slug),
    };
  }

  const explicitQuote = /(start|get|build|request|send|make|create|need|want).*(quote|estimate)|\bquote me\b|\bturnkey quote\b/.test(query);
  if (explicitQuote) {
    return {
      reply: 'Yes. I can open the quick quote request so the EHS team has the details needed to build a real project estimate. You can still keep chatting with me before or after you submit it.',
      actionType: 'lead_form',
      homeSlugs: [],
    };
  }

  const explicitTour = /(schedule|book|set up|reserve|request).*(tour|visit|walk through|walkthrough|appointment)/.test(query);
  if (explicitTour) {
    return {
      reply: `Absolutely. I can open the tour request form for the Brooksville location at ${siteInfo.address}.`,
      actionType: 'tour_booking',
      homeSlugs: [],
    };
  }

  if (/(finance|financing|loan|credit|down payment|fha|va|usda)/.test(query)) {
    return {
      reply: 'EHS can help you understand manufactured-home financing paths and connect you with lending options. Exact programs, down payment, rates, and approval depend on the lender and your project, so I can explain the process without pretending there is one answer for everyone. What part of financing are you trying to figure out?',
      actionType: 'financing_info',
      homeSlugs: [],
    };
  }

  if (/(land|property|zoning|septic|well|permit|delivery|setup|site work)/.test(query)) {
    return {
      reply: 'EHS can help coordinate the home and the site side of the project, including delivery/setup, permitting, and common land or utility questions. The exact answer depends on the property and county, so tell me what you are trying to figure out and I’ll narrow it down with you.',
      actionType: 'text',
      homeSlugs: [],
    };
  }

  const featured = homes.filter((home) => home.isFeatured && home.isActive !== false).slice(0, 3);
  return {
    reply: 'I can help you compare homes, narrow down floorplans, understand pricing and turnkey costs, talk through land/site work, financing, delivery/setup, or plan a visit. What are you working on?',
    actionType: featured.length ? 'homes' : 'text',
    homeSlugs: featured.map((home) => home.slug),
  };
}

function checkRateLimit(req: Request) {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const key = forwarded || req.headers.get('x-real-ip') || 'anonymous';
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const maxRequests = 30;
  const current = chatRateLimit.get(key);

  if (!current || current.resetAt <= now) {
    chatRateLimit.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (current.count >= maxRequests) return false;
  current.count += 1;
  return true;
}

export async function POST(req: Request) {
  try {
    if (!checkRateLimit(req)) {
      return NextResponse.json(
        { error: 'Too many chat requests. Please wait a few minutes and try again.' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const message = typeof body?.message === 'string' ? body.message.trim().slice(0, MAX_MESSAGE_LENGTH) : '';
    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const history: ConversationItem[] = Array.isArray(body?.conversationHistory)
      ? body.conversationHistory.slice(-MAX_HISTORY_ITEMS)
      : [];

    const normalizedHistory = history
      .map((item) => ({
        role: item?.role === 'bot' || item?.role === 'assistant' ? 'assistant' : 'user',
        content: typeof item?.content === 'string' ? item.content.slice(0, MAX_HISTORY_ITEM_LENGTH) : '',
      }))
      .filter((item) => item.content.trim());

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    let structured: StructuredChatResponse | null = null;

    if (apiKey) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const openAiResponse = await fetch('https://api.openai.com/v1/responses', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: process.env.OPENAI_CHAT_MODEL?.trim() || 'gpt-5.6-luna',
            instructions: instructions(),
            input: [...normalizedHistory, { role: 'user', content: message }],
            reasoning: { effort: 'none' },
            max_output_tokens: 700,
            store: false,
            truncation: 'auto',
            text: {
              verbosity: 'low',
              format: {
                type: 'json_schema',
                name: 'ehs_website_chat_response',
                strict: true,
                schema: {
                  type: 'object',
                  properties: {
                    reply: { type: 'string' },
                    actionType: {
                      type: 'string',
                      enum: ['text', 'homes', 'lead_form', 'tour_booking', 'financing_info'],
                    },
                    homeSlugs: {
                      type: 'array',
                      maxItems: 4,
                      items: { type: 'string' },
                    },
                  },
                  required: ['reply', 'actionType', 'homeSlugs'],
                  additionalProperties: false,
                },
              },
            },
          }),
          signal: controller.signal,
        }).finally(() => clearTimeout(timeout));

        if (openAiResponse.ok) {
          const payload = await openAiResponse.json();
          const outputText = extractOutputText(payload);
          if (outputText) {
            structured = sanitizeStructuredResponse(JSON.parse(outputText));
          }
        } else {
          const errorText = await openAiResponse.text().catch(() => '');
          console.error('Easy HomeSource AI response error:', openAiResponse.status, errorText.slice(0, 500));
        }
      } catch (error) {
        console.error('Easy HomeSource AI request failed:', error);
      }
    }

    const finalResponse = structured || fallbackResponse(message);
    const matchedHomes = resolveHomes(finalResponse.homeSlugs);
    const actionType: ChatAction = finalResponse.actionType === 'homes' && matchedHomes.length === 0
      ? 'text'
      : finalResponse.actionType;

    return NextResponse.json({
      success: true,
      reply: finalResponse.reply,
      actionType,
      homes: matchedHomes.map(toRecommendedHome),
      aiEnabled: Boolean(apiKey && structured),
    });
  } catch (error) {
    console.error('Easy HomeSource Chatbot error:', error);
    return NextResponse.json(
      {
        success: true,
        reply: `I’m having trouble answering that right now. You can keep trying here, or call/text Easy HomeSource at ${siteInfo.phoneDisplay}.`,
        actionType: 'text',
        homes: [],
        aiEnabled: false,
      },
      { status: 200 }
    );
  }
}
