import { create } from 'zustand';
import { jobsApi, type JobDetails, type JobSummary } from '../api/jobs';

interface JobsState {
  jobs: JobSummary[]; activeId: string | null; details: JobDetails | null; loading: boolean; error: string | null;
  loadJobs: () => Promise<void>; selectJob: (id: string) => Promise<void>; createJob: (urls: string[]) => Promise<void>; cancelActive: () => Promise<void>;
}
export const useJobsStore = create<JobsState>((set, get) => ({
  jobs: [], activeId: null, details: null, loading: false, error: null,
  loadJobs: async () => { try { set({ jobs: await jobsApi.list(), error: null }); } catch (e) { set({ error: message(e) }); } },
  selectJob: async (id) => {
    set({ activeId: id, details: null, loading: true, error: null });
    try { const details = await jobsApi.get(id); if (get().activeId === id) set({ details }); }
    catch (e) { if (get().activeId === id) set({ error: message(e) }); }
    finally { if (get().activeId === id) set({ loading: false }); }
  },
  createJob: async (urls) => {
    set({ loading: true, error: null });
    try { const { jobId } = await jobsApi.create(urls); await get().loadJobs(); await get().selectJob(jobId); }
    catch (e) { set({ error: message(e) }); }
    finally { set({ loading: false }); }
  },
  cancelActive: async () => { const id = get().activeId; if (!id) return; try { const details = await jobsApi.cancel(id); if (get().activeId === id) set({ details }); await get().loadJobs(); } catch (e) { set({ error: message(e) }); } },
}));
function message(error: unknown) { return error instanceof Error ? error.message : 'Unexpected error'; }
