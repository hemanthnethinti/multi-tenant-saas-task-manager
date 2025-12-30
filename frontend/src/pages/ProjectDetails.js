import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listTasks, createTask, updateTask, updateTaskStatus, deleteTask, listUsers, listProjects } from '../services/api';
import { useAuth } from '../context/AuthContext';

function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'medium', assigned_to: '', due_date: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const tenantId = user?.tenant?.id;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, usersRes, projectsRes] = await Promise.all([
        listTasks(projectId),
        listUsers(tenantId),
        listProjects()
      ]);
      setTasks(tasksRes.data?.data?.tasks || []);
      setAllUsers(usersRes.data?.data?.users || []);
      const projects = projectsRes.data?.data?.projects || [];
      const proj = projects.find(p => p.id == projectId);
      setProject(proj);
      setError('');
    } catch (e) {
      console.error('Fetch error:', e);
      setError('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId, tenantId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    try {
      if (editingId) {
        await updateTask(editingId, {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : null,
          due_date: formData.due_date
        });
        setSuccessMsg('Task updated successfully');
      } else {
        await createTask(projectId, {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : null,
          due_date: formData.due_date
        });
        setSuccessMsg('Task created successfully');
      }
      setFormData({ title: '', description: '', priority: 'medium', assigned_to: '', due_date: '' });
      setEditingId(null);
      setShowForm(false);
      setError('');
      setTimeout(() => setSuccessMsg(''), 3000);
      await fetchData();
    } catch (e) {
      setError(e.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id, title) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm(`Delete task "${title}"?`)) {
      try {
        await deleteTask(id);
        setSuccessMsg('Task deleted successfully');
        setError('');
        setTimeout(() => setSuccessMsg(''), 3000);
        await fetchData();
      } catch (e) {
        setError('Failed to delete task');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateTaskStatus(id, newStatus);
      await fetchData();
    } catch (e) {
      setError('Failed to update status');
    }
  };

  const handleEdit = (task) => {
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      assigned_to: task.assigned_to || '',
      due_date: task.due_date || ''
    });
    setEditingId(task.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ title: '', description: '', priority: 'medium', assigned_to: '', due_date: '' });
    setError('');
  };

  const getStatusColor = (status) => {
    const colors = {
      'todo': '#999',
      'in_progress': '#ff9800',
      'done': '#4CAF50',
      'completed': '#4CAF50'
    };
    return colors[status] || '#999';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': '#4CAF50',
      'medium': '#ff9800',
      'high': '#f44336'
    };
    return colors[priority] || '#999';
  };

  if (loading) {
    return <div className="page-container"><div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div></div>;
  }

  if (!project) {
    return (
      <div className="page-container">
        <h1>Project Not Found</h1>
        <button className="btn btn-primary" onClick={() => navigate('/projects')}>Back to Projects</button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/projects')} style={{ marginBottom: '1rem' }}>← Back to Projects</button>
        <h1 style={{ margin: '0 0 0.5rem 0' }}>{project.name}</h1>
        <p style={{ margin: 0, color: '#666' }}>{project.description}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Tasks ({tasks.length})</h2>
        {!showForm && (
          <button 
            className="btn btn-primary" 
            onClick={() => { 
              setShowForm(true); 
              setEditingId(null); 
              setFormData({ title: '', description: '', priority: 'medium', assigned_to: '', due_date: '' });
              setError('');
            }}
          >
            + New Task
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
          <h3 style={{ marginTop: 0 }}>{editingId ? 'Edit Task' : 'Create New Task'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Title *</label>
              <input
                type="text"
                placeholder="Task title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Description</label>
              <textarea
                placeholder="Task description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ 
                  padding: '0.75rem', 
                  width: '100%', 
                  minHeight: '80px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '1rem',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  style={{ 
                    padding: '0.75rem', 
                    width: '100%', 
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    fontSize: '1rem'
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Due Date</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  style={{ 
                    padding: '0.75rem', 
                    width: '100%', 
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Assign To</label>
              <select
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                style={{ 
                  padding: '0.75rem', 
                  width: '100%', 
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '1rem'
                }}
              >
                <option value="">Unassigned</option>
                {allUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.fullName || u.full_name || u.email}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary">Save Task</button>
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {tasks.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem 1rem',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px'
        }}>
          <p style={{ color: '#999', marginBottom: '1rem' }}>No tasks yet</p>
          {!showForm && (
            <button 
              className="btn btn-primary"
              onClick={() => { 
                setShowForm(true); 
                setFormData({ title: '', description: '', priority: 'medium', assigned_to: '', due_date: '' });
              }}
            >
              Create First Task
            </button>
          )}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: '#fff',
            borderRadius: '8px',
            border: '1px solid #e0e0e0'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Title</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Priority</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Assignee</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Due Date</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t, idx) => (
                <tr key={t.id} style={{ 
                  borderBottom: '1px solid #e0e0e0',
                  backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f9f9'
                }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 'bold' }}>{t.title}</div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>{t.description}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <select
                      value={t.status}
                      onChange={(e) => handleStatusChange(t.id, e.target.value)}
                      style={{
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        backgroundColor: getStatusColor(t.status),
                        color: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      backgroundColor: getPriorityColor(t.priority),
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem'
                    }}>
                      {t.priority}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {t.assigned_to_name || t.assigned_to_email || '-'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {t.due_date ? new Date(t.due_date).toLocaleDateString() : '-'}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button 
                      className="btn btn-warning" 
                      onClick={() => handleEdit(t)}
                      style={{ marginRight: '0.5rem' }}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => handleDelete(t.id, t.title)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ProjectDetails;
