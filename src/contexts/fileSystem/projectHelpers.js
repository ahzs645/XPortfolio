import { XP_ICONS, SYSTEM_IDS } from './constants';

// Helper to convert CV.yaml project to folder-friendly format
export const convertCvProjectToFolderProject = (cvProject) => {
  const id = `project-${cvProject.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;

  // Build description from CV data
  const highlights = cvProject.highlights || [];
  const technologies = highlights.find(h => h.startsWith('Technologies'))?.replace('Technologies - ', '') || '';
  const nonTechHighlights = highlights.filter(h => !h.startsWith('Technologies'));

  // Build formatted text file content
  const divider = '\u2500'.repeat(50);
  let description = '';

  // Header
  description += `${cvProject.name}\n`;
  description += `${'═'.repeat(cvProject.name.length)}\n\n`;

  // Project Info Section
  description += `${divider}\n`;
  description += `  PROJECT INFO\n`;
  description += `${divider}\n\n`;
  description += `  Date:         ${cvProject.date || 'N/A'}\n`;
  if (technologies) {
    description += `  Technologies: ${technologies}\n`;
  }
  if (cvProject.url) {
    description += `  Website:      ${cvProject.url}\n`;
  }
  description += '\n';

  // Summary Section
  description += `${divider}\n`;
  description += `  SUMMARY\n`;
  description += `${divider}\n\n`;
  const summary = cvProject.summary || 'No description available.';
  // Word wrap the summary at ~60 chars
  const words = summary.split(' ');
  let line = '  ';
  for (const word of words) {
    if (line.length + word.length > 62) {
      description += line.trim() + '\n';
      line = '  ' + word + ' ';
    } else {
      line += word + ' ';
    }
  }
  if (line.trim()) {
    description += line.trim() + '\n';
  }
  description += '\n';

  // Highlights Section (if any)
  if (nonTechHighlights.length > 0) {
    description += `${divider}\n`;
    description += `  HIGHLIGHTS\n`;
    description += `${divider}\n\n`;
    for (const highlight of nonTechHighlights) {
      description += `  \u2022 ${highlight}\n`;
    }
    description += '\n';
  }

  // Footer
  description += `${divider}\n`;
  description += `  Double-click Website.url to visit the project\n`;
  description += `${divider}\n`;

  return {
    id,
    title: cvProject.name,
    description,
    url: cvProject.url || null,
  };
};

// Helper to create project folder items
export const createProjectFolderItems = (projects, now) => {
  const projectsFolderId = 'projects-folder';
  const projectItems = {};
  const projectFolderIds = [];

  if (!projects || projects.length === 0) {
    return { projectItems: {}, projectsFolderId: null, projectFolderIds: [] };
  }

  projects.forEach(project => {
    const folderId = project.id;
    const txtFileId = `${project.id}-txt`;
    const urlFileId = `${project.id}-url`;
    const folderChildren = [txtFileId];

    // Create project description text file
    projectItems[txtFileId] = {
      id: txtFileId,
      type: 'file',
      name: 'Project Info.txt',
      basename: 'Project Info',
      ext: '.txt',
      icon: XP_ICONS.notepad,
      parent: folderId,
      size: project.description.length,
      content: project.description,
      dateCreated: now,
      dateModified: now,
    };

    // Create URL shortcut if project has a website
    if (project.url) {
      folderChildren.push(urlFileId);
      projectItems[urlFileId] = {
        id: urlFileId,
        type: 'file',
        name: 'Website.url',
        basename: 'Website',
        ext: '.url',
        icon: '/icons/xp/InternetExplorer6.png',
        parent: folderId,
        size: 50,
        url: project.url,
        dateCreated: now,
        dateModified: now,
      };
    }

    // Create project folder
    projectItems[folderId] = {
      id: folderId,
      type: 'folder',
      name: project.title,
      icon: XP_ICONS.folder,
      parent: projectsFolderId,
      children: folderChildren,
      dateCreated: now,
      dateModified: now,
    };

    projectFolderIds.push(folderId);
  });

  // Create main Projects folder with briefcase icon
  projectItems[projectsFolderId] = {
    id: projectsFolderId,
    type: 'folder',
    name: 'Projects',
    icon: XP_ICONS.briefcase,
    parent: SYSTEM_IDS.DESKTOP,
    children: projectFolderIds,
    dateCreated: now,
    dateModified: now,
  };

  return { projectItems, projectsFolderId, projectFolderIds };
};
