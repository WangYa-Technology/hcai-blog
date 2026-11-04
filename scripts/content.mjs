import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { z } from 'zod';
export const root = path.resolve(import.meta.dirname,'..');
export const postsDir = path.join(root,'content/posts');
export const schema = z.object({title:z.string().min(1).max(160),description:z.string().min(1).max(300),category:z.enum(['news','tutorial','skills','prompts']),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>!isNaN(Date.parse(v)),'Invalid date'),tags:z.array(z.string().max(40)).max(8).default([]),featured:z.boolean().default(false),draft:z.boolean().default(true),source:z.string().url().optional()});
export function safeSlug(slug){if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||slug.length>100)throw new Error('slug must be lowercase letters, numbers and hyphens');return slug;}
export async function readPosts(includeDrafts=false){const files=await fs.readdir(postsDir);const posts=await Promise.all(files.filter(f=>f.endsWith('.md')).map(async f=>{const {data,content}=matter(await fs.readFile(path.join(postsDir,f),'utf8'));return {...schema.parse(data),slug:safeSlug(f.slice(0,-3)),body:content};}));return posts.filter(p=>includeDrafts||!p.draft).sort((a,b)=>b.date.localeCompare(a.date)||a.slug.localeCompare(b.slug));}
export async function writePost({slug,body,...data}){safeSlug(slug);const parsed=schema.parse(data);await fs.mkdir(postsDir,{recursive:true});const target=path.join(postsDir,slug+'.md');const temporary=target+'.tmp';await fs.writeFile(temporary,matter.stringify(body,parsed));await fs.rename(temporary,target);return {slug,...parsed};}
