import { useState, useEffect, useCallback } from 'react';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../api/api';
import { LoadingState, ErrorState, EmptyState } from '../components/States';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';

const DEPARTMENTS = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'AIDS', 'AIML', 'CSD', 'Other'];
const STATUSES = ['Not Placed', 'In Progress', 'Placed', 'Opted Out'];
const GRAD_YEARS = [2023, 2024, 2025, 2026, 2027];

const STATUS_BADGE = {
  Placed: 'badge-success',
  'In Progress': 'badge-warning',
  'Not Placed': 'badge-gray',
  'Opted Out': 'badge-info',
};

const EMPTY_FORM = {
  name: '', email: '', phone: '', department: 'CSE',
  graduationYear: 2025, cgpa: '', skills: '',
  placementStatus: 'Not Placed', tenthPercent: '', twelfthPercent: '',
};

function validate(form) {
  const errs = {};
  if (!form.name.trim()) errs.name = 'Name is required';
  if (!form.email.trim()) errs.email = 'Email is required';
  else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Invalid email';
  if (!form.department) errs.department = 'Department is required';
  if (!form.graduationYear) errs.graduationYear = 'Graduation year is required';
  if (form.cgpa !== '' && (isNaN(form.cgpa) || +form.cgpa < 0 || +form.cgpa > 10))
    errs.cgpa = 'CGPA must be 0–10';
  return errs;
}

