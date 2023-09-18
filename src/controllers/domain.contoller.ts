import { Request, Response } from 'express-serve-static-core';

import { Container } from 'typedi';
import { DomainService } from '@/services/domain.service';
import { EPaymentOptions } from '@/interfaces/domain.interface';
import { NextFunction } from 'connect';
import createJob from '@/queues';

export class DomainController {
  public domain = Container.get(DomainService);

  public test = async (req: Request, res: Response, next: NextFunction) => {
    console.log('hello');
    try {
      await createJob('createDomains', { data: 'hello' });
      // return true;
      res.send(true);
    } catch (err) {
      console.log(err);
      return next(err);
    }
  };

  public checkAvailability = async (req: Request, res: Response, next: NextFunction) => {
    const { names } = req.body;
    try {
      const rlts = await Promise.all(names.map(({ name, type }) => this.domain.checkAvailable(name, type)));
      return res.status(200).json(rlts);
    } catch (err) {
      return next(err);
    }
  };

  public getEstimatedAmount = async (req: Request, res: Response, next: NextFunction) => {
    const { domains, paymentOption } = req.body;
    try {
      const amount = await this.domain.getEstimatedPrice(domains, paymentOption);
      return res.status(200).json(amount);
    } catch (err) {
      return next(err);
    }
  };

  public purchaseDomains = async (req: Request, res: Response, next: NextFunction) => {
    const { domains, paymentOption, address, solAddress } = req.body;
    try {
      const id = await this.domain.saveDomainsIntoDB(domains, paymentOption, address, solAddress);
      return res.status(200).json(id);
    } catch (error) {
      next(error);
    }
  };

  public confirmPurchase = async (req: Request, res: Response, next: NextFunction) => {
    const { id, transaction } = req.body;
    try {
      await this.domain.confirmTransaction(id, transaction);
      await createJob('createDomains', { id: id });
      return true;
    } catch (err) {
      console.log(err);
      next(err);
    }
  };
}
