import { serve } from 'srvx'

import server from './dist/server/server.js'

/**
 * Point d'entree de production : le build TanStack Start ne produit qu'un
 * handler `fetch`, srvx le sert en HTTP sur le port que Render (ou tout autre
 * hote) met a disposition dans PORT.
 */
const port = Number(process.env.PORT) || 3000
const hostname = process.env.HOST || '0.0.0.0'

serve({
  port,
  hostname,
  fetch: server.fetch,
  onListen({ hostname: host, port: exposed }) {
    console.log(`Finance App sur http://${host}:${exposed}`)
  },
})