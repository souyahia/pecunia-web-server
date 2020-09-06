import { Express } from 'express';
import registerPingRoutes from './ping.route';
import registerDevRoutes from './dev.route';

export default function registerRoutes(app: Express): void {
  registerPingRoutes(app);
  registerDevRoutes(app);
}
