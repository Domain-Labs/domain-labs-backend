import Bull, { Queue } from 'bull';

import { Container } from 'typedi';
import { DomainInputType } from '@/interfaces/domain.interface';
import { DomainService } from '@/services/domain.service';
import { logger } from '@/utils/logger';

const queue = new Bull('domainlabs');
const domain = Container.get(DomainService);

const createJob = async (options: string, data: any) => {
  const opts = { priority: 0, attempts: 5 };
  await queue.add(options, data, {
    attempts: opts.attempts,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: true,
  });
};

queue.process('createDomains', (job, done) => {
  const purchaseId = job.data.id;
  domain
    .registerDomains(purchaseId)
    .then(() => {
      logger.alert('success');
    })
    .catch(err => {
      logger.alert(err);
    })
    .finally(() => {
      done();
    });
});

export default createJob;
