# Sales Analyzer — UI Agent

## Role
You are the **UI Agent**. You own everything inside `sales_analyzer_ui/`. Do not touch `sales_analyzer_api/`.

## Tech Stack
- **Framework**: Next.js 14 App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS (utility classes only, no extra UI libraries)
- **Auth**: httpOnly cookie (`auth_token`) — token never touches browser JS

## Project Structure
```
app/
  api/
    auth/
      login/route.ts      — forward to Go, set httpOnly cookie
      register/route.ts   — forward to Go, set httpOnly cookie
      logout/route.ts     — clear cookie
      me/route.ts         — decode JWT payload for UI hydration
    proxy/[...path]/
      route.ts            — catch-all proxy → Go API with Authorization header
  layout.tsx              — AuthProvider + NavBar
  page.tsx                — home dashboard
  login/page.tsx
  register/page.tsx
  search/page.tsx         — uses useSSE
  ranking/page.tsx        — uses useSSE
  insights/page.tsx       — uses useSSE
  products/[id]/page.tsx  — uses useSSE
components/
  AuthGuard.tsx           — redirect to /login if not authenticated
  NavBar.tsx              — shows user name + logout
  SSELoader.tsx           — spinner + progress message
lib/
  api.ts                  — fetch wrappers (regular, non-SSE)
  auth-context.tsx        — AuthProvider, useAuth() hook
  types.ts                — TypeScript interfaces
  useSSE.ts               — EventSource hook
```

## Environment Variables
```
API_URL=http://localhost:8080        ← server-side only (proxy)
NEXT_PUBLIC_API_URL not needed       ← all calls go through proxy
```

## Coding Rules
- Always read a file before editing
- `npm run build` must pass after every change
- Token lives in httpOnly cookie only — never in JS, localStorage, or response body
- All API calls from pages go to `/api/proxy/api/...` (not directly to Go)
- Auth endpoints go to `/api/auth/...` (Next.js route handlers)
- Use `useSSE<T>()` hook for slow AI endpoints, `apiFetch` for fast ones
- `EventSource` sends same-origin cookies automatically — no extra auth needed
- Show `<SSELoader message={progress} />` while SSE is loading
- Handle 401 from proxy: redirect to `/login`
- `npm run build` must pass with zero TypeScript errors

## Auth Flow
```
Login → POST /api/auth/login → Next.js sets httpOnly cookie → returns {user}
Page load → GET /api/auth/me → decode cookie JWT → returns {user}
API call → /api/proxy/api/... → Next.js reads cookie → adds Bearer header → Go API
Logout → POST /api/auth/logout → Next.js clears cookie
```

## SSE Pattern
```tsx
const sse = useSSE<ResultType>()

// trigger on button click or mount
sse.start('/api/proxy/api/products/search/stream?q=...')

// render
if (sse.loading) return <SSELoader message={sse.progress} />
if (sse.error)   return <ErrorMessage message={sse.error} />
if (sse.data)    return <ResultComponent data={sse.data} />
```

## API Proxy Path Mapping
```
/api/proxy/api/products/search/stream?q=   → Go GET /api/products/search/stream
/api/proxy/api/products/ranking/stream     → Go GET /api/products/ranking/stream
/api/proxy/api/insights/stream             → Go GET /api/insights/stream
/api/proxy/api/products/:id/summary/stream → Go GET /api/products/:id/summary/stream
/api/proxy/api/products/:id/similar/stream → Go GET /api/products/:id/similar/stream
```
