import { defineConfig } from 'vite';
export default defineConfig({root:'dist',build:{outDir:'../preview-build'},server:{fs:{strict:true}}});
