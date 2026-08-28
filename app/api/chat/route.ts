import { NextResponse } from 'next/server';
import { homes } from '@/data/homes';
import { siteInfo } from '@/data/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ChatAction = 'text' | 'homes' | 'lead_form' | 'tour_booking' | 'financing_info';

type IncomingHistoryItem = {
  role?: string;
  content?: string;
};

type AssistantPayload = {
  reply: string;
  actionType: ChatAction;
  homeSlugs: string[];
};

const RESPONSE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    reply: { type: 'string', minLength: 1 },
    actionType: {
      type: 'string',
      enum: ['text', 'homes', 'lead_form', 'tour_booking', 'financing_info']
    },
    homeSlugs: {
      type: 'array',
      items: { type: 'string' },
      maxItems: 4
    }
  },
  required: ['reply', 'actionType', 'homeSlugs']
} as const;

const compactCatalog = homes
  .filter((home) => home.isActive !== false)
  .map((home) => {
    const price = home.startingPrice != null
      ? `$${Math.round(home.startingPrice).toLocaleString()} starting home price`
      : 'EHS price requires confirmation';
    const placement = home.isOnDisplay ? 'ON DISPLAY' : home.isCatalogModel ? 'CATALOG / ORDER MODEL' : 'EHS HOME';
    const specs = [
      home.bedrooms != null ? `${home.bedrooms} bed` : null,
      home.bathrooms != null ? `${home.bathrooms} bath` : null,
      home.squareFeet != null ? `${home.squareFeet.toLocaleString()} sq ft` : null,
      home.size || null
    ].filter(Boolean).join(', ');

    return `- ${home.name} | slug=${home.slug} | ${home.manufacturer || 'manufacturer unconfirmed'} | ${home.modelNumber || 'model unconfirmed'} | ${specs || 'specs to confirm'} | ${price} | ${placement}`;
  })
  .join('\n');

const displayHomeCount = homes.filter((home) => home.isActive !== false && home.isOnDisplay).length;

const assistantInstructions = `
You are the Easy HomeSource website sales assistant for a manufactured-home dealership in Brooksville, Florida.

PRIMARY JOB
Have a useful, natural conversation. Answer the customer's question first. Help them understand homes, models, pricing, land/home packages, delivery, setup, permitting, site work, and financing. Ask one relevant follow-up question when it helps. Do NOT behave like a lead form disguised as a chatbot.

CONVERSION RULES
- Normal questions must stay conversational. Use actionType "text", "homes", or "financing_info".
- Use "lead_form" ONLY when the customer explicitly asks to get/request/build/send a quote, asks EHS to contact/call/text/follow up with them, or clearly confirms a prior quote/contact offer.
- Use "tour_booking" ONLY when the customer explicitly asks to schedule/book/set up a visit, tour, appointment, or walkthrough, or clearly confirms a prior scheduling offer.
- Never pressure the customer for name, phone, or email just to answer a question.
- Do not claim that submitting a form guarantees a price, appointment, loan, or availability.

CATALOG AND PRICING RULES
- Use ONLY the catalog facts below for home names, model numbers, bed/bath counts, square footage, dimensions, on-display status, and EHS starting prices.
- Never invent a home, price, feature, discount, inventory status, or promotion.
- If a customer asks for a home recommendation, return up to four exact catalog slugs in homeSlugs.
- If a fact is not present, say the EHS team needs to verify it rather than guessing.
- A listed starting home price is NOT a turnkey project price. Delivery, setup, site work, permits, utilities, taxes/fees, selected options, property conditions, lender requirements, and contractor bids can change final cost.
- For site-work items such as septic, well, impact fees, utility work, grading, and similar contractor work, explain that exact costs may require site verification or third-party bids.

FINANCING RULES
- EHS can discuss manufactured-home financing paths and connect customers with third-party lenders.
- Never guarantee approval, a rate, a down-payment percentage, a monthly payment, FHA/VA/USDA eligibility, or lender terms.
- If asked for individualized loan advice, explain that final terms come from the lender after qualification.

BUSINESS FACTS
- Easy HomeSource address: ${siteInfo.address}
- Main phone/text: ${siteInfo.phoneDisplay}
- Email: ${siteInfo.email}
- Current website data marks ${displayHomeCount} homes as on display.
- Pricing disclaimer: ${siteInfo.pricingDisclaimer}

STYLE
- Friendly, clear, knowledgeable, and concise.
- Usually 2-5 short paragraphs or a compact list when comparing homes.
- Do not repeat the dealership pitch on every turn.
- Remember and use the conversation history supplied with the request.
- If the customer changes subjects, follow the new subject naturally.
- Never claim to be a human employee.

CURRENT EHS HOME CATALOG
${compactCatalog}
`;

