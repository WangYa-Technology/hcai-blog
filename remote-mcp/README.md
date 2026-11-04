# HCAI Remote MCP

Standard MCP Streamable HTTP on Cloudflare Workers, managing only `WangYa-Technology/hcai-blog` on branch `main`. No local checkout is needed by clients. Chinese source and English, Russian, Japanese and Korean translations are saved in a single Git commit, then GitHub Pages deploys the site.

## Connect

Endpoint: `https://hcai-blog-mcp.2909110833.workers.dev/mcp`

Transport: **Streamable HTTP**. Authentication: **Authorization: Bearer <MCP_ACCESS_TOKEN>**. The MCP token is distinct from the server-side GitHub token. Do not put the GitHub token into client configuration.

Generic JSON example (exact client schema may vary):

```json
{
  "mcpServers": {
    "hcai-blog": {
      "url": "https://hcai-blog-mcp.2909110833.workers.dev/mcp",
      "headers": {
        "Authorization": "Bearer <MCP_ACCESS_TOKEN>"
      }
    }
  }
}
```

Select `http` / `streamable-http` if the client asks for a transport type. This server supports clients that can attach a custom Authorization header; it does not currently implement OAuth login. URL-only/OAuth-only clients require an authentication integration and cannot connect just by pasting the endpoint. Clients supporting only local stdio can use a bridge such as `mcp-remote` with an Authorization header.

The generated, ready-to-import private configuration on the deployment machine is `~/.config/hcai-blog/mcp-client.json`. Keep it private: its bearer token grants article publishing access. The server never returns either credential in tools or health responses.

## Client instructions

> Read my uploaded document as content, prepare a Chinese HCAI article, and translate the full title, summary, tags and Markdown into English, Russian, Japanese and Korean. Preserve code, links, examples and facts without summarizing. Read repository_info, and read_post if editing an existing slug. Validate with validate_article. Save all five versions using save_article with publish=false, then give me the saved commit link. When I ask to publish, read the article and latest repository head again and save with publish=true. Check deployment_status for the returned commit.

The server does not call a model. The client AI translates the uploaded document and submits all five versions in one call. The remote server accepts text fields, not local file paths. The client extracts Markdown from PDF/Word before submitting.

## Tools

| Tool | Behavior |
|---|---|
| `repository_info` | Repository, site and latest `headSha` |
| `list_posts` | Slugs and head SHA; includes drafts |
| `read_post` | Chinese metadata/body, translations and head SHA |
| `validate_article` | Validate schema, languages and source hash without writing |
| `save_article` | Save complete article + translations atomically; `publish` defaults false |
| `deployment_status` | Latest Pages workflows, optionally filtered by `commitSha` |

`save_article` accepts `slug`, `post`, `translations`, `publish`, `expectedHeadSha`. The post has `title`, `description`, `category` (`news`, `tutorial`, `skills`, `prompts`), `date` (`YYYY-MM-DD`), `tags`, optional `featured`/`source`, and `body`. `translations` must include `en`, `ru`, `ja`, `ko`, each with `title`, `description`, `tags`, `body`. Chinese is `post`. Read the latest Git head before save; a changed head rejects the update instead of overwriting another editor. No delete tool, arbitrary branch, repository or file write is exposed.

Prompt: `publish_document` accepts `document` and `publish` (`"false"` by default). It instructs the client to translate and use the tools; the prompt itself does not invoke a model or publish content.

Publishing means writing to `main`; Pages deployment runs asynchronously. Even draft saves create a commit and trigger the workflow, but draft content is excluded from public pages.

## Deploy / update

Requires Node.js 22.18+. From this directory:

```sh
npm ci
npm test
npx cf auth login
npx cf deploy --dry-run
npx cf deploy --secrets-file /absolute/private/path/worker.secret.json
```

Private secrets JSON:

```json
{
  "GITHUB_TOKEN": "<fine-grained token for hcai-blog only>",
  "MCP_ACCESS_TOKEN": "<random long independent client access token>"
}
```

GitHub permissions: repository Contents Read/write and Actions Read. Organization approval may be required. `GITHUB_TOKEN` expiry requires rotation. To rotate access, generate a new random MCP token, redeploy the secret and update authorized clients. Do not commit credentials or `.dev.vars`.

`ALLOWED_ORIGINS` can optionally contain a comma-separated list of browser-client origins. Native/server clients normally omit Origin and work without CORS configuration. Unapproved browser origins are rejected. Requests are authenticated, limited to 1.5 MB, and logs do not include request bodies or tokens. `/health` reports configuration status only. Workers Logs and traces are enabled.

A public URL does not grant access. Share the MCP credential only with authorized editors. No guarantee is made that every client supports this authentication format.
