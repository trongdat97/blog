export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);

    // Chỉ thêm Link headers cho HTML responses
    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('text/html')) {
      return response;
    }

    const headers = new Headers(response.headers);
    // RFC 8288 Link headers cho agent discovery
    headers.append('Link', '</rss.xml>; rel="alternate"; type="application/rss+xml"; title="Blog RSS Feed"');
    headers.append('Link', '</sitemap-index.xml>; rel="sitemap"; type="application/xml"');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
