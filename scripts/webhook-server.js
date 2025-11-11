#!/usr/bin/env node

/**
 * Webhook server pour déploiement automatique sur NAS
 * À installer sur le NAS en tant que service systemd ou tâche planifiée
 * 
 * Installation sur NAS:
 * 1. Copier ce fichier: /volume1/docker/batala-vitrine/webhook-server.js
 * 2. chmod +x webhook-server.js
 * 3. Créer service ou lancer: node webhook-server.js
 */

import http from 'http';
import { spawn } from 'child_process';

const PORT = process.env.WEBHOOK_PORT || 9000;
const SECRET = process.env.WEBHOOK_SECRET || 'change-me-please';
const DEPLOY_SCRIPT = process.env.DEPLOY_SCRIPT || '/volume1/docker/batala-vitrine/nas-deploy.sh';

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
    return;
  }

  // Webhook endpoint
  if (req.url === '/deploy' && req.method === 'POST') {
    // Vérifier l'authentification
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${SECRET}`) {
      console.error('❌ Unauthorized deployment attempt');
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }

    // Lire le body
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        console.log('📦 Deployment triggered:', payload);

        // Répondre immédiatement
        res.writeHead(202, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'accepted', message: 'Deployment started' }));

        // Lancer le déploiement en arrière-plan
        const deploy = spawn('bash', [DEPLOY_SCRIPT], {
          env: {
            ...process.env,
            DOCKER_IMAGE: payload.image || process.env.DOCKER_IMAGE
          },
          stdio: 'inherit'
        });

        deploy.on('close', (code) => {
          if (code === 0) {
            console.log('✅ Deployment completed successfully');
          } else {
            console.error(`❌ Deployment failed with code ${code}`);
          }
        });

      } catch (error) {
        console.error('❌ Invalid payload:', error);
      }
    });
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`🎣 Webhook server listening on port ${PORT}`);
  console.log(`🔒 Secret configured: ${SECRET.substring(0, 4)}...`);
  console.log(`📜 Deploy script: ${DEPLOY_SCRIPT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⏹️  Shutting down webhook server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
