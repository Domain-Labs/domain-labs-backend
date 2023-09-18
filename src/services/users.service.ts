import { HttpException } from '@exceptions/httpException';
import { Service } from 'typedi';
import { User } from '@interfaces/users.interface';
import { hash } from 'bcrypt';
import userModel from '@models/users.model';

@Service()
export class UserService {
  public users = userModel;
}
