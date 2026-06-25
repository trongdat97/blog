const SITE_NAME = 'Blog cá nhân';
const SITE_DESC = 'Blog về DevOps, Kubernetes, CI/CD và Cloud';

function jsonResponse(data, contentType = 'application/json') {
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname, origin } = url;

    // ── API Catalog (RFC 9727) ──────────────────────────────────────────────
    if (pathname === '/.well-known/api-catalog') {
      return jsonResponse({
        linkset: [
          {
            anchor: `${origin}/`,
            alternate: [
              { href: `${origin}/rss.xml`, type: 'application/rss+xml', title: `${SITE_NAME} RSS Feed` },
            ],
            describedby: [
              { href: `${origin}/sitemap-index.xml`, type: 'application/xml' },
            ],
          },
        ],
      }, 'application/linkset+json');
    }

    // ── Agent Skills Discovery ──────────────────────────────────────────────
    if (pathname === '/.well-known/agent-skills/index.json') {
      return jsonResponse({
        $schema: 'https://agentskills.io/schema/v0.2.0/index.schema.json',
        skills: [
          {
            name: 'link-headers',
            type: 'discovery',
            description: 'RFC 8288 Link headers trên tất cả HTML responses',
            url: '/.well-known/agent-skills/link-headers/SKILL.md',
          },
          {
            name: 'api-catalog',
            type: 'discovery',
            description: 'RFC 9727 API Catalog với RSS feed và sitemap',
            url: '/.well-known/agent-skills/api-catalog/SKILL.md',
          },
          {
            name: 'markdown-negotiation',
            type: 'content',
            description: 'Trả về Markdown khi Accept: text/markdown cho bài viết',
            url: '/.well-known/agent-skills/markdown-negotiation/SKILL.md',
          },
          {
            name: 'mcp-server-card',
            type: 'discovery',
            description: 'MCP Server Card tại /.well-known/mcp/server-card.json',
            url: '/.well-known/agent-skills/mcp-server-card/SKILL.md',
          },
        ],
      });
    }

    // ── MCP Server Card ─────────────────────────────────────────────────────
    if (pathname === '/.well-known/mcp/server-card.json') {
      return jsonResponse({
        serverInfo: { name: 'personal-blog', version: '1.0.0', description: SITE_DESC },
        transport: { type: 'http', endpoint: origin },
        capabilities: {
          resources: [
            { uri: `${origin}/rss.xml`, name: `${SITE_NAME} RSS Feed`, mimeType: 'application/rss+xml' },
            { uri: `${origin}/sitemap-index.xml`, name: 'Sitemap', mimeType: 'application/xml' },
          ],
        },
      });
    }

    // ── Markdown for Agents ─────────────────────────────────────────────────
    // Khi agent gửi Accept: text/markdown cho trang bài viết, serve nội dung raw markdown
    const accept = request.headers.get('accept') ?? '';
    if (accept.includes('text/markdown') && /^\/blog\/[^/]+\/?$/.test(pathname)) {
      const slug = pathname.replace(/^\/blog\//, '').replace(/\/$/, '');
      const mdResponse = await env.ASSETS.fetch(
        new Request(new URL(`/blog-md/${slug}`, origin).toString())
      );
      if (mdResponse.ok) {
        return new Response(mdResponse.body, {
          status: 200,
          headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'Vary': 'Accept',
          },
        });
      }
    }

    // ── Serve static assets ─────────────────────────────────────────────────
    const response = await env.ASSETS.fetch(request);
    const contentType = response.headers.get('content-type') ?? '';

    if (!contentType.includes('text/html')) {
      return response;
    }

    const headers = new Headers(response.headers);
    // RFC 8288 Link headers for agent discovery
    headers.append('Link', `</.well-known/api-catalog>; rel="api-catalog"`);
    headers.append('Link', `</rss.xml>; rel="alternate"; type="application/rss+xml"; title="${SITE_NAME} RSS Feed"`);
    headers.append('Link', `</sitemap-index.xml>; rel="sitemap"; type="application/xml"`);
    headers.set('Vary', 'Accept');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
