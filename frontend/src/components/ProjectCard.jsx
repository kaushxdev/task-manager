import React from 'react';
import '../styles/components.css';

const ProjectCard = ({ project, onNavigate }) => {
  return (
    <div className="project-card" onClick={onNavigate}>
      <div className="project-header">
        <h3>{project.name}</h3>
        <span className={`project-status ${project.status}`}>{project.status}</span>
      </div>
      <p className="project-description">{project.description || 'No description'}</p>
      <div className="project-footer">
        <span className="member-count">👥 {project.members?.length || 0} members</span>
        <span className="task-count">📝 {project.tasks?.length || 0} tasks</span>
      </div>
    </div>
  );
};

export default ProjectCard;
