# Synapse Web

Synapse Web is the frontend portal for your Synapse AI service. It includes:

- Landing page and product overview
- JWT-based authentication with MongoDB / Mongoose user storage
- Developer documentation and AI service proxy integration
- Direct LLM chat support for OpenAI, Claude, Ollama, Hugging Face, local memory, and custom models
- Dashboard for authenticated users to query the Synapse AI backend

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Configure `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017/synapse-web
JWT_SECRET=replace_with_a_strong_secret
SYNAPSE_AI_SERVICE_URL=http://localhost:8000
```

4. Run the development server:

```bash
npm run dev
```

5. Open the app in your browser:

```bash
http://localhost:3000
```

## App structure

- `app/page.tsx` - landing page for the web portal
- `app/login/page.tsx` - login page
- `app/register/page.tsx` - registration page
- `app/dashboard/page.tsx` - authenticated dashboard with AI query integration
- `app/docs/page.tsx` - Synapse documentation and integration guide
- `app/api/auth/*` - auth API routes using Mongoose and JWT
- `app/api/ai/proxy/route.ts` - proxies AI queries to the Synapse AI service
- `models/User.ts` - user schema and model
- `lib/mongoose.ts` - persistent Mongoose connection helper
- `lib/auth.ts` - JWT signing and verification utilities

## API usage

### Register a new user

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"secret"}'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret"}'
```

### Verify current session

```bash
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/auth/me
```

### Proxy AI queries

```bash
curl -X POST http://localhost:3000/api/ai/proxy \
  -H "Content-Type: application/json" \
  -d '{"query":"Explain how Synapse works","user_id":"<user-id>"}'
```

### Direct LLM chat

```bash
curl -X POST http://localhost:3000/api/ai/llm \
  -H "Content-Type: application/json" \
  -d '{"provider":"openai","prompt":"Summarize my current project goals.","use_memory":true,"top_k":5,"model":"gpt-4o-mini"}'
```

### LLM provider environment variables

```env
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
OLLAMA_API_BASE=http://localhost:11434
HUGGINGFACE_API_KEY=your-hf-key
HUGGINGFACE_API_BASE=https://api-inference.huggingface.co/models
```

## Integrating with Synapse AI service

Set `SYNAPSE_AI_SERVICE_URL` to the URL of your Synapse AI backend. The dashboard sends queries through the proxy route,
so your web app and AI service can stay separated by host and port.

## Next steps

- Connect a real MongoDB instance
- Add a production JWT secret
- Extend the dashboard with user memory and personalization
- Add analytics on top of the AI query proxy
