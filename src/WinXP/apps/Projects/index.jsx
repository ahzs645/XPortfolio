import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { ProgramLayout } from '../../../components';
import { useConfig } from '../../../contexts/ConfigContext';
import { withBaseUrl } from '../../../utils/baseUrl';

// Menu configuration for Projects window
const PROJECTS_MENUS = [
  {
    id: 'file',
    label: 'File',
    items: [
      { label: 'Exit', action: 'exitProgram' },
    ],
  },
  {
    id: 'view',
    label: 'View',
    items: [
      { label: 'Refresh', action: 'refresh' },
      { separator: true },
      { label: 'Maximize', action: 'maximizeWindow' },
      { label: 'Minimize', action: 'minimizeWindow' },
    ],
  },
  {
    id: 'help',
    label: 'Help',
    disabled: true,
  },
];

// Toolbar configuration for Projects window
const PROJECTS_TOOLBAR = [
  { type: 'button', id: 'back', icon: '/gui/toolbar/back.webp', label: 'Back', disabled: true },
  { type: 'button', id: 'forward', icon: '/gui/toolbar/forward.webp', label: 'Forward', disabled: true },
  { type: 'separator' },
  { type: 'button', id: 'refresh', icon: '/gui/toolbar/search.webp', label: 'Refresh', action: 'refresh' },
  { type: 'separator' },
  { type: 'button', id: 'views', icon: '/gui/toolbar/views.webp', label: 'Views', disabled: true },
];

// Sample projects - in production, these would come from a projects.json or ConfigContext
const defaultProjects = [
  {
    id: 1,
    title: 'E-Commerce Platform',
    subtitle: 'Full-stack web application',
    image: '/projects/ecommerce.png',
    workType: 'client',
  },
  {
    id: 2,
    title: 'Task Management App',
    subtitle: 'Productivity tool with React',
    image: '/projects/taskapp.png',
    workType: 'personal',
  },
  {
    id: 3,
    title: 'Weather Dashboard',
    subtitle: 'Real-time weather data',
    image: '/projects/weather.png',
    workType: 'personal',
  },
  {
    id: 4,
    title: 'Chat Application',
    subtitle: 'Real-time messaging',
    image: '/projects/chat.png',
    workType: 'client',
  },
  {
    id: 5,
    title: 'Portfolio Website',
    subtitle: 'Personal branding',
    image: '/projects/portfolio.png',
    workType: 'personal',
  },
  {
    id: 6,
    title: 'Analytics Dashboard',
    subtitle: 'Data visualization',
    image: '/projects/analytics.png',
    workType: 'client',
  },
];

function Projects({ onClose, onMinimize, onMaximize }) {
  const {
    isProjectMarkdownEnabled,
    shouldShowProjectsWithoutMarkdown,
  } = useConfig();

  const [projects, setProjects] = useState(defaultProjects);
  const [hoveredProject, setHoveredProject] = useState(null);

  // Try to load projects from projects.json or markdown files
  const loadProjects = useCallback(async () => {
    const markdownEnabled = isProjectMarkdownEnabled();
    const showWithoutMarkdown = shouldShowProjectsWithoutMarkdown();

    try {
      // First try to load from projects.json
      const response = await fetch(withBaseUrl('/projects.json'));
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          let projectList = data.map((p, i) => ({
            id: i + 1,
            title: p.title || `Project ${i + 1}`,
            subtitle: p.subtitle || p.description || '',
            image: p.images?.[0]?.src || p.image || '/projects/placeholder.png',
            workType: p.workType || 'personal',
            url: p.url,
            github: p.github,
            hasMarkdown: p.hasMarkdown || false,
            markdownFile: p.markdownFile || null,
          }));

          // If markdown is enabled but showWithoutMarkdown is false,
          // filter to only show projects with markdown files
          if (markdownEnabled && !showWithoutMarkdown) {
            projectList = projectList.filter(p => p.hasMarkdown);
          }

          setProjects(projectList);
        }
      }
    } catch {
      console.log('Using default projects');
    }
  }, [isProjectMarkdownEnabled, shouldShowProjectsWithoutMarkdown]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleProjectClick = (project) => {
    if (project.url) {
      window.open(project.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleToolbarAction = useCallback((action) => {
    if (action === 'refresh') {
      loadProjects();
    }
  }, [loadProjects]);

  return (
    <ProgramLayout
      windowActions={{ onClose, onMinimize, onMaximize }}
      menus={PROJECTS_MENUS}
      menuLogo="/gui/toolbar/barlogo.webp"
      toolbarItems={PROJECTS_TOOLBAR}
      onToolbarAction={handleToolbarAction}
      addressTitle="My Projects"
      addressIcon="/icons/projects.webp"
      statusFields={`${projects.length} projects`}
    >
    <Container>
      <BackgroundGradient />
      <BackgroundGrid />
      <MainLayout>
        <GridContainer>
          <ProjectsGrid className="loaded">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                className={hoveredProject === project.id ? 'hover' : ''}
                onMouseEnter={() => setHoveredProject(project.id)}
                onMouseLeave={() => setHoveredProject(null)}
                onClick={() => handleProjectClick(project)}
              >
                <ProjectImage
                  src={withBaseUrl(project.image)}
                  alt={project.title}
                  onError={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, #1a1a2e, #16213e 50%, #0f172a)';
                  }}
                />
                <ProjectOverlay />
                <ProjectText>
                  <ProjectTitle>{project.title}</ProjectTitle>
                  {project.subtitle && (
                    <ProjectSubtitle>{project.subtitle}</ProjectSubtitle>
                  )}
                  <WorkLabel data-work-type={project.workType}>
                    {project.workType === 'client' ? 'Client Work' : 'Personal Project'}
                  </WorkLabel>
                </ProjectText>
              </ProjectCard>
            ))}
          </ProjectsGrid>
        </GridContainer>
      </MainLayout>
    </Container>
    </ProgramLayout>
  );
}

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
  color: #fff;
  user-select: none;
