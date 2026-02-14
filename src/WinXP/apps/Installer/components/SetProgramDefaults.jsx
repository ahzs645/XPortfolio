import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { withBaseUrl } from '../../../../utils/baseUrl';
import {
  ContentArea,
  ContentHeader,
  ScrollContent,
  Section,
  SectionIcon,
  SectionContent,
  SectionTitle,
  SectionDesc,
  SettingsGroup,
  SettingsGroupHeader,
  SettingsGroupIcon,
  SettingsGroupTitle,
  SettingsGroupContent,
  SettingsRow,
  SettingsLabel,
  SettingsValue,
  Select,
  Button,
  StatusMessage,
  StatusIcon,
  FileTypeIcon,
  FileTypeLabel,
} from './styles';

// Default program categories and their file types
const PROGRAM_CATEGORIES = {
  browser: {
    title: 'Web Browser',
    icon: '/icons/xp/InternetExplorer6.png',
    description: 'Choose the default program for browsing the web',
    fileTypes: ['.html', '.htm', '.url'],
    builtIn: ['Internet Explorer'],
  },
  textEditor: {
    title: 'Text Editor',
    icon: '/icons/xp/Notepad.png',
    description: 'Choose the default program for text files',
    fileTypes: ['.txt', '.log', '.md', '.json', '.js', '.jsx', '.ts', '.tsx', '.css', '.xml'],
    builtIn: ['Notepad'],
  },
  mediaPlayer: {
    title: 'Media Player',
    icon: '/icons/xp/WindowsMediaPlayer9.png',
    description: 'Choose the default program for audio and video',
    fileTypes: ['.mp3', '.wav', '.ogg', '.mp4', '.webm', '.avi', '.mkv'],
    builtIn: ['Windows Media Player', 'Winamp'],
  },
  imageViewer: {
    title: 'Image Viewer',
    icon: '/icons/xp/WindowsPictureandFaxViewer.png',
    description: 'Choose the default program for pictures',
    fileTypes: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.ico'],
    builtIn: ['Image Viewer', 'Paint'],
  },
  archiver: {
    title: 'Archive Handler',
    icon: '/icons/xp/Zipfolder.png',
    description: 'Choose the default program for compressed files',
    fileTypes: ['.zip', '.rar', '.7z', '.tar', '.gz'],
    builtIn: ['WinRAR'],
  },
  fontViewer: {
    title: 'Font Viewer',
    icon: '/icons/xp/font.png',
    description: 'Choose the default program for font files',
    fileTypes: ['.ttf', '.otf', '.woff', '.woff2', '.fon'],
    builtIn: ['Font Viewer'],
  },
};

// File type icons mapping
const FILE_TYPE_ICONS = {
  '.html': '/icons/xp/InternetShortcut.png',
  '.htm': '/icons/xp/InternetShortcut.png',
  '.url': '/icons/xp/URL.png',
  '.txt': '/icons/xp/GenericTextDocument.png',
  '.log': '/icons/xp/GenericTextDocument.png',
  '.md': '/icons/xp/GenericTextDocument.png',
  '.json': '/icons/xp/GenericTextDocument.png',
  '.js': '/icons/xp/GenericTextDocument.png',
  '.jsx': '/icons/xp/GenericTextDocument.png',
  '.ts': '/icons/xp/GenericTextDocument.png',
  '.tsx': '/icons/xp/GenericTextDocument.png',
  '.css': '/icons/xp/GenericTextDocument.png',
  '.xml': '/icons/xp/GenericTextDocument.png',
  '.mp3': '/icons/xp/WindowsMediaPlayer9.png',
  '.wav': '/icons/xp/WindowsMediaPlayer9.png',
  '.ogg': '/icons/xp/WindowsMediaPlayer9.png',
  '.mp4': '/icons/xp/WMV.png',
  '.webm': '/icons/xp/WMV.png',
  '.avi': '/icons/xp/WMV.png',
  '.mkv': '/icons/xp/WMV.png',
  '.jpg': '/icons/xp/JPG.png',
  '.jpeg': '/icons/xp/JPG.png',
  '.png': '/icons/xp/Bitmap.png',
  '.gif': '/icons/xp/Bitmap.png',
  '.bmp': '/icons/xp/Bitmap.png',
  '.webp': '/icons/xp/Bitmap.png',
  '.svg': '/icons/xp/Bitmap.png',
  '.ico': '/icons/xp/Bitmap.png',
  '.zip': '/icons/xp/Zipfolder.png',
  '.rar': '/icons/xp/RAR.png',
  '.7z': '/icons/xp/Zipfolder.png',
  '.tar': '/icons/xp/Zipfolder.png',
  '.ttf': '/icons/xp/font.png',
  '.otf': '/icons/xp/font.png',
  '.woff': '/icons/xp/font.png',
  '.woff2': '/icons/xp/font.png',
  '.fon': '/icons/xp/font.png',
  '.gz': '/icons/xp/Zipfolder.png',
};

