import cors from 'cors';
import express from 'express';
import { z } from 'zod';
import { cancelJob, createJob, getJob, listJobs } from './job-store.js';

const app = express();
app.use(cors()); app.use(express.json());
const payloadSchema = z.object({ urls: z.array(z.string().url()).min(1).max(500) });

function summary(job: ReturnType<typeof createJob>) {
  const success = job.urls.filter((item) => item.status === 'success').length;
  const error = job.urls.filter((item) => item.status === 'error').length;
  return { id: job.id, createdAt: job.createdAt, status: job.status, urlCount: job.urls.length, stats: { success, error } };
}
app.post('/api/jobs', (req, res) => {
  const parsed = payloadSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'urls must be a non-empty list of valid HTTP URLs', details: parsed.error.flatten() });
  const job = createJob(parsed.data.urls);
  return res.status(201).json({ jobId: job.id });
});
app.get('/api/jobs', (_req, res) => res.json(listJobs().map(summary)));
app.get('/api/jobs/:id', (req, res) => {
  const job = getJob(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  return res.json({ ...summary(job), urls: job.urls });
});
app.delete('/api/jobs/:id', (req, res) => {
  const job = getJob(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  cancelJob(job); return res.json({ ...summary(job), urls: job.urls });
});
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));
const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`API is listening on http://localhost:${port}`));
