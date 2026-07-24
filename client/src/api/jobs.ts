export type JobStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'failed';
export type UrlStatus = 'pending' | 'in_progress' | 'success' | 'error' | 'cancelled';
export interface JobSummary { id: string; createdAt: string; status: JobStatus; urlCount: number; stats: { success: number; error: number } }
export interface UrlCheck { url: string; status: UrlStatus; httpStatus?: number; error?: string; startedAt?: string; finishedAt?: string; durationMs?: number }
export interface JobDetails extends JobSummary { urls: UrlCheck[] }

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init);
  if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.message || `Request failed (${response.status})`); }
  return response.json() as Promise<T>;
}
export const jobsApi = {
  create: (urls: string[]) => request<{ jobId: string }>('/api/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ urls }) }),
  list: () => request<JobSummary[]>('/api/jobs'),
  get: (id: string) => request<JobDetails>(`/api/jobs/${id}`),
  cancel: (id: string) => request<JobDetails>(`/api/jobs/${id}`, { method: 'DELETE' }),
};
