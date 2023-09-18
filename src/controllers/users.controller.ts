import { NextFunction, Request, Response } from 'express';

import { Container } from 'typedi';
import { User } from '@interfaces/users.interface';
import { UserService } from '@services/users.service';

export class UserController {
  public user = Container.get(UserService);
}
