import { NextResponse } from 'next/server';
import { homes } from '@/data/homes';
import { siteInfo } from '@/data/site';
import { runEhsSalesAgent, type ConversationItem } from '@/lib/chat/ehsSalesAgent';

type RateEntry = { count: number; resetAt: number };
const globalChatState = globalThis as typeof globalThis & {
  __ehsChatRateLimit?: Map<string, RateEntry>;
};
const chatRateLimit = globalChatState.__ehsChatRateLimit ?? new Map<string, RateEntry>();
globalChatState.__ehsChatRateLimit = chatRateLimit;

const MAX_MESSAGE_LENGTH = 2000;

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
    tagline: home.shortDescription
      ? `${home.shortDescription.slice(0, 110)}${home.shortDescription.length > 110 ? '…' : ''}`
      : undefined,
  };
}

function resolveHomes(slugs: string[]) {
  const unique = [...new Set(slugs)].slice(0, 4);
  const bySlug = new Map(homes.map((home) => [home.slug, home]));
  return unique
    .map((slug) => bySlug.get(slug))
    .filter((home): home is (typeof homes)[number] => Boolean(home));
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
        { status: 429 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const message = typeof body?.message === 'string'
      ? body.message.trim().slice(0, MAX_MESSAGE_LENGTH)
      : '';

    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const history: ConversationItem[] = Array.isArray(body?.conversationHistory)
      ? body.conversationHistory
      : [];

    const agentResult = await runEhsSalesAgent(message, history);
    const matchedHomes = resolveHomes(agentResult.homeSlugs);

    console.info('EHS AI sales agent turn completed', {
      model: agentResult.model,
      steps: agentResult.steps,
      actionType: agentResult.actionType,
      homeCount: matchedHomes.length,
    });

    return NextResponse.json({
      success: true,
      reply: agentResult.reply,
      actionType: agentResult.actionType,
      homes: matchedHomes.map(toRecommendedHome),
      aiEnabled: true,
      agentMode: 'tool-loop',
      aiProvider: 'vercel-ai-gateway',
      aiModel: agentResult.model,
      agentSteps: agentResult.steps,
    });
  } catch (error) {
    console.error('Easy HomeSource AI sales agent unavailable:', error);

    return NextResponse.json(
      {
        success: false,
        reply: `The Easy HomeSource AI agent is temporarily unavailable, so I don't want to give you a canned or guessed answer. You can call or text the Brooksville team at ${siteInfo.phoneDisplay}, or try the chat again in a moment.`,
        actionType: 'text',
        homes: [],
        aiEnabled: false,
        agentMode: 'offline',
        aiProvider: null,
        aiModel: null,
        agentSteps: 0,
      },
      { status: 200 },
    );
  }
}