`;

const BackgroundGradient = styled.div`
  position: absolute;
  inset: 0;
  background: radial-gradient(
    1200px 800px at 10% 10%,
    #0f172a 0%,
    #0b1224 40%,
    #090f1f 65%,
    #070c19 100%
  );
  z-index: -1;
  pointer-events: none;
`;

const BackgroundGrid = styled.div`
  position: absolute;
  inset: 0;
  background-image: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.12) 1px,
      transparent 0
    ),
    linear-gradient(180deg, rgba(255, 255, 255, 0.12) 1px, transparent 0);
  background-size: 32px 32px;
  mask-image: radial-gradient(ellipse 80% 80% at 0 0, #000 50%, transparent 90%);
  -webkit-mask-image: radial-gradient(
    ellipse 80% 80% at 0 0,
    #000 50%,
    transparent 90%
  );
  z-index: -1;
  pointer-events: none;
`;

const MainLayout = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 16px;
  position: relative;
  z-index: 10;
  overflow: auto;
`;

const GridContainer = styled.div`
  display: flex;
  flex: 1;
  height: 100%;
  overflow: visible;
`;

const ProjectsGrid = styled.main`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  width: 100%;
  align-content: start;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 8px;
  overflow: auto;

  &.loaded {
    opacity: 1;
  }
`;

const ProjectOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(2px);
  border-radius: inherit;
  opacity: 0;
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
  pointer-events: none;
`;

const ProjectText = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12% 8%;
  text-align: center;
  opacity: 0;
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2;
  pointer-events: none;
`;

const ProjectCard = styled.div`
  position: relative;
  aspect-ratio: 4 / 5;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.45);
  filter: drop-shadow(0 0 6px rgba(59, 130, 246, 0.2))
    drop-shadow(0 0 12px rgba(139, 92, 246, 0.14));
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    filter 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, #1a1a2e, #16213e 50%, #0f172a);

  &.hover {
    transform: scale(1.03);
    border-color: #fff;
    z-index: 20;
    filter: drop-shadow(0 0 0 rgba(0, 0, 0, 0))
      drop-shadow(0 1px 3px rgba(0, 0, 0, 0.25))
      drop-shadow(0 8px 20px rgba(0, 0, 0, 0.6))
      drop-shadow(0 0 10px rgba(59, 130, 246, 0.35))
      drop-shadow(0 0 18px rgba(139, 92, 246, 0.25));

    ${ProjectOverlay}, ${ProjectText} {
      opacity: 1;
    }

    ${ProjectText} {
      pointer-events: auto;
    }
  }
`;

const ProjectImage = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
`;

const ProjectTitle = styled.h3`
  color: #fff;
  font-size: clamp(0.85rem, 2.5vh, 1.4rem);
  font-weight: 800;
  line-height: 1.2;
  margin: 0 0 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const ProjectSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: clamp(0.7rem, 1.6vh, 1rem);
  font-weight: 400;
  line-height: 1.5;
  margin: 0 0 12px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
`;

const WorkLabel = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 5px 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 6px;
  font-size: clamp(10px, 1.2vw, 12px);
  font-weight: 600;
  color: #fff;
  backdrop-filter: blur(2px);
  white-space: nowrap;
  opacity: 0.95;

  &[data-work-type='client'] {
    border-left: 3px solid #74a7ff;
  }

  &[data-work-type='personal'] {
    border-left: 3px solid #9be080;
  }
`;

export default Projects;
