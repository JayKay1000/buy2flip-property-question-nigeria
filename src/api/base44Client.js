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
  appBaseUrl
});