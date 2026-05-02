import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectAPI, taskAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import '../styles/project.css';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', dueDate: '' });

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        projectAPI.getById(projectId),
        taskAPI.list(projectId)
      ]);
      setProject(projectRes.data.project);
      setTasks(tasksRes.data.tasks || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch project');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await taskAPI.create({ ...newTask, projectId });
      setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
      setShowNewTask(false);
      fetchProjectData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      await taskAPI.update(taskId, updates);
      fetchProjectData();
    } catch (err) {
      setError('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (confirm('Are you sure?')) {
      try {
        await taskAPI.delete(taskId);
        fetchProjectData();
      } catch (err) {
        setError('Failed to delete task');
      }
    }
  };

  const isAdmin = project?.adminId === user?.id;

  if (loading) return <div className="loading">Loading...</div>;
  if (!project) return <div className="error-message">Project not found</div>;

  return (
    <div className="project-detail">
      <div className="project-header-section">
        <button onClick={() => navigate('/dashboard')} className="btn-back">← Back</button>
        <h1>{project.name}</h1>
        <p>{project.description}</p>
      </div>

      <div className="project-content">
        <div className="left-panel">
          <div className="tasks-section">
            <div className="section-header">
              <h2>Tasks</h2>
              {isAdmin && (
                <button 
                  onClick={() => setShowNewTask(!showNewTask)}
                  className="btn-primary"
                >
                  + New Task
                </button>
              )}
            </div>

            {error && <div className="error-message">{error}</div>}

            {showNewTask && (
              <div className="new-task-form">
                <form onSubmit={handleCreateTask}>
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={newTask.title}
                      onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Task title"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={newTask.description}
                      onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Task description"
                    ></textarea>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Priority</label>
                      <select
                        value={newTask.priority}
                        onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Due Date</label>
                      <input
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-primary">Create Task</button>
                    <button 
                      type="button" 
                      onClick={() => setShowNewTask(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="tasks-list">
              {tasks.length === 0 ? (
                <p className="no-tasks">No tasks yet</p>
              ) : (
                tasks.map(task => (
                  <div key={task.id} className={`task-item ${task.status}`}>
                    <div className="task-content">
                      <h4>{task.title}</h4>
                      <p>{task.description}</p>
                      <div className="task-meta">
                        <span className={`priority ${task.priority}`}>
                          {task.priority.toUpperCase()}
                        </span>
                        <span className="status">{task.status.replace('_', ' ')}</span>
                        {task.dueDate && <span className="due-date">📅 {new Date(task.dueDate).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="task-actions">
                        <select
                          value={task.status}
                          onChange={(e) => handleUpdateTask(task.id, { status: e.target.value })}
                          className="status-select"
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="btn-delete"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="right-panel">
          <div className="team-section">
            <h3>Team Members</h3>
            <div className="members-list">
              {project.members?.map(member => (
                <div key={member.userId} className="member-item">
                  <div>
                    <p className="member-name">{member.user.name}</p>
                    <p className="member-email">{member.user.email}</p>
                  </div>
                  <span className={`member-role ${member.role}`}>{member.role}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="stats-section">
            <h3>Statistics</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-value">{tasks.filter(t => t.status === 'todo').length}</span>
                <span className="stat-label">To Do</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{tasks.filter(t => t.status === 'in_progress').length}</span>
                <span className="stat-label">In Progress</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{tasks.filter(t => t.status === 'completed').length}</span>
                <span className="stat-label">Completed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
