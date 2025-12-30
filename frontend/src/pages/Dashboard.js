import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listProjects, listUsers, listTasks } from '../services/api';

function Dashboard() {
  const { user, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ projects: 0, users: 0, tasks: 0 });
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const tenantId = user?.tenant?.id;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (tenantId) {
          const [projRes, usersRes] = await Promise.all([
            listProjects(),
            listUsers(tenantId)
          ]);
          const projects = projRes.data?.data?.projects || [];
          const users = usersRes.data?.data?.users || [];
          setStats({
            projects: projects.length,
            users: users.length,
            tasks: projects.reduce((sum, p) => sum + (p.task_count || 0), 0)
          });
          setRecentProjects(projects.slice(0, 3));
        }
      } catch (e) {
        console.error('Dashboard stats error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [tenantId]);

  if (!tenantId && !isSuperAdmin) {
    return (
      <div className="page-container">
        <h1>Dashboard</h1>
        <div className="alert alert-info">Select a tenant to view the dashboard.</div>
      </div>
    );
  }

  const planColors = {
    'Free': '#999',
    'Pro': '#2196f3',
    'Enterprise': '#9c27b0'
  };

  const plan = user?.tenant?.subscriptionPlan || 'Free';

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: '0 0 0.5rem 0' }}>Dashboard</h1>
        {user?.tenant && (
          <p style={{ margin: 0, color: '#666', fontSize: '0.95rem' }}>Welcome to <strong>{user.tenant.name}</strong></p>
        )}
      </div>

      {isSuperAdmin && (
        <div className="alert alert-info" style={{ marginBottom: '2rem' }}>
          👤 Logged in as Super Admin
        </div>
      )}

      {tenantId && (
        <>
          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              padding: '1.5rem',
              borderRadius: '8px',
              backgroundColor: '#fff',
              border: '1px solid #e0e0e0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.9rem' }}>Projects</p>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>
                    {loading ? '...' : stats.projects}
                  </div>
                </div>
                <div style={{ fontSize: '2rem' }}>📁</div>
              </div>
            </div>

            <div style={{
              padding: '1.5rem',
              borderRadius: '8px',
              backgroundColor: '#fff',
              border: '1px solid #e0e0e0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.9rem' }}>Users</p>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4CAF50' }}>
                    {loading ? '...' : stats.users}
                  </div>
                </div>
                <div style={{ fontSize: '2rem' }}>👥</div>
              </div>
            </div>

            <div style={{
              padding: '1.5rem',
              borderRadius: '8px',
              backgroundColor: '#fff',
              border: '1px solid #e0e0e0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.9rem' }}>Tasks</p>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff9800' }}>
                    {loading ? '...' : stats.tasks}
                  </div>
                </div>
                <div style={{ fontSize: '2rem' }}>✓</div>
              </div>
            </div>

            <div style={{
              padding: '1.5rem',
              borderRadius: '8px',
              backgroundColor: '#fff',
              border: '1px solid #e0e0e0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.9rem' }}>Plan</p>
                  <div style={{
                    display: 'inline-block',
                    backgroundColor: planColors[plan],
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                  }}>
                    {plan}
                  </div>
                </div>
                <div style={{ fontSize: '2rem' }}>⭐</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            padding: '1.5rem',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9',
            border: '1px solid #e0e0e0',
            marginBottom: '2rem'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Quick Actions</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/projects')}
              >
                📁 View Projects
              </button>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/users')}
              >
                👥 Manage Users
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  const newProjectForm = prompt('Enter project name:');
                  if (newProjectForm) navigate('/projects', { state: { newProject: newProjectForm } });
                }}
              >
                + New Project
              </button>
            </div>
          </div>

          {/* Recent Projects */}
          {recentProjects.length > 0 && (
            <div style={{
              padding: '1.5rem',
              borderRadius: '8px',
              backgroundColor: '#fff',
              border: '1px solid #e0e0e0'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Recent Projects</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '1rem'
              }}>
                {recentProjects.map(project => (
                  <div
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    style={{
                      padding: '1rem',
                      borderRadius: '8px',
                      backgroundColor: '#f5f5f5',
                      border: '1px solid #e0e0e0',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#fff';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f5f5f5';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <h4 style={{ margin: '0 0 0.5rem 0' }}>{project.name}</h4>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      {project.description || 'No description'}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        backgroundColor: project.status === 'active' ? '#4CAF50' : '#999',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem'
                      }}>
                        {project.status}
                      </span>
                      <span style={{ color: '#999', fontSize: '0.85rem' }}>
                        {project.task_count || 0} tasks
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;