function normalizeHistory(raw: unknown): Array<{ role: 'user' | 'assistant'; content: string }> {
  if (!Array.isArray(raw)) return [];

  return raw
    .slice(-10)
    .map((item: IncomingHistoryItem) => {
      const role = item?.role === 'bot' || item?.role === 'assistant' ? 'assistant' : item?.role === 'user' ? 'user' : null;
      const content = typeof item?.content === 'string' ? item.content.trim().slice(0, 1600) : '';
      if (!role || !content) return null;
      return { role, content };
    })
    .filter((item): item is { role: 'user' | 'assistant'; content: string } => Boolean(item));
}

function priorAssistantText(history: Array<{ role: 'user' | 'assistant'; content: string }>) {
  return [...history].reverse().find((item) => item.role === 'assistant')?.content.toLowerCase() || '';
}

function isAffirmative(text: string) {
  return /^(yes|yes please|yeah|yep|sure|ok|okay|please|absolutely|definitely|let'?s do it|do it|sounds good|i do|i would)\b/i.test(text.trim());
}

function explicitQuoteOrContactIntent(message: string, history: Array<{ role: 'user' | 'assistant'; content: string }>) {
  const text = message.toLowerCase();
  const direct =
    /\b(quote me|send me a quote|get me a quote|give me a quote|build me a quote|prepare a quote|request a quote|want a quote|need a quote|ready for a quote)\b/.test(text) ||
    /\b(contact me|call me|text me|reach out to me|follow up with me)\b/.test(text) ||
    /\b(i want|i need|i'd like|i would like|can you|could you|please)\b.{0,45}\b(quote|estimate|proposal|contact|call|text|follow up)\b/.test(text);

  if (direct) return true;

  const prior = priorAssistantText(history);
  return isAffirmative(text) && /\b(quote|estimate|contact you|call you|text you|follow up)\b/.test(prior);
}

function explicitTourIntent(message: string, history: Array<{ role: 'user' | 'assistant'; content: string }>) {
  const text = message.toLowerCase();
  const direct =
    /\b(schedule|book|set up|reserve|arrange|want|need|like)\b.{0,45}\b(tour|visit|appointment|walkthrough|walk-through)\b/.test(text) ||
    /\b(tour|visit|appointment|walkthrough|walk-through)\b.{0,45}\b(schedule|book|today|tomorrow|this week|this weekend)\b/.test(text);

  if (direct) return true;

  const prior = priorAssistantText(history);
  return isAffirmative(text) && /\b(tour|visit|appointment|walkthrough|walk-through)\b/.test(prior);
}

function gateActionType(
  requested: ChatAction,
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  homeSlugs: string[]
): ChatAction {
  if (requested === 'lead_form' && !explicitQuoteOrContactIntent(message, history)) {
    return homeSlugs.length > 0 ? 'homes' : 'text';
  }

  if (requested === 'tour_booking' && !explicitTourIntent(message, history)) {
    return homeSlugs.length > 0 ? 'homes' : 'text';
  }

  if (requested === 'homes' && homeSlugs.length === 0) return 'text';
  return requested;
}

function resolveHomeCards(slugs: string[]) {
  const unique = [...new Set(slugs)].slice(0, 4);

  return unique
    .map((slug) => homes.find((home) => home.slug === slug && home.isActive !== false))
    .filter((home): home is NonNullable<typeof home> => Boolean(home))
    .map((home) => ({
      slug: home.slug,
      name: home.name,
      bedrooms: home.bedrooms,
      bathrooms: home.bathrooms,
      squareFeet: home.squareFeet,
      size: home.size,
      displayPrice: home.startingPrice != null
        ? `Starting at $${Math.round(home.startingPrice).toLocaleString()}`
        : 'Call/Text for price',
      image: home.gallery?.find((item) => item.isPrimary)?.src || home.gallery?.[0]?.src || home.images?.[0] || null,
      tagline: home.shortDescription?.slice(0, 120)
    }));
}

function extractOutputText(response: any): string {
  for (const item of response?.output || []) {
    if (item?.type !== 'message') continue;
    for (const content of item?.content || []) {
      if (content?.type === 'output_text' && typeof content?.text === 'string') {
        return content.text;
      }
    }
  }
  return '';
}

function fallbackAssistant(message: string): AssistantPayload {
  const query = message.toLowerCase();
  const directHome = homes.find((home) => {
    const name = home.name.toLowerCase();
    const model = (home.modelNumber || '').toLowerCase();
    return query.includes(name) || (model && query.includes(model));
  });

  if (directHome) {
    const specs = [
      directHome.bedrooms != null ? `${directHome.bedrooms} bed` : null,
      directHome.bathrooms != null ? `${directHome.bathrooms} bath` : null,
      directHome.squareFeet != null ? `${directHome.squareFeet.toLocaleString()} sq ft` : null,
      directHome.size || null
    ].filter(Boolean).join(', ');
    const price = directHome.startingPrice != null
      ? ` Its current EHS starting home price is $${Math.round(directHome.startingPrice).toLocaleString()}.`
      : ' Contact EHS for the current starting home price.';

    return {
      reply: `${directHome.name}${directHome.modelNumber ? ` (${directHome.modelNumber})` : ''} is listed as ${specs || 'a current EHS home model'}.${price} Final turnkey cost depends on the property, delivery/setup, site work, permits, utilities, selected options, and other project-specific items.`,
      actionType: 'homes',
      homeSlugs: [directHome.slug]
    };
  }

  return {
    reply: `I can help compare EHS homes, explain starting home prices versus turnkey project costs, discuss land and site-work questions, walk through financing options, or help plan a dealership visit. What would you like to figure out?`,
    actionType: 'text',
    homeSlugs: []
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    const history = normalizeHistory(body?.conversationHistory);

    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    if (message.length > 1600) {
      return NextResponse.json({
        success: true,
        reply: 'That message is a little too long for the website assistant. Please shorten it and I’ll help from there.',
        actionType: 'text',
        homes: []
      }, { headers: { 'Cache-Control': 'no-store' } });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('EHS chat is running without OPENAI_API_KEY; using safe catalog fallback.');
      const fallback = fallbackAssistant(message);
      return NextResponse.json({
        success: true,
        reply: fallback.reply,
        actionType: gateActionType(fallback.actionType, message, history, fallback.homeSlugs),
        homes: resolveHomeCards(fallback.homeSlugs)
      }, { headers: { 'Cache-Control': 'no-store' } });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 18000);

    try {
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: process.env.OPENAI_CHAT_MODEL || 'gpt-5.6-luna',
          store: false,
          reasoning: { effort: 'low' },
          max_output_tokens: 700,
          instructions: assistantInstructions,
          input: [
            ...history,
            { role: 'user', content: message }
          ],
          text: {
            format: {
              type: 'json_schema',
              name: 'ehs_chat_response',
              strict: true,
              schema: RESPONSE_SCHEMA
            }
          }
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorBody = (await response.text()).slice(0, 1200);
        console.error(`OpenAI EHS chat request failed (${response.status}):`, errorBody);
        const fallback = fallbackAssistant(message);
        return NextResponse.json({
          success: true,
          reply: fallback.reply,
          actionType: gateActionType(fallback.actionType, message, history, fallback.homeSlugs),
          homes: resolveHomeCards(fallback.homeSlugs)
        }, { headers: { 'Cache-Control': 'no-store' } });
      }

      const aiResponse = await response.json();
      const rawText = extractOutputText(aiResponse);
      const parsed = JSON.parse(rawText) as AssistantPayload;
      const requestedSlugs = Array.isArray(parsed.homeSlugs)
        ? parsed.homeSlugs.filter((slug): slug is string => typeof slug === 'string')
        : [];
      const cards = resolveHomeCards(requestedSlugs);
      const validSlugs = cards.map((home) => home.slug);
      const requestedAction: ChatAction = ['text', 'homes', 'lead_form', 'tour_booking', 'financing_info'].includes(parsed.actionType)
        ? parsed.actionType
        : 'text';
      const actionType = gateActionType(requestedAction, message, history, validSlugs);

      return NextResponse.json({
        success: true,
        reply: typeof parsed.reply === 'string' && parsed.reply.trim() ? parsed.reply.trim() : fallbackAssistant(message).reply,
        actionType,
        homes: cards
      }, { headers: { 'Cache-Control': 'no-store' } });
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    console.error('Easy HomeSource conversational assistant error:', error);
    return NextResponse.json({
      success: true,
      reply: `I’m having trouble answering that right now. You can still call or text the Easy HomeSource team at ${siteInfo.phoneDisplay}, or try your question again in a moment.`,
      actionType: 'text',
      homes: []
    }, { headers: { 'Cache-Control': 'no-store' } });
  }
}
