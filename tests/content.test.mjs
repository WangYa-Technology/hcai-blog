import test from 'node:test';
import assert from 'node:assert/strict';
import {safeSlug,schema,readPosts} from '../scripts/content.mjs';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
test('reject path traversal and invalid categories',()=>{for(const slug of ['../secret','a/b','A','..'])assert.throws(()=>safeSlug(slug));assert.equal(safeSlug('my-article'),'my-article');assert.equal(schema.safeParse({category:'invalid'}).success,false);});
test('published content excludes drafts',async()=>{const posts=await readPosts();assert.ok(posts.length>0);assert.ok(posts.every(p=>!p.draft));});
test('MCP client discovers tools and reads real content',async()=>{const client=new Client({name:'test-client',version:'1.0.0'});try{await client.connect(new StdioClientTransport({command:process.execPath,args:['mcp/server.mjs']}));const {tools}=await client.listTools();for(const name of ['build_site','list_posts','read_post','save_post','translation_status','save_translations','read_translation_source','import_document'])assert.ok(tools.some(t=>t.name===name));const res=await client.callTool({name:'read_post',arguments:{slug:'ai-workflow'}});assert.equal(JSON.parse(res.content[0].text).slug,'ai-workflow');const bad=await client.callTool({name:'read_post',arguments:{slug:'../secret'}});assert.equal(bad.isError,true);}finally{await client.close();}});
