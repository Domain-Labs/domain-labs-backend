import { App } from '@/app';
import { AuthRoute } from '@routes/auth.route';
import { DomainRoute } from '@routes/domain.route';
import { UserRoute } from '@routes/users.route';
import { ValidateEnv } from '@utils/validateEnv';
import { logger } from './utils/logger';
ValidateEnv();

const app = new App([new UserRoute(), new AuthRoute(), new DomainRoute()]);

app.listen();
