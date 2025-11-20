/**
 * Admin Dashboard Controller
 * Page principale admin avec navigation et contenu dynamique
 */

import { logger } from '../utils/logger.js';

export const showAdminDashboard = (req, res) => {
  res.render('pages/admin-dashboard', {
    title: 'Administration - Batala Vitrine',
    currentPage: 'dashboard',
    scripts: ['/js/admin-dashboard.js']
  });
};