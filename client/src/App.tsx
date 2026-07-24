import { useEffect } from 'react';
import { JobDetails } from './components/JobDetails'; import { JobsList } from './components/JobsList'; import { NewJobForm } from './components/NewJobForm';
import { useJobsStore } from './store/jobs-store';
const finalStatuses = new Set(['completed', 'cancelled', 'failed']);
export default function App() {
  const { activeId, details, error, loadJobs, selectJob } = useJobsStore();
  useEffect(() => { void loadJobs(); }, [loadJobs]);
  useEffect(() => { if (!activeId || !details || finalStatuses.has(details.status)) return; const timer = window.setInterval(() => void selectJob(activeId), 2000); return () => window.clearInterval(timer); }, [activeId, details?.status, selectJob]);
  return <main><header><h1>URL health checker</h1><p>Асинхронная проверка доступности адресов через HEAD-запросы.</p></header>{error && <div className="alert">{error}</div>}<div className="layout"><aside><NewJobForm /><JobsList /></aside><JobDetails /></div></main>;
}
