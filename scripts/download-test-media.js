/**
 * Script pour télécharger des médias de test depuis Pexels
 * Usage: node scripts/download-test-media.js
 * 
 * Nécessite une clé API Pexels gratuite: https://www.pexels.com/api/
 * Définir PEXELS_API_KEY dans .env
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'uploads', 'test-media');

// Créer le dossier de destination
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Télécharge un fichier depuis une URL
 */
function downloadFile(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(OUTPUT_DIR, filename);
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✅ Téléchargé: ${filename}`);
        resolve(filePath);
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      console.error(`❌ Erreur: ${filename}`, err.message);
      reject(err);
    });
  });
}

/**
 * Récupère des photos depuis Pexels
 */
async function fetchPexelsPhotos(query, perPage = 5) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.pexels.com',
      path: `/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`,
      headers: {
        'Authorization': PEXELS_API_KEY
      }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.photos || []);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

/**
 * Récupère des vidéos depuis Pexels
 */
async function fetchPexelsVideos(query, perPage = 3) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.pexels.com',
      path: `/videos/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`,
      headers: {
        'Authorization': PEXELS_API_KEY
      }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.videos || []);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

/**
 * Script principal
 */
async function main() {
  console.log('🎬 Téléchargement des médias de test...\n');

  if (!PEXELS_API_KEY) {
    console.error('❌ PEXELS_API_KEY manquante dans .env');
    console.log('📝 Obtenez votre clé gratuite sur: https://www.pexels.com/api/');
    process.exit(1);
  }

  try {
    // Images horizontales larges (bannières)
    console.log('📸 Images horizontales larges (bannières)...');
    const bannerPhotos = await fetchPexelsPhotos('abstract banner', 3);
    for (let i = 0; i < bannerPhotos.length; i++) {
      const photo = bannerPhotos[i];
      // Prendre la version large (1280px de large environ)
      await downloadFile(photo.src.large, `banner-${i + 1}.jpg`);
    }

    // Images 16:9 classiques
    console.log('\n📸 Images 16:9 classiques...');
    const landscapePhotos = await fetchPexelsPhotos('nature landscape', 3);
    for (let i = 0; i < landscapePhotos.length; i++) {
      const photo = landscapePhotos[i];
      await downloadFile(photo.src.large2x, `landscape-${i + 1}.jpg`);
    }

    // Images carrées
    console.log('\n📸 Images carrées...');
    const squareOptions = {
      hostname: 'api.pexels.com',
      path: `/v1/search?query=abstract&per_page=2&orientation=square`,
      headers: { 'Authorization': PEXELS_API_KEY }
    };
    
    const squarePhotos = await new Promise((resolve, reject) => {
      https.get(squareOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve(json.photos || []);
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });

    for (let i = 0; i < squarePhotos.length; i++) {
      const photo = squarePhotos[i];
      await downloadFile(photo.src.large, `square-${i + 1}.jpg`);
    }

    // Vidéos MP4
    console.log('\n🎥 Vidéos MP4...');
    const videos = await fetchPexelsVideos('nature ocean', 2);
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      // Prendre la version HD (1920x1080)
      const hdFile = video.video_files.find(f => f.width === 1920 && f.height === 1080) 
                     || video.video_files[0];
      if (hdFile) {
        await downloadFile(hdFile.link, `video-${i + 1}.mp4`);
      }
    }

    console.log('\n✅ Téléchargement terminé!');
    console.log(`📁 Fichiers dans: ${OUTPUT_DIR}`);
    console.log('\n📋 Médias téléchargés:');
    const files = fs.readdirSync(OUTPUT_DIR);
    files.forEach(file => {
      const stats = fs.statSync(path.join(OUTPUT_DIR, file));
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`   - ${file} (${sizeMB} MB)`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

main();
