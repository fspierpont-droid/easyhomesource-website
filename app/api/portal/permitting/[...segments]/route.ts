import { permanentApiRequest } from '@/lib/auth/permanentApi';
import { authenticatedPortalUser } from '@/lib/auth/portalSession';
import { canAccessAmhi } from '@/data/teamMembers';

interface RouteContext {
  params: { segments: string[] };
}

async function proxy(request: Request, context: RouteContext, method: string) {
  const user = await authenticatedPortalUser(request);
  if (!user) {
    return Response.json({ error: 'Authentication required.' }, { status: 401 });
  }
  if (!canAccessAmhi(user)) {
    return Response.json({ error: 'AMHI permitting access required.' }, { status: 403 });
  }

  const { segments } = context.params;
  const suffix = (segments || []).map(encodeURIComponent).join('/');
  const path = `/api/permitting/${suffix}`;
  const init: RequestInit = { method };

  if (!['GET', 'HEAD'].includes(method)) {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      init.body = await request.formData();
    } else if (method !== 'DELETE') {
      const text = await request.text();
      if (text) init.body = text;
    }
  }

  const backend = await permanentApiRequest(request, path, init);
  const headers = new Headers();
  const contentType = backend.headers.get('content-type');
  const disposition = backend.headers.get('content-disposition');
  if (contentType) headers.set('Content-Type', contentType);
  if (disposition) headers.set('Content-Disposition', disposition);
  headers.set('Cache-Control', 'no-store');

  return new Response(backend.body, { status: backend.status, headers });
}

export async function GET(request: Request, context: RouteContext) {
  return proxy(request, context, 'GET');
}

export async function POST(request: Request, context: RouteContext) {
  return proxy(request, context, 'POST');
}

export async function PATCH(request: Request, context: RouteContext) {
  return proxy(request, context, 'PATCH');
}

export async function DELETE(request: Request, context: RouteContext) {
  return proxy(request, context, 'DELETE');
}
