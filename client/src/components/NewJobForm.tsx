import { useState } from 'react';
import type { FormEvent } from 'react';
import { useJobsStore } from '../store/jobs-store';
export function NewJobForm() {
  const [value, setValue] = useState('https://example.com\nhttps://httpbin.org/status/404');
  const createJob = useJobsStore((state) => state.createJob); const loading = useJobsStore((state) => state.loading);
  async function submit(event: FormEvent) { event.preventDefault(); const urls = value.split(/\r?\n/).map((url) => url.trim()).filter(Boolean); if (urls.length) await createJob(urls); }
  return <section className="card"><h2>Новая проверка</h2><form onSubmit={submit}><textarea value={value} onChange={(e) => setValue(e.target.value)} placeholder="Один URL на строку" rows={7} /><button disabled={loading}>Запустить проверку</button></form></section>;
}
