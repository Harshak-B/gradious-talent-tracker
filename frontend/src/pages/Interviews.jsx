import { useState, useEffect, useCallback } from 'react';
import { getInterviews, createInterview, updateInterview, deleteInterview, getStudents, getDrives } from '../api/api';
import { LoadingState, ErrorState, EmptyState } from '../components/States';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';

const ROUND_TYPES = ['Aptitude', 'Technical', 'Coding', 'Group Discussion', 'HR', 'Managerial', 'Cultural Fit', 'Other'];
const STATUSES = ['Scheduled', 'Completed', 'Cancelled', 'No Show'];
const RESULTS = ['Pending', 'Passed', 'Failed', 'On Hold'];

const RESULT_BADGE = {
  Passed: 'badge-success', Failed: 'badge-danger',
  Pending: 'badge-warning', 'On Hold': 'badge-info',
};
const STATUS_BADGE = {
  Scheduled: 'badge-primary', Completed: 'badge-success',
  Cancelled: 'badge-danger', 'No Show': 'badge-gray',
};

const EMPTY_FORM = {
  student: '', drive: '', roundNumber: 1, roundType: 'Technical',
  scheduledAt: '', conductedAt: '', interviewerName: '',
  feedback: '', score: '', status: 'Scheduled', result: 'Pending', notes: '',
};

function validate(form) {
  const errs = {};
  if (!form.student) errs.student = 'Student is required';
  if (!form.drive) errs.drive = 'Drive is required';
  if (!form.roundNumber || +form.roundNumber < 1) errs.roundNumber = 'Round number must be ≥ 1';
  if (!form.scheduledAt) errs.scheduledAt = 'Scheduled date is required';
  return errs;
}

