import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

//Create a client with authentication required
// serverUrl MUST be the absolute Base44 backend, not a relative '/api'.
// The custom domain (buy2flip.net) serves the frontend but does NOT proxy
// /api/* to the Base44 backend (returns a CMS 404). Using an absolute URL
// routes SDK calls (login, me, entities, functions) directly to the backend,
// which has CORS '*' so browser calls from any origin succeed.
export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: 'https://base44.app',
  requiresAuth: false,
  // appBaseUrl is used by the SDK for auth redirects (loginWithProvider,
  // logout). When unset, the SDK defaults it to "" and builds a RELATIVE
  // /api/apps/auth/login URL — which the custom domain (buy2flip.net) does not
  // proxy, returning a CMS 404 on Google OAuth. Hardcode the absolute backend
  // so OAuth redirects go directly to base44.app, same as serverUrl.
  appBaseUrl: appBaseUrl || 'https://base44.app'
});