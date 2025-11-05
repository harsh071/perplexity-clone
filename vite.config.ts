import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

// Load .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Vite plugin to handle API routes
function apiPlugin() {
  return {
    name: 'api-routes',
    configureServer(server) {
      // Ensure environment variables are loaded
      const env = loadEnv(server.config.mode, process.cwd(), '');
      
      // Map of route paths to module paths
      const routeMap: Record<string, string> = {
        '/api/chat': resolve(__dirname, 'api/chat/index.ts'),
        '/api/search': resolve(__dirname, 'api/search/index.ts'),
        '/api/news': resolve(__dirname, 'api/news/index.ts'),
      };
      
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/')) {
          try {
            // Find matching route
            const route = Object.keys(routeMap).find(route => req.url?.startsWith(route));
            if (!route) {
              next();
              return;
            }

            const modulePath = routeMap[route];
            
            // Use relative path from project root for Vite to handle TypeScript
            const relativePath = './' + modulePath.replace(process.cwd() + '/', '');
            console.log('Loading API handler:', { route, modulePath, relativePath });
            
            let module;
            try {
              // Vite will handle TypeScript compilation
              module = await import(relativePath);
            } catch (importError: any) {
              console.error('Failed to import API handler:', {
                modulePath,
                relativePath,
                route,
                error: importError.message,
                stack: importError.stack
              });
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ 
                error: 'Failed to load API handler',
                message: importError.message,
                details: process.env.NODE_ENV === 'development' ? importError.stack : undefined
              }));
              return;
            }
            
            const handler = module.default;
            
            if (!handler || typeof handler !== 'function') {
              throw new Error(`Handler is not a function: ${modulePath}`);
            }

            // Convert Node.js request to Web Request API
            const body = req.method !== 'GET' && req.method !== 'HEAD' 
              ? await new Promise<string>((resolve, reject) => {
                  let data = '';
                  req.on('data', chunk => data += chunk);
                  req.on('end', () => resolve(data));
                  req.on('error', reject);
                })
              : '';

            const headers = new Headers();
            Object.entries(req.headers).forEach(([key, value]) => {
              if (value) {
                headers.set(key, Array.isArray(value) ? value.join(', ') : value);
              }
            });

            const url = `http://${req.headers.host}${req.url}`;
            const request = new Request(url, {
              method: req.method,
              headers,
              body: body || undefined
            });

            const response = await handler(request);

            // Convert Web Response to Node.js response
            res.statusCode = response.status;
            response.headers.forEach((value, key) => {
              res.setHeader(key, value);
            });

            const responseBody = await response.text();
            res.end(responseBody);
          } catch (error: any) {
            console.error('API route error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
              error: 'Internal server error',
              message: error.message 
            }));
          }
        } else {
          next();
        }
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), apiPlugin()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
