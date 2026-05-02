import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { projectAPI, taskAPI } from '../api/services';
import { useNavigate } from 'react-router-dom';
import ProjectCard from '../components/ProjectCard';
import '../styles/dashboard.css';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectAPI.list();
      setProjects(response.data.projects || []);
    } catch (err) {
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await projectAPI.create(newProject);
      setNewProject({ name: '', description: '' });
      setShowNewProject(false);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>📊 Task Manager</h1>
          <div className="user-menu">
            <span>Welcome, {user?.name}</span>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-container">
          <div className="dashboard-top">
            <h2>Your Projects</h2>
            <button 
              onClick={() => setShowNewProject(!showNewProject)}
              className="btn-primary"
            >
              + New Project
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {showNewProject && (
            <div className="new-project-form">
              <h3>Create New Project</h3>
              <form onSubmit={handleCreateProject}>
                <div className="form-group">
                  <label>Project Name</label>
                  <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter project name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Project description (optional)"
                  ></textarea>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">Create</button>
                  <button 
                    type="button" 
                    onClick={() => setShowNewProject(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="projects-grid">
            {projects.length === 0 ? (
              <div className="no-projects">
                <p>No projects yet. Create one to get started!</p>
              </div>
            ) : (
              projects.map(project => (
                <ProjectCard 
                  key={project.id} 
                  project={project}
                  onNavigate={() => navigate(`/project/${project.id}`)}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
