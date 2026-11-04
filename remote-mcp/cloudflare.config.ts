import {defineConfig} from 'cf/config';
import * as entrypoint from './src/worker.js' with {type:'cf-worker'};
export default defineConfig({accountId:'a16b2e898cd3854c34822b86c0dbc42c',worker:{name:'hcai-blog-mcp',entrypoint,compatibilityDate:'2026-11-04',compatibilityFlags:['nodejs_compat'],observability:{enabled:true,traces:{enabled:true}}}});
