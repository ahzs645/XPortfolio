import React, { useState } from 'react';
import styled from 'styled-components';

const projects = [
  {
    id: 1,
    title: 'E-Commerce Platform',
    description: 'A full-stack e-commerce application with React, Node.js, and MongoDB.',
    tech: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    image: '/projects/ecommerce.png',
    github: 'https://github.com/user/ecommerce',
    demo: 'https://ecommerce-demo.com',
  },
  {
    id: 2,
    title: 'Task Management App',
    description: 'A Trello-like task management application with drag and drop functionality.',
    tech: ['React', 'TypeScript', 'Firebase'],
    image: '/projects/taskapp.png',
    github: 'https://github.com/user/taskapp',
    demo: 'https://taskapp-demo.com',
  },
  {
    id: 3,
    title: 'Weather Dashboard',
    description: 'Real-time weather dashboard with location-based forecasts.',
    tech: ['Vue.js', 'OpenWeather API', 'Chart.js'],
    image: '/projects/weather.png',
    github: 'https://github.com/user/weather',
    demo: 'https://weather-demo.com',
  },
  {
    id: 4,
    title: 'Chat Application',
    description: 'Real-time chat application with WebSocket support.',
    tech: ['React', 'Socket.io', 'Express'],
    image: '/projects/chat.png',
    github: 'https://github.com/user/chat',
    demo: 'https://chat-demo.com',
  },
];

function Projects({ onClose, isFocus }) {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <Container>
      <Sidebar>
        <SidebarTitle>My Projects</SidebarTitle>
        <ProjectList>
          {projects.map((project) => (
            <ProjectItem
              key={project.id}
              $selected={selectedProject?.id === project.id}
              onClick={() => setSelectedProject(project)}
            >
              <ProjectIcon />
              <span>{project.title}</span>
            </ProjectItem>
          ))}
        </ProjectList>
      </Sidebar>
      <MainContent>
        {selectedProject ? (
          <ProjectDetails>
            <ProjectImage src={selectedProject.image} alt={selectedProject.title} />
            <ProjectInfo>
              <ProjectTitle>{selectedProject.title}</ProjectTitle>
              <ProjectDescription>{selectedProject.description}</ProjectDescription>
              <TechStack>
                {selectedProject.tech.map((tech, index) => (
                  <TechTag key={index}>{tech}</TechTag>
                ))}
              </TechStack>
              <ProjectLinks>
                <ProjectLink href={selectedProject.github} target="_blank">
                  View on GitHub
                </ProjectLink>
                <ProjectLink href={selectedProject.demo} target="_blank">
                  Live Demo
                </ProjectLink>
              </ProjectLinks>
            </ProjectInfo>
          </ProjectDetails>
        ) : (
          <EmptyState>
            <h2>Select a project to view details</h2>
            <p>Click on a project from the sidebar to see more information.</p>
          </EmptyState>
        )}
      </MainContent>
    </Container>
  );
}

const Container = styled.div`
  height: 100%;
  display: flex;
  background: #fff;
`;

const Sidebar = styled.div`
  width: 200px;
  background: #f5f5f5;
  border-right: 1px solid #ddd;
  overflow: auto;
`;

const SidebarTitle = styled.h3`
  padding: 15px;
  margin: 0;
  font-size: 14px;
  background: linear-gradient(to bottom, #fff 0%, #e8e8e8 100%);
  border-bottom: 1px solid #ddd;
`;

const ProjectList = styled.div`
  padding: 10px;
`;

const ProjectItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 10px;
  cursor: pointer;
  border-radius: 3px;
  margin-bottom: 5px;
  background: ${({ $selected }) => ($selected ? '#0b61ff' : 'transparent')};
  color: ${({ $selected }) => ($selected ? 'white' : 'inherit')};

  &:hover {
    background: ${({ $selected }) => ($selected ? '#0b61ff' : '#e8e8e8')};
  }

  span {
    font-size: 12px;
  }
`;

const ProjectIcon = styled.div`
  width: 16px;
  height: 16px;
  background: #1e3c72;
  border-radius: 2px;
  margin-right: 8px;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 20px;
  overflow: auto;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  text-align: center;

  h2 {
    margin-bottom: 10px;
    font-size: 18px;
  }

  p {
    font-size: 13px;
  }
`;

const ProjectDetails = styled.div`
  max-width: 600px;
`;

const ProjectImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  background: #e0e0e0;
  border-radius: 5px;
  margin-bottom: 20px;
`;

const ProjectInfo = styled.div``;

const ProjectTitle = styled.h2`
  margin: 0 0 10px;
  font-size: 20px;
  color: #333;
`;

const ProjectDescription = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 15px;
`;

const TechStack = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
`;

const TechTag = styled.span`
  background: #e8f0fe;
  color: #1e3c72;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
`;

const ProjectLinks = styled.div`
  display: flex;
  gap: 10px;
`;

const ProjectLink = styled.a`
  padding: 8px 16px;
  background: #1e3c72;
  color: white;
  text-decoration: none;
  border-radius: 3px;
  font-size: 12px;

  &:hover {
    background: #2a5298;
  }
`;

export default Projects;
