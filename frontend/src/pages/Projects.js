import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listProjects, createProject, updateProject, deleteProject } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await listProjects();
      setProjects(res.data?.data?.projects || []);
      setError('');
    } catch (e) {
      console.error('Projects fetch error:', e);
      setError('Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }
    try {
      if (editingId) {
        await updateProject(editingId, formData);
        setSuccessMsg('Project updated successfully');
      } else {
        await createProject(formData);
        setSuccessMsg('Project created successfully');
      }
      setFormData({ name: '', description: '' });
      setEditingId(null);
      setShowForm(false);
      setError('');
      setTimeout(() => setSuccessMsg(''), 3000);
      await fetchProjects();
    } catch (e) {
      setError(e.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id, name) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteProject(id);
        setSuccessMsg('Project deleted successfully');
        setError('');
        setTimeout(() => setSuccessMsg(''), 3000);
        await fetchProjects();
      } catch (e) {
        setError('Failed to delete project');
      }
    }
  };

  const handleEdit = (project) => {
    setFormData({ name: project.name, description: project.description });
    setEditingId(project.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', description: '' });
    setError('');
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0' }}>Projects</h1>
          <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Manage your projects and tasks</p>
        </div>
        {!showForm && (
          <button 
            className="btn btn-primary" 
            onClick={() => { 
              setShowForm(true); 
              setEditingId(null); 
              setFormData({ name: '', description: '' });
              setError('');
            }}
          >
            + New Project
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
          <h3 style={{ marginTop: 0 }}>{editingId ? 'Edit Project' : 'Create New Project'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Project Name *</label>
              <input
                type="text"
                placeholder="Enter project name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                placeholder="Enter project description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ 
                  padding: '0.75rem', 
                  width: '100%', 
                  minHeight: '100px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '1rem',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary">Save Project</button>
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>Loading projects...</div>
      ) : projects.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem 1rem',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px'
        }}>
          <p style={{ color: '#999', marginBottom: '1rem' }}>No projects found</p>
          {!showForm && (
            <button 
              className="btn btn-primary"
              onClick={() => { 
                setShowForm(true); 
                setFormData({ name: '', description: '' });
              }}
            >
              Create First Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid">
          {projects.map(project => (
            <div key={project.id} className="project-card" style={{
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              backgroundColor: '#fff'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>{project.name}</h3>
              <p style={{ color: '#666', marginBottom: '1rem' }}>{project.description || 'No description'}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span className="status-badge" style={{ 
                  backgroundColor: project.status === 'active' ? '#4CAF50' : '#f44336',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.85rem'
                }}>
                  {project.status || 'active'}
                </span>
                <span style={{ color: '#999', fontSize: '0.9rem' }}>
                  {project.task_count || 0} tasks
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link to={`/projects/${project.id}`} className="btn btn-secondary" style={{ flex: 1 }}>
                  View Tasks
                </Link>
                <button 
                  className="btn btn-warning" 
                  onClick={() => handleEdit(project)}
                  style={{ flex: 1 }}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={() => handleDelete(project.id, project.name)}
                  style={{ flex: 1 }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Projects;
