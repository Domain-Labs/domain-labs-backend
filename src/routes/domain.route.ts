import { DomainController } from '@controllers/domain.contoller';
import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';

export class DomainRoute implements Routes {
  public path = '/domains';
  public router = Router();
  public domain = new DomainController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}`, this.domain.test);
    this.router.post(`${this.path}/check-available`, this.domain.checkAvailability);
    this.router.post(`${this.path}/getEstimatedAmount`, this.domain.getEstimatedAmount);
    this.router.post(`${this.path}/purchase`, this.domain.purchaseDomains);
    this.router.post(`${this.path}/confirmPurchase`, this.domain.confirmPurchase);
    // this.router.post(`${this.path}/get/:address`, this.domain.);
  }
}
