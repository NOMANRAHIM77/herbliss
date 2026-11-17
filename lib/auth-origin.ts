const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);
const localBindHosts = new Set([...localHosts, "0.0.0.0", "[::]"]);

export function isAllowedAuthOrigin(
  request: Request,
  appUrl: string,
  development: boolean,
) {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  if (origin === new URL(appUrl).origin) return true;
  // Render receives the storefront's original browser Origin through the rewrite.
  if (process.env.RENDER === "true") return false;
  const requestUrl = new URL(request.url);
  if (origin === requestUrl.origin) return true;

  // Next can normalize the request hostname differently from the browser.
  if (!development) return false;
  try {
    const browserUrl = new URL(origin);
    return (
      origin === browserUrl.origin &&
      browserUrl.protocol === "http:" &&
      localHosts.has(browserUrl.hostname) &&
      ((localBindHosts.has(requestUrl.hostname) &&
        browserUrl.port === requestUrl.port) ||
        browserUrl.host === request.headers.get("host"))
    );
  } catch {
    return false;
  }
}
