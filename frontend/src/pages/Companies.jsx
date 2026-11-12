import { useState, useEffect, useCallback } from 'react';
import { getCompanies, createCompany, updateCompany, deleteCompany } from '../api/api';
import { LoadingState, ErrorState, EmptyState } from '../components/States';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';

const EMPTY_FORM = { name: '', industry: '', website: '', description: '', contactEmail: '', contactPerson: '' };

function validate(form) {
  const errs = {};
  if (!form.name.trim()) errs.name = 'Company name is required';
  if (form.contactEmail && !/^\S+@\S+\.\S+$/.test(form.contactEmail)) errs.contactEmail = 'Invalid email';
  return errs;
}

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchCompanies = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const res = await getCompanies(params);
      setCompanies(res.data.data);
      setPagination(res.data.pagination);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  const openAdd = () => { setForm(EMPTY_FORM); setFormErrors({}); setEditing(null); setModal('form'); };
  const openEdit = (c) => { setForm({ name: c.name, industry: c.industry || '', website: c.website || '', description: c.description || '', contactEmail: c.contactEmail || '', contactPerson: c.contactPerson || '' }); setFormErrors({}); setEditing(c); setModal('form'); };
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
      if (editing) await updateCompany(editing._id, form);
      else await createCompany(form);
      closeModal();
      fetchCompanies();
    } catch (e) {
      setFormErrors({ submit: e.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCompany(id);
      setDeleteConfirm(null);
      fetchCompanies();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Companies</h1>
          <p>Manage recruiting companies and their details</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>＋ Add Company</button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body" style={{ paddingTop: 14, paddingBottom: 14 }}>
          <div className="filter-row">
            <div className="search-bar" style={{ flex: '1 1 220px', maxWidth: 360 }}>
              <span className="search-icon">🔍</span>
              <input placeholder="Search by name or industry…" value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            {search && (
              <button className="btn btn-outline btn-sm" onClick={() => { setSearch(''); setPage(1); }}>Clear</button>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={fetchCompanies} /> : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Company</th><th>Industry</th><th>Contact Person</th><th>Contact Email</th><th>Website</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {companies.length === 0 ? (
                    <tr><td colSpan={6}>
                      <EmptyState icon="🏢" title="No companies found" description="Add your first company to get started." />
                    </td></tr>
                  ) : companies.map((c) => (
                    <tr key={c._id}>
                      <td><strong>{c.name}</strong></td>
                      <td className="text-muted">{c.industry || '—'}</td>
                      <td>{c.contactPerson || '—'}</td>
                      <td className="text-muted">{c.contactEmail || '—'}</td>
                      <td>
                        {c.website ? (
                          <a href={c.website} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontSize: '0.82rem' }}>Visit ↗</a>
                        ) : '—'}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(c)}>Del</button>
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
        title={editing ? 'Edit Company' : 'Add Company'}
        footer={
          <>
            <button className="btn btn-outline" onClick={closeModal} disabled={saving}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Update' : 'Add Company'}
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
            <label className="form-label">Company Name *</label>
            <input className={`form-control${formErrors.name ? ' error' : ''}`} name="name" value={form.name} onChange={handleChange} placeholder="TechSoft Solutions" />
            {formErrors.name && <span className="form-error">{formErrors.name}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Industry</label>
            <input className="form-control" name="industry" value={form.industry} onChange={handleChange} placeholder="Software, Fintech…" />
          </div>
          <div className="form-group">
            <label className="form-label">Contact Person</label>
            <input className="form-control" name="contactPerson" value={form.contactPerson} onChange={handleChange} placeholder="HR Manager name" />
          </div>
          <div className="form-group">
            <label className="form-label">Contact Email</label>
            <input className={`form-control${formErrors.contactEmail ? ' error' : ''}`} name="contactEmail" value={form.contactEmail} onChange={handleChange} placeholder="hr@company.com" />
            {formErrors.contactEmail && <span className="form-error">{formErrors.contactEmail}</span>}
          </div>
          <div className="form-group" style={{ gridColumn: '1/-1' }}>
            <label className="form-label">Website</label>
            <input className="form-control" name="website" value={form.website} onChange={handleChange} placeholder="https://company.com" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-control" name="description" value={form.description} onChange={handleChange}
            placeholder="Brief description of the company…" rows={3} style={{ resize: 'vertical' }} />
        </div>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Remove Company"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm._id)}>Remove</button>
          </>
        }>
        <p>Are you sure you want to remove <strong>{deleteConfirm?.name}</strong>?</p>
      </Modal>
    </div>
  );
}