const STORAGE_KEY = 'xportfolio-program-defaults';

const ExpandIcon = styled.span`
  font-size: 10px;
  color: #666;
`;

const FileTypeRow = styled.div`
  display: flex;
  align-items: center;
  padding: 4px 0;
  gap: 8px;

  &:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
  }
`;

const FileTypeExt = styled.span`
  font-family: 'Consolas', monospace;
  font-size: 11px;
  color: #003399;
  width: 50px;
`;

const CurrentProgram = styled.span`
  font-size: 11px;
  color: #333;
  flex: 1;
`;

const SavedMessage = styled.div`
  position: fixed;
  bottom: 60px;
  right: 20px;
  background: #f0fff0;
  border: 1px solid #ccffcc;
  color: #008000;
  padding: 8px 16px;
  border-radius: 3px;
  font-size: 11px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  animation: fadeInOut 2s ease-in-out;

  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateY(10px); }
    15% { opacity: 1; transform: translateY(0); }
    85% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-10px); }
  }
`;

function SetProgramDefaults({ installedApps }) {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [defaults, setDefaults] = useState({});
  const [fileAssociations, setFileAssociations] = useState({});
  const [showSaved, setShowSaved] = useState(false);

  // Load saved defaults from localStorage
  /* eslint-disable react-hooks/set-state-in-effect -- load persisted settings from localStorage */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setDefaults(parsed.defaults || {});
        setFileAssociations(parsed.fileAssociations || {});
      }
    } catch (e) {
      console.error('Failed to load program defaults:', e);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Save defaults to localStorage
  const saveDefaults = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        defaults,
        fileAssociations,
      }));
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    } catch (e) {
      console.error('Failed to save program defaults:', e);
    }
  };

  // Get available programs for a category
  const getAvailablePrograms = (category) => {
    const cat = PROGRAM_CATEGORIES[category];
    const builtIn = cat.builtIn || [];

    // Filter installed apps that might handle these file types
    const installed = installedApps
      .filter(app => app.manifest?.fileTypes?.some(ft => cat.fileTypes.includes(ft)))
      .map(app => app.name);

    return [...new Set([...builtIn, ...installed])];
  };

  // Get all available programs for a file type
  const getProgramsForFileType = (fileType) => {
    const programs = new Set();

    Object.entries(PROGRAM_CATEGORIES).forEach(([, cat]) => {
      if (cat.fileTypes.includes(fileType)) {
        cat.builtIn.forEach(p => programs.add(p));
      }
    });

    // Add installed apps that support this file type
    installedApps
      .filter(app => app.manifest?.fileTypes?.includes(fileType))
      .forEach(app => programs.add(app.name));

    return Array.from(programs);
  };

  // Handle category default change
  const handleCategoryChange = (category, program) => {
    const newDefaults = { ...defaults, [category]: program };
    setDefaults(newDefaults);

    // Also update all file associations for this category
    const cat = PROGRAM_CATEGORIES[category];
    const newAssociations = { ...fileAssociations };
    cat.fileTypes.forEach(ft => {
      newAssociations[ft] = program;
    });
    setFileAssociations(newAssociations);
  };

  // Handle individual file type change
  const handleFileTypeChange = (fileType, program) => {
    setFileAssociations({ ...fileAssociations, [fileType]: program });
  };

  return (
    <ContentArea>
      <ContentHeader>
        <span>Set program access and computer defaults</span>
        <Button onClick={saveDefaults}>Save Changes</Button>
      </ContentHeader>

      <ScrollContent>
        <Section>
          <SectionIcon src={withBaseUrl('/icons/xp/programs/defaults.png')} alt="" />
          <SectionContent>
            <SectionTitle>Choose Default Programs</SectionTitle>
            <SectionDesc>
              Configure which programs are used to open different types of files.
              Click a category to expand and customize individual file type associations.
            </SectionDesc>
          </SectionContent>
        </Section>

        <StatusMessage $info style={{ marginBottom: '16px' }}>
          <StatusIcon src={withBaseUrl('/icons/xp/HelpandSupport.png')} alt="" />
          Changes will take effect immediately for new file operations. Desktop icons and file explorer will use these defaults.
        </StatusMessage>

        {Object.entries(PROGRAM_CATEGORIES).map(([key, category]) => (
          <SettingsGroup key={key}>
            <SettingsGroupHeader onClick={() => setExpandedCategory(expandedCategory === key ? null : key)}>
              <SettingsGroupIcon src={withBaseUrl(category.icon)} alt="" />
              <SettingsGroupTitle>{category.title}</SettingsGroupTitle>
              <Select
                value={defaults[key] || category.builtIn[0] || ''}
                onChange={(e) => {
                  e.stopPropagation();
                  handleCategoryChange(key, e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {getAvailablePrograms(key).map(prog => (
                  <option key={prog} value={prog}>{prog}</option>
                ))}
              </Select>
              <ExpandIcon>{expandedCategory === key ? '▼' : '▶'}</ExpandIcon>
            </SettingsGroupHeader>

            {expandedCategory === key && (
              <SettingsGroupContent>
                <p style={{ fontSize: '11px', color: '#666', marginTop: 0, marginBottom: '12px' }}>
                  {category.description}
                </p>

                {category.fileTypes.map(fileType => (
                  <FileTypeRow key={fileType}>
                    <FileTypeIcon
                      src={withBaseUrl(FILE_TYPE_ICONS[fileType] || '/icons/xp/Default.png')}
                      alt=""
                    />
                    <FileTypeExt>{fileType}</FileTypeExt>
                    <CurrentProgram>Opens with:</CurrentProgram>
                    <Select
                      value={fileAssociations[fileType] || defaults[key] || category.builtIn[0] || ''}
                      onChange={(e) => handleFileTypeChange(fileType, e.target.value)}
                      style={{ width: '140px' }}
                    >
                      {getProgramsForFileType(fileType).map(prog => (
                        <option key={prog} value={prog}>{prog}</option>
                      ))}
                    </Select>
                  </FileTypeRow>
                ))}
              </SettingsGroupContent>
            )}
          </SettingsGroup>
        ))}
      </ScrollContent>

      {showSaved && (
        <SavedMessage>
          Settings saved successfully!
        </SavedMessage>
      )}
    </ContentArea>
  );
}

// Export the storage key and a helper to get defaults
export const getProgramDefaults = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load program defaults:', e);
  }
  return { defaults: {}, fileAssociations: {} };
};

export const getDefaultProgramForFile = (filename) => {
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  const { defaults, fileAssociations } = getProgramDefaults();

  // Check file associations first
  if (fileAssociations[ext]) {
    return fileAssociations[ext];
  }

  // Check category defaults
  for (const [key, cat] of Object.entries(PROGRAM_CATEGORIES)) {
    if (cat.fileTypes.includes(ext) && defaults[key]) {
      return defaults[key];
    }
  }

  // Return first built-in program for the category
  for (const [, cat] of Object.entries(PROGRAM_CATEGORIES)) {
    if (cat.fileTypes.includes(ext) && cat.builtIn[0]) {
      return cat.builtIn[0];
    }
  }

  return null;
};

export default SetProgramDefaults;
