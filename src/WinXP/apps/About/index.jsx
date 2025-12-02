import React, { useState } from 'react';
import styled from 'styled-components';
import { useConfig } from '../../../contexts/ConfigContext';
import { ProgramLayout } from '../../../components';

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

function About({ onClose, onMinimize, onMaximize, isFocus }) {
  const {
    getSocialLinks,
    getSkills,
    getSoftware,
    getAboutContent,
    isFeatureEnabled,
    getDisplayName,
  } = useConfig();

  const [expandedCards, setExpandedCards] = useState({
    social: true,
    skills: true,
    software: true,
  });

  const socialLinks = getSocialLinks();
  const skills = getSkills();
  const software = getSoftware();
  const aboutContent = getAboutContent();
  const displayName = getDisplayName();

  const showSocial = isFeatureEnabled('SHOW_SOCIAL_IN_ABOUT');
  const showSkills = isFeatureEnabled('SHOW_SKILLS_IN_ABOUT');
  const showSoftware = isFeatureEnabled('SHOW_SOFTWARE_IN_ABOUT');

  const toggleCard = (cardName) => {
    setExpandedCards((prev) => ({
      ...prev,
      [cardName]: !prev[cardName],
    }));
  };

  const handleSocialClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

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
          <LeftPanel>
            {showSocial && socialLinks.length > 0 && (
              <Card className={expandedCards.social ? '' : 'collapsed'} $isSocial>
                <CardHeader $isSocial onClick={() => toggleCard('social')}>
                  <span>Social Links</span>
                  <img
                    src={
                      expandedCards.social
                        ? '/apps/about/pullup-alt.webp'
                        : '/apps/about/pulldown-alt.webp'
                    }
                    alt=""
                  />
                </CardHeader>
                <CardContent>
                  <CardContentInner>
                    {socialLinks.map((social) => (
                      <CardRow
                        key={social.network}
                        as="a"
                        href={social.url}
                        onClick={(e) => {
                          e.preventDefault();
                          handleSocialClick(social.url);
                        }}
                      >
                        <img
                          src={
                            SOCIAL_ICONS[social.network.toLowerCase()] ||
                            '/icons/cmd.webp'
                          }
                          alt={social.network}
                        />
                        <span>{social.network}</span>
                      </CardRow>
                    ))}
                  </CardContentInner>
                </CardContent>
              </Card>
            )}

            {showSkills && skills.length > 0 && (
              <Card className={expandedCards.skills ? '' : 'collapsed'}>
                <CardHeader onClick={() => toggleCard('skills')}>
                  <span>Skills</span>
                  <img
                    src={
                      expandedCards.skills
                        ? '/apps/about/pullup.webp'
                        : '/apps/about/pulldown.webp'
                    }
                    alt=""
                  />
                </CardHeader>
                <CardContent>
                  <CardContentInner>
                    {skills.map((skill, index) => (
                      <CardRow key={skill}>
                        <img
                          src={SKILL_ICONS[index % SKILL_ICONS.length]}
                          alt=""
                        />
                        <span>{skill}</span>
                      </CardRow>
                    ))}
                  </CardContentInner>
                </CardContent>
              </Card>
            )}

            {showSoftware && software.length > 0 && (
              <Card className={expandedCards.software ? '' : 'collapsed'}>
                <CardHeader onClick={() => toggleCard('software')}>
                  <span>Software</span>
                  <img
                    src={
                      expandedCards.software
                        ? '/apps/about/pullup.webp'
                        : '/apps/about/pulldown.webp'
                    }
                    alt=""
                  />
                </CardHeader>
                <CardContent>
                  <CardContentInner>
                    {software.map((item, index) => (
                      <CardRow key={item}>
                        <img src="/apps/about/creative-cloud.webp" alt="" />
                        <span>{item}</span>
                      </CardRow>
                    ))}
                  </CardContentInner>
                </CardContent>
              </Card>
            )}
          </LeftPanel>
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
  background-image: url('/gui/bgs/aboutbg.webp');
  background-position: bottom;
  background-repeat: no-repeat;
  background-size: cover;
  background-attachment: fixed;
  font-family: Tahoma, Arial, sans-serif;
`;

const LeftPanel = styled.aside`
  background: linear-gradient(180deg, #748aff 0%, #4057d3 100%);
  width: 190px;
  min-width: 190px;
  max-width: 190px;
  flex-shrink: 0;
  height: 100%;
  padding: 0;
  position: relative;
  z-index: 1;
  overflow-y: auto;

  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    width: 1px;
    height: 100%;
    background: linear-gradient(180deg, #fff 0%, transparent 70%);
    transform: scaleX(0.8);
    transform-origin: right;
    pointer-events: none;
    z-index: 2;
  }
`;

const Card = styled.div`
  margin: 0 auto;
  width: calc(92% - 6px);
  max-width: calc(95% - 6px);
  padding-top: 14px;
  overflow: hidden;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;

  &:first-child {
    padding-top: 20px;
  }

  &.collapsed .card-content {
    max-height: 0;
    opacity: 0;
    padding: 0;
    pointer-events: none;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  height: 23px;
  padding: 0 8px 0 10px;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  background: ${(props) =>
    props.$isSocial
      ? 'linear-gradient(90deg, #0059ce 0%, #2e9aff 100%)'
      : 'linear-gradient(90deg, #fff 0%, #f0f0ff 50%, #c2d4ec 100%)'};
  cursor: pointer;

  span {
    flex: 1;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.2px;
    color: ${(props) => (props.$isSocial ? '#fff' : '#0c327d')};
  }

  img {
    width: 13px;
    height: 13px;
    filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.5));
    transition: filter 0.1s ease, transform 0.05s ease;

    &:hover {
      filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.5)) brightness(1.2);
    }

    &:active {
      filter: drop-shadow(0 0 0 rgba(0, 0, 0, 0.4)) brightness(1.1);
      transform: translate(0.5px, 0.5px);
    }
  }
`;

const CardContent = styled.div.attrs({ className: 'card-content' })`
  background: #c2d4ec;
  border: 1.5px solid #fff;
  border-top: none;
  max-height: 1000px;
  opacity: 1;
  overflow: hidden;
  transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s;
`;

const CardContentInner = styled.div`
  padding: 5px 10px;
`;

const CardRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2px;
  text-decoration: none;
  color: inherit;

  &:hover span {
    text-decoration: underline;
  }

  img {
    width: 13px;
    height: 13px;
    margin-right: 6px;
  }

  span {
    font-size: 10px;
    line-height: 14px;
    color: #0c327d;
  }
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
