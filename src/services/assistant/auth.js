import { NextResponse } from "next/server";

export function getAssistantToken() {
  return process.env.ASSISTANT_API_TOKEN || process.env.AUTH_SECRET || "";
}

export function isAssistantAuthorized(request) {
  const expected = getAssistantToken();
  const provided = request.headers.get("x-assistant-token");

  return Boolean(expected && provided && expected === provided);
}

export function getAssistantIdentity(request) {
  return request.headers.get("x-assistant-name") || "assistant";
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized assistant request" }, { status: 401 });
}

/**
 * @param {string} message
 * @param {unknown} [details]
 */
export function badRequest(message, details = undefined) {
  return NextResponse.json({ error: message, details }, { status: 400 });
}
