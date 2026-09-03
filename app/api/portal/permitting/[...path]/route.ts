import { NextResponse } from 'next/server';
import { permanentApiRequest } from '@/lib/auth/permanentApi';

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function forward(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const sourceUrl = new URL(request.url);
  const backendPath =
    `/api/permitting/${path.map((segment) => encodeURIComponent(segment)).join('/')}${sourceUrl.search}`;

  const method = request.method.toUpperCase();
  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('Content-Type', contentType);

  const init: RequestInit = { method, headers };
  if (!['GET', 'HEAD'].includes(method)) {
    init.body = await request.arrayBuffer();
  }

  const backend = await permanentApiRequest(request, backendPath, init);
  const responseHeaders = new Headers();
  for (const name of ['content-type', 'content-disposition', 'content-length']) {
    const value = backend.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }

  return new NextResponse(backend.body, {
    status: backend.status,
    headers: responseHeaders,
  });
}

export async function GET(request: Request, context: RouteContext) {
  return forward(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return forward(request, context);
}

export async function PATCH(request: Request, context: RouteContext) {
  return forward(request, context);
}

export async function DELETE(request: Request, context: RouteContext) {
  return forward(request, context);
}
