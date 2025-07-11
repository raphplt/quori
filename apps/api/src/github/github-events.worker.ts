import { QueueEvents, Worker, Job } from 'bullmq';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { GithubAppService } from './github-app.service';
import { Installation } from './entities/installation.entity';
import { Event as GithubEvent } from './entities/event.entity';
import { Post } from './entities/post.entity';

interface PushPayload {
  repository: {
    full_name: string;
    name: string;
    owner: {
      login: string;
    };
  };
  after: string;
}

interface PullRequestPayload {
  repository: {
    full_name: string;
    name: string;
    owner: {
      login: string;
    };
  };
  number: number;
}

const config = new ConfigService();
const dataSource = new DataSource({
  type: 'postgres',
  url: config.get<string>('DATABASE_URL'),
  entities: [Installation, GithubEvent, Post],
});

async function bootstrap() {
  await dataSource.initialize();
  const service = new GithubAppService(
    config,
    dataSource.getRepository(Installation),
    dataSource.getRepository(GithubEvent),
    dataSource.getRepository(Post),
  );

  const eventsRepository = dataSource.getRepository(GithubEvent);

  new Worker(
    'github-events',
    async (job: Job) => {
      const { delivery_id } = job.data as { delivery_id: string };
      const event = await eventsRepository.findOne({
        where: { delivery_id },
        relations: ['installation'],
      });
      if (!event || event.processed) return;
      const installationId = event.installation.id;
      const octokit = await service.getInstallationOctokit(installationId);
      let repoFullName = '';
      if (event.event === 'push') {
        const payload = event.payload as unknown as PushPayload;
        repoFullName = payload.repository.full_name;
        await octokit.rest.repos.getCommit({
          owner: payload.repository.owner.login,
          repo: payload.repository.name,
          ref: payload.after,
        });
      } else if (event.event === 'pull_request') {
        const payload = event.payload as unknown as PullRequestPayload;
        repoFullName = payload.repository.full_name;
        await octokit.rest.pulls.get({
          owner: payload.repository.owner.login,
          repo: payload.repository.name,
          pull_number: payload.number,
        });
      }
      const content = `Draft for ${event.event} on ${repoFullName}`;
      await service.savePost({
        installationId,
        repo: repoFullName,
        eventType: event.event,
        content,
      });
      await eventsRepository.update({ delivery_id }, { processed: true });
    },
    {
      connection: { url: config.get<string>('REDIS_URL') },
    },
  );

  const queueEvents = new QueueEvents('github-events', {
    connection: { url: config.get<string>('REDIS_URL') },
  });
  queueEvents.on('failed', ({ jobId, failedReason }) => {
    console.error('Job failed', jobId, failedReason);
  });
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
