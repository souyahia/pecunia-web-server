import { Express } from 'express';
import { devController } from '../controllers';

export default function registerDevRoutes(app: Express): void {
  app.get('/dev/dev1', devController.getDev1);
  app.get('/dev/dev2', devController.getDev2);
}
