import {parsePost,sourceHash,slugSchema,prepareArticle} from './content.js';
export const REPO='WangYa-Technology/hcai-blog';
export const BRANCH='main';
export const SITE='https://wangya-technology.github.io/hcai-blog/';
const base=`https://api.github.com/repos/${REPO}`;
export class GitHubRepository{
 constructor(token,fetcher=fetch){this.token=token;this.fetcher=fetcher;}
 async api(endpoint,{method='GET',body,optional=false}={}){
  const fetcher=this.fetcher;
  const r=await fetcher(base+endpoint,{method,headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'hcai-blog-mcp',...(this.token?{Authorization:`Bearer ${this.token}`}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(20000)});
  if(optional&&r.status===404)return null;
  if(!r.ok){if(r.status===401||r.status===403)throw new Error('GitHub authorization failed. Check the server GitHub token, repository permissions, organization approval and expiry.');if(r.status===409||r.status===422)throw new Error('GitHub rejected this update (conflict or branch policy). Read the latest repository head and article, then retry without overwriting concurrent edits.');throw new Error(`GitHub request failed (${r.status}).`);}
  return r.status===204?null:r.json();
 }
 async head(){const ref=await this.api(`/git/ref/heads/${BRANCH}`);return ref.object.sha;}
 async info(){return {repository:REPO,branch:BRANCH,headSha:await this.head(),site:SITE,translationLanguages:['zh','en','ru','ja','ko'],publishing:'save_article commits the complete five-language article to main; GitHub Actions publishes it.'};}
 async file(file,ref){const item=await this.api(`/contents/${file}?ref=${encodeURIComponent(ref)}`,{optional:true});if(!item)return null;if(item.type!=='file'||item.encoding!=='base64'||item.size>1800000)throw new Error('Unsupported repository content');const bytes=Uint8Array.from(atob(item.content.replace(/\s/g,'')),c=>c.charCodeAt(0));return {text:new TextDecoder().decode(bytes),sha:item.sha};}
 async read(slug,ref){slugSchema.parse(slug);ref=ref||await this.head();const file=await this.file(`content/posts/${slug}.md`,ref);if(!file)throw new Error('Article not found');const post=parsePost(file.text);const bundle=await this.file(`content/translations/${slug}.json`,ref);const parsed=bundle?JSON.parse(bundle.text):null;return {slug,headSha:ref,articleSha:file.sha,...post,sourceHash:sourceHash(post),translations:parsed?.translations||null,translationStatus:parsed?.sourceHash===sourceHash(post)?'complete':'translation_required'};}
 async list(){const headSha=await this.head();const entries=await this.api(`/contents/content/posts?ref=${headSha}`);if(!Array.isArray(entries))throw new Error('Article directory unavailable');return {headSha,articles:entries.filter(f=>f.type==='file'&&f.name.endsWith('.md')).map(f=>({slug:f.name.slice(0,-3),articleSha:f.sha})),nextStep:'Use read_post to load the full article and translations.'};}
 async save({slug,post,translations,publish=false,expectedHeadSha}){
  if(!this.token)throw new Error('Publishing not configured: server GITHUB_TOKEN is missing.');
  const article=prepareArticle(slug,post,translations,publish);
  const headSha=await this.head();if(headSha!==expectedHeadSha)throw new Error('Repository changed. Read repository_info and read_post again, merge any concurrent edits, then retry with the new headSha.');
  const parent=await this.api(`/git/commits/${headSha}`);
  const tree=await this.api('/git/trees',{method:'POST',body:{base_tree:parent.tree.sha,tree:article.files.map(f=>({path:f.path,mode:'100644',type:'blob',content:f.content}))}});
  const commit=await this.api('/git/commits',{method:'POST',body:{message:`${publish?'Publish':'Save draft'}: ${article.post.title} (five languages)`,tree:tree.sha,parents:[headSha]}});
  await this.api(`/git/refs/heads/${BRANCH}`,{method:'PATCH',body:{sha:commit.sha,force:false}});
  return {slug,published:publish,commitSha:commit.sha,commitUrl:`https://github.com/${REPO}/commit/${commit.sha}`,languages:['zh','en','ru','ja','ko'],articleUrl:publish?`${SITE}posts/${slug}.html`:null,actionsUrl:`https://github.com/${REPO}/actions`,note:publish?'Commit saved. Deployment is asynchronous; check deployment_status.':'Draft saved in GitHub, excluded from the public site.'};
 }
 async deployments(commitSha){const query=commitSha?`&head_sha=${encodeURIComponent(commitSha)}`:'';const data=await this.api(`/actions/workflows/pages.yml/runs?per_page=5${query}`);return {site:SITE,runs:data.workflow_runs.map(r=>({id:r.id,commitSha:r.head_sha,status:r.status,conclusion:r.conclusion,url:r.html_url}))};}
}
