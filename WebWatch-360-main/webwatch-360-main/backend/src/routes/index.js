import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import clientsRoutes from '../modules/clients/clients.routes.js';
import websitesRoutes from '../modules/websites/websites.routes.js';
import dashboardRoutes from '../modules/dashboard/dashboard.routes.js';
import maintenanceRoutes from '../modules/maintenance/maintenance.routes.js';
import notificationsRoutes from '../modules/notifications/notifications.routes.js';
import credentialsRoutes from '../modules/credentials/credentials.routes.js';
import reportsRoutes from '../modules/reports/reports.routes.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'WebWatch 360 API',
    timestamp: new Date().toISOString(),
  });
});

// Mount modules
router.use('/auth', authRoutes);
router.use('/clients', clientsRoutes);
router.use('/websites', websitesRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/credentials', credentialsRoutes);
router.use('/reports', reportsRoutes);

export default router;
