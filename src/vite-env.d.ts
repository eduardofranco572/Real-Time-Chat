/// <reference types="vite/client" />
declare module 'fastify-multipart';

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}