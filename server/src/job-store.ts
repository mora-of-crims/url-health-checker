import { randomUUID } from 'node:crypto';
import { Job, JobStatus, UrlCheck } from './types.js';

const jobs = new Map<string, Job>();
const finalJobStatuses: JobStatus[] = ['completed', 'cancelled', 'failed'];

export function createJob(urls: string[]): Job {
  const job: Job = {
    id: randomUUID(), createdAt: new Date().toISOString(), status: 'pending', cancelled: false,
    urls: urls.map((url): UrlCheck => ({ url, status: 'pending' })),
  };
  jobs.set(job.id, job);
  void processJob(job);
  return job;
}

export function getJob(id: string) { return jobs.get(id); }
export function listJobs() { return [...jobs.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }
export function isFinal(status: JobStatus) { return finalJobStatuses.includes(status); }

export function cancelJob(job: Job) {
  if (isFinal(job.status)) return job;
  job.cancelled = true;
  job.status = 'cancelled';
  for (const check of job.urls) if (check.status === 'pending') check.status = 'cancelled';
  refreshJobStatus(job);
  return job;
}

async function processJob(job: Job) {
  job.status = 'in_progress';
  const queue = job.urls.filter((item) => item.status === 'pending');
  let cursor = 0;
  async function worker() {
    while (!job.cancelled) {
      const item = queue[cursor++];
      if (!item) return;
      await checkUrl(job, item);
    }
  }
  await Promise.all(Array.from({ length: Math.min(5, queue.length) }, worker));
  refreshJobStatus(job);
}

async function checkUrl(job: Job, item: UrlCheck) {
  if (job.cancelled) { item.status = 'cancelled'; return; }
  item.status = 'in_progress'; item.startedAt = new Date().toISOString();
  const started = Date.now();
  let status: UrlCheck['status']; let httpStatus: number | undefined; let errorMessage: string | undefined;
  try {
    const response = await fetch(item.url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(15_000) });
    httpStatus = response.status;
    status = response.ok ? 'success' : 'error';
    if (!response.ok) errorMessage = `HTTP ${response.status} ${response.statusText}`;
  } catch (error) {
    status = 'error'; errorMessage = error instanceof Error ? error.message : 'Request failed';
  }
  await delay(Math.floor(Math.random() * 10_001));
  item.status = status; item.httpStatus = httpStatus; item.error = errorMessage;
  item.finishedAt = new Date().toISOString(); item.durationMs = Date.now() - started;
}

function refreshJobStatus(job: Job) {
  if (job.cancelled) {
    for (const item of job.urls) if (item.status === 'pending') item.status = 'cancelled';
    if (!job.urls.some((item) => item.status === 'in_progress')) job.status = 'cancelled';
    return;
  }
  if (job.urls.every((item) => ['success', 'error'].includes(item.status))) job.status = 'completed';
}
function delay(ms: number) { return new Promise((resolve) => setTimeout(resolve, ms)); }
