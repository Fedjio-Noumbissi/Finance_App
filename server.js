import { fileURLToPath } from 'node:url'

import { serve } from 'srvx'
import { serveStatic } from 'srvx/static'

import server from './dist/server/server.js'

/**
 * Point d'entree de production : le build TanStack Start ne produit qu'un
 * handler `fetch`, srvx le sert en HTTP sur le port que Render (ou tout autre
 * hote) met a disposition dans PORT.
 *
 * `serveStatic` expose d'abord dist/client (CSS, JS, favicon) : le handler
 * SSR n'est sollicite que pour les routes, les chemins inconnus passent outre.
 */
const racineClient = fileURLToPath(new URL('./dist/client/', import.meta.url))
const port = Number(process.env.PORT) || 3000
const hostname = process.env.HOST || '0.0.0.0'

serve({
  port,
  hostname,
  middleware: [serveStatic({ dir: racineClient })],
  fetch: server.fetch,
  onListen({ hostname: host, port: exposed }) {
    console.log(`Finance App sur http://${host}:${exposed}`)
  },
})