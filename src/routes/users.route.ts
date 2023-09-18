import { CreateUserDto, UpdateUserDto } from '@dtos/users.dto';

import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { UserController } from '@controllers/users.controller';
import { ValidationMiddleware } from '@middlewares/validation.middleware';

export class UserRoute implements Routes {
  public path = '/users';
  public router = Router();
  public user = new UserController();

  constructor() {
    // this.initializeRoutes();
  }

  // private initializeRoutes() {}
}
