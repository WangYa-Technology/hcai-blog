import {z} from 'zod';
import {parse as parseYaml} from 'yaml';
import {createHash} from 'node:crypto';
export const slugSchema=z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100);
export const shaSchema=z.string().regex(/^[a-f0-9]{40}$/);
export const postSchema=z.object({title:z.string().min(1).max(160),description:z.string().min(1).max(300),category:z.enum(['news','tutorial','skills','prompts']),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>!isNaN(Date.parse(v)),'Invalid date'),tags:z.array(z.string().max(40)).max(8).default([]),featured:z.boolean().default(false),source:z.string().url().optional(),body:z.string().min(1).max(100000)}).strict();
const translation=z.object({title:z.string().min(1).max(300),description:z.string().min(1).max(600),tags:z.array(z.string().max(100)).max(8),body:z.string().min(1).max(200000)}).strict();
export const translationsSchema=z.object({en:translation,ru:translation,ja:translation,ko:translation}).strict();
export const sourceHash=p=>createHash('sha256').update(JSON.stringify([p.title,p.description,p.tags,p.body])).digest('hex');
export function parsePost(text){const match=text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);if(!match)throw new Error('Invalid article frontmatter');const {draft=true,...data}=parseYaml(match[1]);return {...postSchema.parse({...data,body:text.slice(match[0].length)}),draft:z.boolean().parse(draft)};}
export function prepareArticle(slug,post,translations,publish){slugSchema.parse(slug);post=postSchema.parse(post);translations=translationsSchema.parse(translations); // End with a newline so gray-matter and the remote reader hash identical bytes.
post={...post,body:post.body.replace(/\r\n/g,'\n').replace(/\n*$/,'\n')};
const {body,...metadata}=post;
const markdown=`---\n${JSON.stringify({...metadata,draft:!publish},null,2)}\n---\n${body}`;
const parsed=parsePost(markdown);
return {slug,post:parsed,sourceHash:sourceHash(parsed),files:[{path:`content/posts/${slug}.md`,content:markdown},{path:`content/translations/${slug}.json`,content:JSON.stringify({sourceHash:sourceHash(parsed),translations},null,2)+'\n'}]};}
