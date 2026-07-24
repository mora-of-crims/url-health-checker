import { useJobsStore } from '../store/jobs-store';
const finalStatuses = new Set(['completed', 'cancelled', 'failed']);
export function JobDetails() {
  const { details, loading, cancelActive } = useJobsStore(); if (loading && !details) return <section className="card">Загрузка…</section>; if (!details) return <section className="card muted">Выберите задание, чтобы увидеть результаты.</section>;
  const done = details.urls.filter((item) => ['success', 'error', 'cancelled'].includes(item.status)).length;
  return <section className="card details"><div className="details-head"><div><h2>Детали задания</h2><p><span className={'badge ' + details.status}>{details.status}</span> {done} из {details.urlCount} обработано</p></div>{!finalStatuses.has(details.status) && <button className="danger" onClick={() => void cancelActive()}>Отменить задание</button>}</div><div className="progress"><i style={{ width: `${details.urlCount ? done / details.urlCount * 100 : 0}%` }} /></div><div className="checks">{details.urls.map((item, index) => <article key={`${item.url}-${index}`}><div><b>{item.status}</b><code>{item.url}</code></div><div className="result">{item.httpStatus && <span>HTTP {item.httpStatus}</span>}{item.error && <span className="error">{item.error}</span>}{item.durationMs !== undefined && <span>{(item.durationMs / 1000).toFixed(1)} c</span>}</div></article>)}</div></section>;
}