export default function Students() {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [placementStatus, setPlacementStatus] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (department) params.department = department;
      if (placementStatus) params.placementStatus = placementStatus;
      if (graduationYear) params.graduationYear = graduationYear;
      const res = await getStudents(params);
      setStudents(res.data.data);
      setPagination(res.data.pagination);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, department, placementStatus, graduationYear]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const openAdd = () => { setForm(EMPTY_FORM); setFormErrors({}); setEditing(null); setModal('add'); };
  const openEdit = (s) => {
    setForm({
      name: s.name, email: s.email, phone: s.phone || '', department: s.department,
      graduationYear: s.graduationYear, cgpa: s.cgpa ?? '', skills: (s.skills || []).join(', '),
      placementStatus: s.placementStatus, tenthPercent: s.tenthPercent ?? '', twelfthPercent: s.twelfthPercent ?? '',
    });
    setFormErrors({}); setEditing(s); setModal('edit');
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
        cgpa: form.cgpa !== '' ? Number(form.cgpa) : undefined,
        tenthPercent: form.tenthPercent !== '' ? Number(form.tenthPercent) : undefined,
        twelfthPercent: form.twelfthPercent !== '' ? Number(form.twelfthPercent) : undefined,
        skills: form.skills ? form.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        graduationYear: Number(form.graduationYear),
      };
      if (editing) await updateStudent(editing._id, payload);
      else await createStudent(payload);
      closeModal();
      fetchStudents();
    } catch (e) {
      setFormErrors({ submit: e.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteStudent(id);
      setDeleteConfirm(null);
      fetchStudents();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Students</h1>
          <p>Manage student profiles and placement status</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>＋ Add Student</button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body" style={{ paddingTop: 14, paddingBottom: 14 }}>
          <div className="filter-row">
            <div className="search-bar" style={{ flex: '1 1 220px', maxWidth: 340 }}>
              <span className="search-icon">🔍</span>
              <input
                placeholder="Search name, email, skill…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <select className="form-control" style={{ maxWidth: 150 }} value={department}
              onChange={(e) => { setDepartment(e.target.value); setPage(1); }}>
              <option value="">All Departments</option>
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
            <select className="form-control" style={{ maxWidth: 150 }} value={placementStatus}
              onChange={(e) => { setPlacementStatus(e.target.value); setPage(1); }}>
              <option value="">All Statuses</option>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select className="form-control" style={{ maxWidth: 130 }} value={graduationYear}
              onChange={(e) => { setGraduationYear(e.target.value); setPage(1); }}>
              <option value="">All Years</option>
              {GRAD_YEARS.map((y) => <option key={y}>{y}</option>)}
            </select>
            {(search || department || placementStatus || graduationYear) && (
              <button className="btn btn-outline btn-sm" onClick={() => {
                setSearch(''); setDepartment(''); setPlacementStatus(''); setGraduationYear(''); setPage(1);
              }}>Clear</button>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={fetchStudents} /> : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th><th>Email</th><th>Dept</th><th>Year</th>
                    <th>CGPA</th><th>Skills</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr><td colSpan={8}>
                      <EmptyState icon="🎓" title="No students found" description="Add a student or adjust your filters." />
                    </td></tr>
                  ) : students.map((s) => (
                    <tr key={s._id}>
                      <td><strong>{s.name}</strong></td>
                      <td className="text-muted">{s.email}</td>
                      <td>{s.department}</td>
                      <td>{s.graduationYear}</td>
                      <td>{s.cgpa ?? '—'}</td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {(s.skills || []).slice(0, 3).map((sk) => (
                            <span key={sk} className="badge badge-gray">{sk}</span>
                          ))}
                          {(s.skills || []).length > 3 && (
                            <span className="badge badge-gray">+{s.skills.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td><span className={`badge ${STATUS_BADGE[s.placementStatus] || 'badge-gray'}`}>{s.placementStatus}</span></td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(s)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(s)}>Del</button>
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modal === 'add' || modal === 'edit'}
        onClose={closeModal}
        title={modal === 'edit' ? 'Edit Student' : 'Add Student'}
        footer={
          <>
            <button className="btn btn-outline" onClick={closeModal} disabled={saving}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving…' : modal === 'edit' ? 'Update' : 'Add Student'}
            </button>
          </>
        }
      >
        {formErrors.submit && (
          <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 6, fontSize: '0.85rem' }}>
            {formErrors.submit}
          </div>
        )}
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input className={`form-control${formErrors.name ? ' error' : ''}`} name="name" value={form.name} onChange={handleChange} placeholder="Full name" />
            {formErrors.name && <span className="form-error">{formErrors.name}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input className={`form-control${formErrors.email ? ' error' : ''}`} name="email" value={form.email} onChange={handleChange} placeholder="student@example.com" />
            {formErrors.email && <span className="form-error">{formErrors.email}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-control" name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit mobile" maxLength={10} />
          </div>
          <div className="form-group">
            <label className="form-label">Department *</label>
            <select className={`form-control${formErrors.department ? ' error' : ''}`} name="department" value={form.department} onChange={handleChange}>
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Graduation Year *</label>
            <select className="form-control" name="graduationYear" value={form.graduationYear} onChange={handleChange}>
              {GRAD_YEARS.map((y) => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">CGPA</label>
            <input className={`form-control${formErrors.cgpa ? ' error' : ''}`} name="cgpa" type="number" step="0.1" min="0" max="10" value={form.cgpa} onChange={handleChange} placeholder="e.g. 8.5" />
            {formErrors.cgpa && <span className="form-error">{formErrors.cgpa}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">10th %</label>
            <input className="form-control" name="tenthPercent" type="number" min="0" max="100" value={form.tenthPercent} onChange={handleChange} placeholder="e.g. 85" />
          </div>
          <div className="form-group">
            <label className="form-label">12th %</label>
            <input className="form-control" name="twelfthPercent" type="number" min="0" max="100" value={form.twelfthPercent} onChange={handleChange} placeholder="e.g. 80" />
          </div>
          <div className="form-group">
            <label className="form-label">Placement Status</label>
            <select className="form-control" name="placementStatus" value={form.placementStatus} onChange={handleChange}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Skills</label>
          <input className="form-control" name="skills" value={form.skills} onChange={handleChange} placeholder="React, Node.js, Python (comma-separated)" />
          <span className="form-hint">Separate skills with commas</span>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Deactivate Student"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm._id)}>Deactivate</button>
          </>
        }>
        <p>Are you sure you want to deactivate <strong>{deleteConfirm?.name}</strong>? This action can be undone by an admin.</p>
      </Modal>
    </div>
  );
}