export default function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [students, setStudents] = useState([]);
  const [drives, setDrives] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterResult, setFilterResult] = useState('');
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const toInputDT = (d) => d ? new Date(d).toISOString().slice(0, 16) : '';

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = { page, limit: 10 };
      if (filterStatus) params.status = filterStatus;
      if (filterResult) params.result = filterResult;
      const [iRes, sRes, dRes] = await Promise.all([
        getInterviews(params),
        getStudents({ limit: 200 }),
        getDrives({ limit: 200 }),
      ]);
      setInterviews(iRes.data.data);
      setPagination(iRes.data.pagination);
      setStudents(sRes.data.data);
      setDrives(dRes.data.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus, filterResult]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => { setForm(EMPTY_FORM); setFormErrors({}); setEditing(null); setModal('form'); };
  const openEdit = (iv) => {
    setForm({
      student: iv.student?._id || iv.student,
      drive: iv.drive?._id || iv.drive,
      roundNumber: iv.roundNumber,
      roundType: iv.roundType,
      scheduledAt: toInputDT(iv.scheduledAt),
      conductedAt: toInputDT(iv.conductedAt),
      interviewerName: iv.interviewerName || '',
      feedback: iv.feedback || '',
      score: iv.score ?? '',
      status: iv.status,
      result: iv.result,
      notes: iv.notes || '',
    });
    setFormErrors({}); setEditing(iv); setModal('form');
  };
  const closeModal = () => { setModal(null); setEditing(null); };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (formErrors[name]) setFormErrors((fe) => ({ ...fe, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        roundNumber: Number(form.roundNumber),
        score: form.score !== '' ? Number(form.score) : undefined,
        conductedAt: form.conductedAt || undefined,
      };
      if (editing) await updateInterview(editing._id, payload);
      else await createInterview(payload);
      closeModal(); fetchData();
    } catch (e) {
      setFormErrors({ submit: e.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try { await deleteInterview(id); setDeleteConfirm(null); fetchData(); }
    catch (e) { alert(e.message); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>Interviews</h1><p>Track interview rounds for each student and drive</p></div>
        <button className="btn btn-primary" onClick={openAdd}>＋ Add Interview</button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body" style={{ paddingTop: 14, paddingBottom: 14 }}>
          <div className="filter-row">
            <select className="form-control" style={{ maxWidth: 160 }} value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
              <option value="">All Statuses</option>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select className="form-control" style={{ maxWidth: 160 }} value={filterResult}
              onChange={(e) => { setFilterResult(e.target.value); setPage(1); }}>
              <option value="">All Results</option>
              {RESULTS.map((r) => <option key={r}>{r}</option>)}
            </select>
            {(filterStatus || filterResult) && (
              <button className="btn btn-outline btn-sm" onClick={() => { setFilterStatus(''); setFilterResult(''); setPage(1); }}>Clear</button>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={fetchData} /> : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Student</th><th>Company / Drive</th><th>Round</th><th>Type</th><th>Scheduled</th><th>Status</th><th>Result</th><th>Score</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {interviews.length === 0 ? (
                    <tr><td colSpan={9}>
                      <EmptyState icon="🗣️" title="No interviews found" description="Add an interview round to begin tracking." />
                    </td></tr>
                  ) : interviews.map((iv) => (
                    <tr key={iv._id}>
                      <td>
                        <strong>{iv.student?.name ?? '—'}</strong>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{iv.student?.department}</div>
                      </td>
                      <td>
                        <span>{iv.drive?.company?.name ?? '—'}</span>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{iv.drive?.role}</div>
                      </td>
                      <td style={{ textAlign: 'center' }}>{iv.roundNumber}</td>
                      <td><span className="badge badge-gray">{iv.roundType}</span></td>
                      <td className="text-muted">{new Date(iv.scheduledAt).toLocaleDateString('en-IN')}</td>
                      <td><span className={`badge ${STATUS_BADGE[iv.status] || 'badge-gray'}`}>{iv.status}</span></td>
                      <td><span className={`badge ${RESULT_BADGE[iv.result] || 'badge-gray'}`}>{iv.result}</span></td>
                      <td>{iv.score != null ? `${iv.score}%` : '—'}</td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(iv)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(iv)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </div>

      <Modal isOpen={modal === 'form'} onClose={closeModal}
        title={editing ? 'Edit Interview' : 'Add Interview'}
        footer={
          <>
            <button className="btn btn-outline" onClick={closeModal} disabled={saving}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Update' : 'Add Interview'}
            </button>
          </>
        }>
        {formErrors.submit && (
          <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 6, fontSize: '0.85rem' }}>
            {formErrors.submit}
          </div>
        )}
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Student *</label>
            <select className={`form-control${formErrors.student ? ' error' : ''}`} name="student" value={form.student} onChange={handleChange}>
              <option value="">Select student…</option>
              {students.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.department})</option>)}
            </select>
            {formErrors.student && <span className="form-error">{formErrors.student}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Drive *</label>
            <select className={`form-control${formErrors.drive ? ' error' : ''}`} name="drive" value={form.drive} onChange={handleChange}>
              <option value="">Select drive…</option>
              {drives.map((d) => <option key={d._id} value={d._id}>{d.company?.name} – {d.role}</option>)}
            </select>
            {formErrors.drive && <span className="form-error">{formErrors.drive}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Round Number *</label>
            <input className="form-control" name="roundNumber" type="number" min="1" value={form.roundNumber} onChange={handleChange} />
            {formErrors.roundNumber && <span className="form-error">{formErrors.roundNumber}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Round Type *</label>
            <select className="form-control" name="roundType" value={form.roundType} onChange={handleChange}>
              {ROUND_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Scheduled At *</label>
            <input className={`form-control${formErrors.scheduledAt ? ' error' : ''}`} name="scheduledAt" type="datetime-local" value={form.scheduledAt} onChange={handleChange} />
            {formErrors.scheduledAt && <span className="form-error">{formErrors.scheduledAt}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Conducted At</label>
            <input className="form-control" name="conductedAt" type="datetime-local" value={form.conductedAt} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Interviewer Name</label>
            <input className="form-control" name="interviewerName" value={form.interviewerName} onChange={handleChange} placeholder="e.g. Ravi Kumar" />
          </div>
          <div className="form-group">
            <label className="form-label">Score (0–100)</label>
            <input className="form-control" name="score" type="number" min="0" max="100" value={form.score} onChange={handleChange} placeholder="85" />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-control" name="status" value={form.status} onChange={handleChange}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Result</label>
            <select className="form-control" name="result" value={form.result} onChange={handleChange}>
              {RESULTS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Feedback</label>
          <textarea className="form-control" name="feedback" value={form.feedback} onChange={handleChange}
            placeholder="Interviewer feedback…" rows={3} style={{ resize: 'vertical' }} />
        </div>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Interview"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm._id)}>Delete</button>
          </>
        }>
        <p>Delete Round {deleteConfirm?.roundNumber} ({deleteConfirm?.roundType}) interview for <strong>{deleteConfirm?.student?.name}</strong>?</p>
      </Modal>
    </div>
  );
}
