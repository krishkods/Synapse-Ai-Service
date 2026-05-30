import { proxyDeveloperRequest } from "@/lib/developer-proxy";

export async function PUT(
  request: Request,
  context: { params: Promise<{ memoryId: string }> }
) {
  const body = await request.json();
  const { memoryId } = await context.params;

  return proxyDeveloperRequest({
    request,
    path: `/memories/${memoryId}`,
    method: "PUT",
    operation: "update",
    body,
  });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ memoryId: string }> }
) {
  const body = await request.json();
  const { memoryId } = await context.params;

  return proxyDeveloperRequest({
    request,
    path: `/memories/${memoryId}`,
    method: "DELETE",
    operation: "delete",
    body,
  });
}
