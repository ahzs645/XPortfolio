import React from 'react';
import styled from 'styled-components';
import { useConfig } from '../../../contexts/ConfigContext';
import { ProgramLayout, TaskPanel } from '../../../components';
import { withBaseUrl } from '../../../utils/baseUrl';

// Social network icon mapping
const SOCIAL_ICONS = {
  linkedin: '/icons/linkedin.webp',
  github: '/icons/github.webp',
  facebook: '/icons/facebook.webp',
  instagram: '/icons/instagram.webp',
};

// Skill icons (cycling through available icons)
const SKILL_ICONS = [
  '/apps/about/skill1.webp',
  '/apps/about/skill2.webp',
  '/apps/about/skill3.webp',
  '/apps/about/skill4.webp',
  '/apps/about/skill5.webp',
];

// Menu configuration for About window
const ABOUT_MENUS = [
  {
    id: 'file',
    label: 'File',
    items: [
      { label: 'Print', disabled: true },
      { label: 'Print Setup', disabled: true },
      { separator: true },
      { label: 'Exit', action: 'exitProgram' },
    ],
  },
  {
    id: 'view',
    label: 'View',
    items: [
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

// Toolbar configuration for About window
const ABOUT_TOOLBAR = [
  { type: 'button', id: 'prev', icon: '/gui/toolbar/back.webp', label: 'Previous', disabled: true, action: 'nav:prev' },
  { type: 'button', id: 'next', icon: '/gui/toolbar/forward.webp', label: 'Next', disabled: true, action: 'nav:next' },
  { type: 'separator' },
  { type: 'button', id: 'projects', icon: '/icons/projects.webp', label: 'My Projects', action: 'openProjects' },
  { type: 'button', id: 'resume', icon: '/icons/resume.webp', label: 'My Resume', action: 'openResume' },
  { type: 'separator' },
  { type: 'button', id: 'folder', icon: '/gui/toolbar/up.webp', disabled: true },
];

function About({ onClose, onMinimize, onMaximize }) {
  const {
    getSocialLinks,
    getSkills,
    getSoftware,
    getAboutContent,
    isFeatureEnabled,
    getDisplayName,
  } = useConfig();

  const socialLinks = getSocialLinks();
  const skills = getSkills();
  const software = getSoftware();
  const aboutContent = getAboutContent();
  const displayName = getDisplayName();

  const showSocial = isFeatureEnabled('SHOW_SOCIAL_IN_ABOUT');
  const showSkills = isFeatureEnabled('SHOW_SKILLS_IN_ABOUT');
  const showSoftware = isFeatureEnabled('SHOW_SOFTWARE_IN_ABOUT');

  const handleToolbarAction = (action) => {
    // Handle custom toolbar actions here
    console.log('Toolbar action:', action);
    // You can dispatch events to open other apps, etc.
  };

  // Check if any sidebar content should be shown
  const hasSidebarContent =
    (showSocial && socialLinks.length > 0) ||
    (showSkills && skills.length > 0) ||
    (showSoftware && software.length > 0);

  return (
    <ProgramLayout
      windowActions={{ onClose, onMinimize, onMaximize }}
      menus={ABOUT_MENUS}
      menuLogo="/gui/toolbar/barlogo.webp"
      toolbarItems={ABOUT_TOOLBAR}
      onToolbarAction={handleToolbarAction}
      addressTitle="About Me"
      addressIcon="/icons/about.webp"
      statusFields={`Learn more about ${displayName || 'me'}`}
    >
      <Container>
        {hasSidebarContent && (
          <TaskPanel>
            {showSocial && socialLinks.length > 0 && (
              <TaskPanel.Section title="Social Links" variant="primary">
                {socialLinks.map((social) => (
                  <TaskPanel.Link
                    key={social.network}
                    icon={SOCIAL_ICONS[social.network.toLowerCase()] || '/icons/cmd.webp'}
                    href={social.url}
                  >
                    {social.network}
                  </TaskPanel.Link>
                ))}
              </TaskPanel.Section>
            )}

            {showSkills && skills.length > 0 && (
              <TaskPanel.Section title="Skills">
                {skills.map((skill, index) => (
                  <TaskPanel.Text
                    key={skill}
                    icon={SKILL_ICONS[index % SKILL_ICONS.length]}
                  >
                    {skill}
                  </TaskPanel.Text>
                ))}
              </TaskPanel.Section>
            )}

            {showSoftware && software.length > 0 && (
              <TaskPanel.Section title="Software">
                {software.map((item) => (
                  <TaskPanel.Text
                    key={item}
                    icon="/apps/about/creative-cloud.webp"
                  >
                    {item}
                  </TaskPanel.Text>
                ))}
              </TaskPanel.Section>
            )}
          </TaskPanel>
        )}

        <ScrollContent>
          <Main>
            <WelcomeText>About Me</WelcomeText>
            <SectionText dangerouslySetInnerHTML={{ __html: aboutContent.html }} />
          </Main>
        </ScrollContent>
      </Container>
    </ProgramLayout>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  background-image: url(${withBaseUrl('/gui/bgs/aboutbg.webp')});
  background-position: bottom;
  background-repeat: no-repeat;
  background-size: cover;
  background-attachment: fixed;
  font-family: Tahoma, Arial, sans-serif;
`;

const ScrollContent = styled.div`
  flex: 1;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
`;

const Main = styled.main`
  padding: 24px 36px;
  max-width: 700px;
`;

const WelcomeText = styled.h3`
  font-size: 30px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 24px 0;
  text-shadow: 1px 1px 0 #000, 0 0 1px #000;
  letter-spacing: 0.5px;
  line-height: 1;
`;

const SectionText = styled.div`
  color: #fff;
  font-size: 15.5px;
  font-weight: 400;
  line-height: 1.35;
  text-shadow: 1px 1px 0 #000, 0 0 1px #000;

  p {
    margin: 0 0 18px 0;
  }

  a {
    color: inherit;
    text-decoration: underline;
  }

  h1,
  h2,
  h3 {
    color: #fff;
    font-weight: 700;
    line-height: 1.2;
    margin: 24px 0 16px 0;
    text-shadow: 1px 1px 0 #000, 0 0 1px #000;
  }

  h1 {
    font-size: 28px;
  }

  h2 {
    font-size: 22px;
  }

  h3 {
    font-size: 18px;
  }

  ul {
    margin: 16px 0;
    padding-left: 24px;
  }

  li {
    margin-bottom: 8px;
    line-height: 1.4;
  }

  hr {
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.3);
    margin: 24px 0;
  }
`;

export default About;
