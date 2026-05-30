import { proxyDeveloperRequest } from "@/lib/developer-proxy";

export async function POST(request: Request) {
  const body = await request.json();

  return proxyDeveloperRequest({
    request,
    path: "/ingest",
    method: "POST",
    operation: "ingest",
    body,
  });
}
