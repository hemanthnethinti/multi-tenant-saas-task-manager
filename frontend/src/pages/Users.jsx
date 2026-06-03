import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { listUsers, addUser, updateUser, deleteUser } from '../services/api';

function Users() {
  const { user } = useAuth();
  const tenantId = user?.tenant?.id;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ email: '', fullName: '', password: '', role: 'user' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchUsers = async () => {
    if (!tenantId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await listUsers(tenantId);
      setUsers(res.data?.data?.users || []);
      setError('');
    } catch (e) {
      console.error('Users fetch error:', e);
      setError('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [tenantId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.fullName) {
      setError('Email and name are required');
      return;
    }
    if (!editingId && !formData.password) {
      setError('Password is required for new users');
      return;
    }
    try {
      if (editingId) {
        await updateUser(editingId, { fullName: formData.fullName, role: formData.role });
        setSuccessMsg('User updated successfully');
      } else {
        await addUser(tenantId, { email: formData.email, fullName: formData.fullName, password: formData.password, role: formData.role });
        setSuccessMsg('User added successfully');
      }
      setFormData({ email: '', fullName: '', password: '', role: 'user' });
      setEditingId(null);
      setShowForm(false);
      setError('');
      setTimeout(() => setSuccessMsg(''), 3000);
      await fetchUsers();
    } catch (e) {
      setError(e.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id, name) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm(`Are you sure you want to remove "${name}"?`)) {
      try {
        await deleteUser(id);
        setSuccessMsg('User removed successfully');
        setError('');
        setTimeout(() => setSuccessMsg(''), 3000);
        await fetchUsers();
      } catch (e) {
        setError('Failed to remove user');
      }
    }
  };

  const handleEdit = (usr) => {
    setFormData({ email: usr.email, fullName: usr.fullName || usr.full_name, password: '', role: usr.role });
    setEditingId(usr.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ email: '', fullName: '', password: '', role: 'user' });
    setError('');
  };

  if (!tenantId) {
    return (
      <div className="page-container">
        <h1>Users</h1>
        <div className="alert alert-info">Users are managed within a tenant context.</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0' }}>Users</h1>
          <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Manage team members</p>
        </div>
        {!showForm && (
          <button 
            className="btn btn-primary" 
            onClick={() => { 
              setShowForm(true); 
              setEditingId(null); 
              setFormData({ email: '', fullName: '', password: '', role: 'user' });
              setError('');
            }}
          >
            + Add User
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {showForm && (
        <div style={{ 
          backgroundColor: '#f9f9f9', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          marginBottom: '2rem',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ marginTop: 0 }}>{editingId ? 'Edit User' : 'Add New User'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Full Name *</label>
              <input
                type="text"
                placeholder="Enter full name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                style={{ 
                  padding: '0.75rem', 
                  width: '100%', 
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Email *</label>
              <input
                type="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={editingId}
                style={{ 
                  padding: '0.75rem', 
                  width: '100%', 
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '1rem',
                  backgroundColor: editingId ? '#f5f5f5' : 'white'
                }}
              />
            </div>
            {!editingId && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Password *</label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  style={{ 
                    padding: '0.75rem', 
                    width: '100%', 
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    fontSize: '1rem'
                  }}
                />
              </div>
            )}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                style={{ 
                  padding: '0.75rem', 
                  width: '100%', 
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '1rem'
                }}
              >
                <option value="user">User</option>
                <option value="tenant_admin">Tenant Admin</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary">Save User</button>
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>Loading users...</div>
      ) : users.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem 1rem',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px'
        }}>
          <p style={{ color: '#999', marginBottom: '1rem' }}>No users found</p>
          {!showForm && (
            <button 
              className="btn btn-primary"
              onClick={() => { 
                setShowForm(true); 
                setFormData({ email: '', fullName: '', password: '', role: 'user' });
              }}
            >
              Add First User
            </button>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem'
        }}>
          {users.map(usr => (
            <div key={usr.id} style={{
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              backgroundColor: '#fff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: '#007bff',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  marginRight: '1rem'
                }}>
                  {(usr.fullName || usr.full_name || usr.email).charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0, marginBottom: '0.25rem' }}>{usr.fullName || usr.full_name}</h3>
                  <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{usr.email}</p>
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{
                  backgroundColor: usr.role === 'tenant_admin' ? '#ff9800' : '#2196f3',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.85rem'
                }}>
                  {usr.role}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn btn-warning" 
                  onClick={() => handleEdit(usr)}
                  style={{ flex: 1 }}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={() => handleDelete(usr.id, usr.fullName || usr.full_name)}
                  style={{ flex: 1 }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Users;
