import { buildPageData } from './src/services/pageBuilder.js';

async function check() {
  const pageData = await buildPageData();
  const hero = pageData.sections.find(s => s.type === 'hero');
  console.log('Hero from buildPageData:', JSON.stringify(hero, null, 2));
}

check().catch(console.error);
