import { useState, useEffect, useCallback } from 'react';
import { getOutcomes, createOutcome, updateOutcome, deleteOutcome, getStudents, getDrives } from '../api/api';
import { LoadingState, ErrorState, EmptyState } from '../components/States';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';

const RESULTS = ['Pending', 'Selected', 'Rejected', 'Waitlisted'];
const RESULT_BADGE = {
  Selected: 'badge-success', Rejected: 'badge-danger',
  Pending: 'badge-warning', Waitlisted: 'badge-info',
};

const EMPTY_FORM = {
  student: '', drive: '', result: 'Pending', offeredPackage: '',
  offeredRole: '', offerLocation: '', offerLetterDate: '', joiningDate: '', remarks: '',
};

function validate(form) {
  const errs = {};
  if (!form.student) errs.student = 'Student is required';
  if (!form.drive) errs.drive = 'Drive is required';
  if (!form.result) errs.result = 'Result is required';
  if (form.offeredPackage !== '' && (isNaN(form.offeredPackage) || +form.offeredPackage < 0))
    errs.offeredPackage = 'Package must be positive';
  return errs;
}

export default function Outcomes() {
  const [outcomes, setOutcomes] = useState([]);
  const [students, setStudents] = useState([]);
  const [drives, setDrives] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [filterResult, setFilterResult] = useState('');
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const toInputDate = (d) => d ? new Date(d).toISOString().split('T')[0] : '';

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = { page, limit: 10 };
      if (filterResult) params.result = filterResult;
      const [oRes, sRes, dRes] = await Promise.all([
        getOutcomes(params),
        getStudents({ limit: 200 }),
        getDrives({ limit: 200 }),
      ]);
      setOutcomes(oRes.data.data);
      setPagination(oRes.data.pagination);
      setStudents(sRes.data.data);
      setDrives(dRes.data.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, filterResult]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => { setForm(EMPTY_FORM); setFormErrors({}); setEditing(null); setModal('form'); };
  const openEdit = (o) => {
    setForm({
      student: o.student?._id || o.student,
      drive: o.drive?._id || o.drive,
      result: o.result,
      offeredPackage: o.offeredPackage ?? '',
      offeredRole: o.offeredRole || '',
      offerLocation: o.offerLocation || '',
      offerLetterDate: toInputDate(o.offerLetterDate),
      joiningDate: toInputDate(o.joiningDate),
      remarks: o.remarks || '',
    });
    setFormErrors({}); setEditing(o); setModal('form');
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
        offeredPackage: form.offeredPackage !== '' ? Number(form.offeredPackage) : undefined,
        offerLetterDate: form.offerLetterDate || undefined,
        joiningDate: form.joiningDate || undefined,
      };
      if (editing) await updateOutcome(editing._id, payload);
      else await createOutcome(payload);
      closeModal(); fetchData();
    } catch (e) {
      setFormErrors({ submit: e.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try { await deleteOutcome(id); setDeleteConfirm(null); fetchData(); }
    catch (e) { alert(e.message); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>Outcomes</h1><p>Hiring outcomes – selected, rejected, and pending decisions</p></div>
        <button className="btn btn-primary" onClick={openAdd}>＋ Add Outcome</button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body" style={{ paddingTop: 14, paddingBottom: 14 }}>
          <div className="filter-row">
            <select className="form-control" style={{ maxWidth: 160 }} value={filterResult}
              onChange={(e) => { setFilterResult(e.target.value); setPage(1); }}>
              <option value="">All Results</option>
              {RESULTS.map((r) => <option key={r}>{r}</option>)}
            </select>
            {filterResult && (
              <button className="btn btn-outline btn-sm" onClick={() => { setFilterResult(''); setPage(1); }}>Clear</button>
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
                  <tr><th>Student</th><th>Company / Role</th><th>Result</th><th>Package (LPA)</th><th>Offered Role</th><th>Location</th><th>Offer Date</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {outcomes.length === 0 ? (
                    <tr><td colSpan={8}>
                      <EmptyState icon="🏆" title="No outcomes yet" description="Record a hiring outcome after interview completion." />
                    </td></tr>
                  ) : outcomes.map((o) => (
                    <tr key={o._id}>
                      <td>
                        <strong>{o.student?.name ?? '—'}</strong>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{o.student?.department} · {o.student?.graduationYear}</div>
                      </td>
                      <td>
                        <span>{o.drive?.company?.name ?? '—'}</span>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{o.drive?.role}</div>
                      </td>
                      <td><span className={`badge ${RESULT_BADGE[o.result] || 'badge-gray'}`}>{o.result}</span></td>
                      <td>
                        {o.offeredPackage
                          ? <span style={{ fontWeight: 700, color: 'var(--success)' }}>₹{o.offeredPackage} LPA</span>
                          : '—'}
                      </td>
                      <td className="text-muted">{o.offeredRole || '—'}</td>
                      <td className="text-muted">{o.offerLocation || '—'}</td>
                      <td className="text-muted">{o.offerLetterDate ? new Date(o.offerLetterDate).toLocaleDateString('en-IN') : '—'}</td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(o)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(o)}>Del</button>
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
        title={editing ? 'Edit Outcome' : 'Add Outcome'}
        footer={
          <>
            <button className="btn btn-outline" onClick={closeModal} disabled={saving}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Update' : 'Add Outcome'}
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
            <label className="form-label">Result *</label>
            <select className="form-control" name="result" value={form.result} onChange={handleChange}>
              {RESULTS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Offered Package (LPA)</label>
            <input className={`form-control${formErrors.offeredPackage ? ' error' : ''}`} name="offeredPackage" type="number" min="0" step="0.5" value={form.offeredPackage} onChange={handleChange} placeholder="8.5" />
            {formErrors.offeredPackage && <span className="form-error">{formErrors.offeredPackage}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Offered Role</label>
            <input className="form-control" name="offeredRole" value={form.offeredRole} onChange={handleChange} placeholder="Software Engineer" />
          </div>
          <div className="form-group">
            <label className="form-label">Location</label>
            <input className="form-control" name="offerLocation" value={form.offerLocation} onChange={handleChange} placeholder="Hyderabad" />
          </div>
          <div className="form-group">
            <label className="form-label">Offer Letter Date</label>
            <input className="form-control" name="offerLetterDate" type="date" value={form.offerLetterDate} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Joining Date</label>
            <input className="form-control" name="joiningDate" type="date" value={form.joiningDate} onChange={handleChange} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Remarks</label>
          <textarea className="form-control" name="remarks" value={form.remarks} onChange={handleChange}
            placeholder="Any additional notes…" rows={2} style={{ resize: 'vertical' }} />
        </div>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Outcome"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm._id)}>Delete</button>
          </>
        }>
        <p>Delete the outcome for <strong>{deleteConfirm?.student?.name}</strong> at <strong>{deleteConfirm?.drive?.company?.name}</strong>?</p>
      </Modal>
    </div>
  );
}
