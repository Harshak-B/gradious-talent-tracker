import { useState, useEffect, useCallback } from 'react';
import { getDrives, createDrive, updateDrive, deleteDrive, getCompanies } from '../api/api';
import { LoadingState, ErrorState, EmptyState } from '../components/States';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';

const DEPARTMENTS = ['All', 'CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'AIDS', 'AIML', 'CSD', 'Other'];
const JOB_TYPES = ['Full Time', 'Internship', 'Contract', 'Part Time'];
const STATUSES = ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'];

const STATUS_BADGE = {
  Upcoming: 'badge-primary',
  Ongoing: 'badge-warning',
  Completed: 'badge-success',
  Cancelled: 'badge-danger',
};

const EMPTY_FORM = {
  company: '', role: '', description: '', package: '',
  driveDate: '', lastDateToApply: '', jobType: 'Full Time',
  location: '', status: 'Upcoming',
  minCGPA: '', allowedDepartments: ['All'], graduationYear: '', minTenthPercent: '', minTwelfthPercent: '',
};

function validate(form) {
  const errs = {};
  if (!form.company) errs.company = 'Company is required';
  if (!form.role.trim()) errs.role = 'Role is required';
  if (!form.package || isNaN(form.package) || +form.package < 0) errs.package = 'Valid package (LPA) is required';
  if (!form.driveDate) errs.driveDate = 'Drive date is required';
  return errs;
}

export default function Drives() {
  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = { page, limit: 10 };
      if (filterStatus) params.status = filterStatus;
      const [dRes, cRes] = await Promise.all([getDrives(params), getCompanies({ limit: 100 })]);
      setDrives(dRes.data.data);
      setPagination(dRes.data.pagination);
      setCompanies(cRes.data.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '—';
  const toInputDate = (d) => d ? new Date(d).toISOString().split('T')[0] : '';

  const openAdd = () => { setForm({ ...EMPTY_FORM, company: companies[0]?._id || '' }); setFormErrors({}); setEditing(null); setModal('form'); };
  const openEdit = (d) => {
    setForm({
      company: d.company?._id || d.company,
      role: d.role, description: d.description || '',
      package: d.package, driveDate: toInputDate(d.driveDate),
      lastDateToApply: toInputDate(d.lastDateToApply),
      jobType: d.jobType, location: d.location || '', status: d.status,
      minCGPA: d.eligibilityCriteria?.minCGPA ?? '',
      allowedDepartments: d.eligibilityCriteria?.allowedDepartments || ['All'],
      graduationYear: d.eligibilityCriteria?.graduationYear ?? '',
      minTenthPercent: d.eligibilityCriteria?.minTenthPercent ?? '',
      minTwelfthPercent: d.eligibilityCriteria?.minTwelfthPercent ?? '',
    });
    setFormErrors({}); setEditing(d); setModal('form');
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
        company: form.company,
        role: form.role,
        description: form.description,
        package: Number(form.package),
        driveDate: form.driveDate,
        lastDateToApply: form.lastDateToApply || undefined,
        jobType: form.jobType,
        location: form.location,
        status: form.status,
        eligibilityCriteria: {
          minCGPA: form.minCGPA !== '' ? Number(form.minCGPA) : 0,
          allowedDepartments: form.allowedDepartments,
          graduationYear: form.graduationYear !== '' ? Number(form.graduationYear) : undefined,
          minTenthPercent: form.minTenthPercent !== '' ? Number(form.minTenthPercent) : 0,
          minTwelfthPercent: form.minTwelfthPercent !== '' ? Number(form.minTwelfthPercent) : 0,
        },
      };
      if (editing) await updateDrive(editing._id, payload);
      else await createDrive(payload);
      closeModal(); fetchData();
    } catch (e) {
      setFormErrors({ submit: e.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try { await deleteDrive(id); setDeleteConfirm(null); fetchData(); }
    catch (e) { alert(e.message); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>Drives</h1><p>Company placement drives and registration</p></div>
        <button className="btn btn-primary" onClick={openAdd}>＋ Add Drive</button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body" style={{ paddingTop: 14, paddingBottom: 14 }}>
          <div className="filter-row">
            <select className="form-control" style={{ maxWidth: 160 }} value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
              <option value="">All Statuses</option>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            {filterStatus && (
              <button className="btn btn-outline btn-sm" onClick={() => { setFilterStatus(''); setPage(1); }}>Clear</button>
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
                  <tr><th>Company</th><th>Role</th><th>Package (LPA)</th><th>Drive Date</th><th>Type</th><th>Status</th><th>Min CGPA</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {drives.length === 0 ? (
                    <tr><td colSpan={8}>
                      <EmptyState icon="📅" title="No drives found" description="Create a drive to get started." />
                    </td></tr>
                  ) : drives.map((d) => (
                    <tr key={d._id}>
                      <td><strong>{d.company?.name ?? '—'}</strong><div className="text-muted" style={{ fontSize: '0.75rem' }}>{d.company?.industry}</div></td>
                      <td>{d.role}</td>
                      <td><span style={{ fontWeight: 700, color: 'var(--success)' }}>₹{d.package}</span></td>
                      <td>{fmt(d.driveDate)}</td>
                      <td><span className="badge badge-gray">{d.jobType}</span></td>
                      <td><span className={`badge ${STATUS_BADGE[d.status] || 'badge-gray'}`}>{d.status}</span></td>
                      <td>{d.eligibilityCriteria?.minCGPA ?? '—'}</td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(d)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(d)}>Cancel</button>
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
        title={editing ? 'Edit Drive' : 'Add Drive'}
        footer={
          <>
            <button className="btn btn-outline" onClick={closeModal} disabled={saving}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Update' : 'Create Drive'}
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
            <label className="form-label">Company *</label>
            <select className={`form-control${formErrors.company ? ' error' : ''}`} name="company" value={form.company} onChange={handleChange}>
              <option value="">Select company…</option>
              {companies.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            {formErrors.company && <span className="form-error">{formErrors.company}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Role *</label>
            <input className={`form-control${formErrors.role ? ' error' : ''}`} name="role" value={form.role} onChange={handleChange} placeholder="Software Engineer" />
            {formErrors.role && <span className="form-error">{formErrors.role}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Package (LPA) *</label>
            <input className={`form-control${formErrors.package ? ' error' : ''}`} name="package" type="number" min="0" step="0.5" value={form.package} onChange={handleChange} placeholder="8.5" />
            {formErrors.package && <span className="form-error">{formErrors.package}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Drive Date *</label>
            <input className={`form-control${formErrors.driveDate ? ' error' : ''}`} name="driveDate" type="date" value={form.driveDate} onChange={handleChange} />
            {formErrors.driveDate && <span className="form-error">{formErrors.driveDate}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Last Date to Apply</label>
            <input className="form-control" name="lastDateToApply" type="date" value={form.lastDateToApply} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Job Type</label>
            <select className="form-control" name="jobType" value={form.jobType} onChange={handleChange}>
              {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Location</label>
            <input className="form-control" name="location" value={form.location} onChange={handleChange} placeholder="Hyderabad" />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-control" name="status" value={form.status} onChange={handleChange}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Min CGPA</label>
            <input className="form-control" name="minCGPA" type="number" min="0" max="10" step="0.1" value={form.minCGPA} onChange={handleChange} placeholder="7.0" />
          </div>
          <div className="form-group">
            <label className="form-label">Graduation Year</label>
            <input className="form-control" name="graduationYear" type="number" min="2020" max="2035" value={form.graduationYear} onChange={handleChange} placeholder="2025" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-control" name="description" value={form.description} onChange={handleChange}
            placeholder="Job description…" rows={3} style={{ resize: 'vertical' }} />
        </div>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Cancel Drive"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Back</button>
            <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm._id)}>Cancel Drive</button>
          </>
        }>
        <p>Mark the drive for <strong>{deleteConfirm?.company?.name}</strong> – <strong>{deleteConfirm?.role}</strong> as Cancelled?</p>
      </Modal>
    </div>
  );
}
