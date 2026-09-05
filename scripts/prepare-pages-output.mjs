import { cp, mkdir, rm } from 'node:fs/promises';

// Retain the output directory used by the existing Cloudflare Pages project.
const output = new URL('../.vercel/output/static/', import.meta.url);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(new URL('../out/', import.meta.url), output, { recursive: true });
console.log('Cloudflare Pages output: .vercel/output/static');
