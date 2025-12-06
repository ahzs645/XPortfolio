import React, { useState, useCallback } from 'react';
import styled from 'styled-components';

// Help content topics
const HELP_TOPICS = {
  home: {
    title: 'Help and Support Center',
    content: null, // Home uses special layout
  },
  usercpl_overview: {
    title: 'User Accounts overview',
    content: `
      <h1>User Accounts overview</h1>
      <p>A user account defines the actions a user can perform in Windows. On a stand-alone computer or a computer that is a member of a <span class="term">workgroup</span>, a <span class="term">user account</span> establishes the privileges assigned to each user. On a computer that is part of a network <span class="term">domain</span>, a user must be a member of at least one group. The permissions and rights granted to a group are assigned to its members.</p>

      <h2>User accounts on a computer that is a member of a network domain</h2>
      <div class="note-box">
        <p>You must be logged on as an administrator or a member of the Administrators group to use User Accounts in Control Panel.</p>
        <p>User Accounts allows you to add users to your computer and to add users to a <span class="term">group</span>. In Windows, permissions and <span class="term">user rights</span> usually are granted to groups. By adding a user to a group, you give the <span class="term">user</span> all the permissions and user rights assigned to that group.</p>
        <p>For instance, a member of the Users group can perform most of the tasks necessary to do his or her job, such as logging on to the computer, creating files and folders, running programs, and saving changes to files. However, only a member of the Administrators group can add users to groups, change user passwords, or modify most system settings.</p>
      </div>

      <h2>User Accounts on a computer that is a member of a workgroup or is a stand-alone computer</h2>
      <p>There are two types of user accounts available on your computer: computer administrator and limited. The guest account is available for users with no assigned account on the computer.</p>

      <h3>Computer administrator account</h3>
      <div class="note-box">
        <p>The <span class="term">computer administrator</span> account is intended for someone who can make systemwide changes to the computer, install programs, and access all files on the computer. Only a user with computer administrator account has full access to other user accounts on the computer. This user:</p>
        <ul>
          <li>Can create and delete user accounts on the computer.</li>
          <li>Can create account passwords for other user accounts on the computer.</li>
          <li>Can change other people's account names, pictures, passwords, and account types.</li>
          <li>Cannot change his or her own account type to a limited account type unless there is at least one other user with a computer administrator account type on the computer.</li>
        </ul>
      </div>

      <h3>Limited account</h3>
      <div class="note-box">
        <p>The limited account is intended for someone who should be prohibited from changing most computer settings and deleting important files. A user with a limited account:</p>
        <ul>
          <li>Cannot install software or hardware, but can access programs that have already been installed on the computer.</li>
          <li>Can change his or her account picture and can also create, change, or delete his or her password.</li>
          <li>Cannot change his or her account name or account type. A user with a computer administrator account must make these kinds of changes.</li>
        </ul>
      </div>

      <h3>Guest account</h3>
      <div class="note-box">
        <p>The guest account is intended for use by someone who has no user account on the computer. There is no password for the guest account, so the user can log on quickly to check e-mail or browse the Internet. A user logged on to the guest account:</p>
        <ul>
          <li>Cannot install software or hardware, but can access programs that have already been installed on the computer.</li>
          <li>Cannot change the guest account type.</li>
          <li>Can change the guest account picture.</li>
        </ul>
      </div>

      <p class="note"><strong>Note:</strong> User Accounts is located in Control Panel. To open User Accounts, click <strong>Start</strong>, click <strong>Control Panel</strong>, and then click <strong>User Accounts</strong>.</p>
    `,
    relatedLinks: [
      { title: 'Set up your user account to use a .NET Passport', topic: 'usercpl_manage_passport' },
      { title: 'Manage passwords stored on the computer', topic: 'usercpl_manage_passwords' },
      { title: 'Using Local Users and Groups', topic: 'snap_localmgr' },
      { title: 'Using Group Policy', topic: 'snap_gpe' },
      { title: 'Add a new user to the computer', topic: 'usercpl_add_user' },
      { title: 'Create a user password', topic: 'usercpl_create_password' },
    ],
  },
  whatsnew_overview: {
    title: "What's New in Windows XP",
    content: `
      <h1>What's New in Windows XP</h1>
      <p>Windows XP is the most reliable and user-friendly Windows operating system yet. Here are some of the new features:</p>

      <h2>New Visual Style</h2>
      <p>Windows XP features a completely new visual design with a fresh, clean look. The new Luna visual style makes it easier to use your computer.</p>

      <h2>Improved Start Menu</h2>
      <p>The redesigned Start menu provides quick access to your most frequently used programs and important system locations.</p>

      <h2>Fast User Switching</h2>
      <p>Multiple users can now be logged on to the same computer at the same time. Switch between users without closing programs.</p>

      <h2>Windows Firewall</h2>
      <p>Built-in firewall protection helps keep your computer safe from hackers and malicious software.</p>

      <h2>Remote Desktop</h2>
      <p>Access your computer from anywhere using Remote Desktop Connection.</p>
    `,
    relatedLinks: [
      { title: 'Learn about the new Start menu', topic: 'startmenu_overview' },
      { title: 'Customize your desktop', topic: 'acc_dis_custom_nt' },
    ],
  },
  acc_dis_custom_nt: {
    title: 'Customizing Windows',
    content: `
      <h1>Customizing Windows</h1>
      <p>Windows XP allows you to personalize your computer in many ways to suit your preferences and work style.</p>

      <h2>Changing the Desktop Background</h2>
      <p>Right-click on the desktop and select Properties to access Display Properties. From here you can choose a new background image or color.</p>

      <h2>Changing the Screen Saver</h2>
      <p>In Display Properties, click the Screen Saver tab to select and configure your screen saver.</p>

      <h2>Changing the Theme</h2>
      <p>Windows XP includes several visual themes. You can switch between the Windows XP theme and the Windows Classic theme in Display Properties.</p>

      <h2>Taskbar and Start Menu</h2>
      <p>Right-click on the taskbar and select Properties to customize the taskbar appearance and Start menu behavior.</p>

      <h2>Folder Options</h2>
      <p>Open any folder and go to Tools > Folder Options to customize how folders display files and behave.</p>
    `,
    relatedLinks: [
      { title: 'Change your desktop background', topic: 'desktop_background' },
      { title: 'Personalize the Start menu', topic: 'startmenu_overview' },
    ],
  },
  windows_security_whynot_admin: {
    title: 'Why you should not run your computer as an administrator',
    content: `
      <h1>Why you should not run your computer as an administrator</h1>
      <p>Running as an administrator makes your computer vulnerable to security threats and mistakes.</p>

      <h2>Security Risks</h2>
      <p>When you are logged on as an administrator, any program you run has full access to your computer. Malicious software can take advantage of this to install itself, modify system files, or damage your computer.</p>

      <h2>Accidental Damage</h2>
      <p>As an administrator, you can accidentally delete important system files or make changes that affect other users of the computer.</p>

      <h2>Best Practice</h2>
      <p>Create a standard user account for everyday use. Only log on as an administrator when you need to install software or make system changes.</p>
    `,
    relatedLinks: [
      { title: 'User Accounts overview', topic: 'usercpl_overview' },
      { title: 'Create a new user account', topic: 'usercpl_add_user' },
    ],
  },
};

// Default topic when none specified
const DEFAULT_TOPIC = 'usercpl_overview';

function HelpAndSupport({ onClose, onMinimize, onMaximize, initialTopic }) {
  const [currentTopic, setCurrentTopic] = useState(initialTopic || DEFAULT_TOPIC);
  const [history, setHistory] = useState([initialTopic || DEFAULT_TOPIC]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useCallback((topic) => {
    if (!HELP_TOPICS[topic]) return;

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(topic);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentTopic(topic);
  }, [history, historyIndex]);

  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentTopic(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const goForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentTopic(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  const goHome = useCallback(() => {
    navigate('home');
  }, [navigate]);

  const topic = HELP_TOPICS[currentTopic] || HELP_TOPICS[DEFAULT_TOPIC];

  const renderHomeContent = () => (
    <HomeContent>
      <WelcomeSection>
        <h2>Pick a Help topic</h2>
        <TopicList>
          <TopicItem onClick={() => navigate('whatsnew_overview')}>
            <TopicIcon src="/icons/help.png" alt="" />
            <span>What's new in Windows XP</span>
          </TopicItem>
          <TopicItem onClick={() => navigate('acc_dis_custom_nt')}>
            <TopicIcon src="/icons/help.png" alt="" />
            <span>Customizing your computer</span>
          </TopicItem>
          <TopicItem onClick={() => navigate('usercpl_overview')}>
            <TopicIcon src="/icons/help.png" alt="" />
            <span>User Accounts</span>
          </TopicItem>
          <TopicItem onClick={() => navigate('windows_security_whynot_admin')}>
            <TopicIcon src="/icons/help.png" alt="" />
            <span>Security and administration</span>
          </TopicItem>
        </TopicList>
      </WelcomeSection>
      <WelcomeSection>
        <h2>Ask for assistance</h2>
        <TopicList>
          <TopicItem>
            <TopicIcon src="/icons/help.png" alt="" />
            <span>Get support, or find information in Windows XP newsgroups</span>
          </TopicItem>
        </TopicList>
      </WelcomeSection>
    </HomeContent>
  );

  const renderTopicContent = () => (
    <TopicContent>
      <ArticleContent dangerouslySetInnerHTML={{ __html: topic.content }} />
      {topic.relatedLinks && topic.relatedLinks.length > 0 && (
        <RelatedLinks>
          <h3>Related Topics</h3>
          {topic.relatedLinks.map((link, idx) => (
            <RelatedLink key={idx} onClick={() => navigate(link.topic)}>
              {link.title}
            </RelatedLink>
          ))}
        </RelatedLinks>
      )}
    </TopicContent>
  );

  return (
    <Container>
      {/* Navigation Header */}
      <Header>
        <NavButtons>
          <NavButton
            onClick={goBack}
            disabled={historyIndex <= 0}
            title="Back"
          >
            <img src="/gui/toolbar/back.webp" alt="Back" height="24" />
            <span>Back</span>
          </NavButton>
          <NavButton
            onClick={goForward}
            disabled={historyIndex >= history.length - 1}
            title="Forward"
          >
            <img src="/gui/toolbar/forward.webp" alt="Forward" height="24" />
          </NavButton>
          <NavButton onClick={goHome} title="Home">
            <img src="/icons/help.png" alt="Home" height="24" />
            <span>Home</span>
          </NavButton>
        </NavButtons>
      </Header>

      {/* Main Content Area */}
      <MainArea>
        {/* Sidebar */}
        <Sidebar>
          <SidebarPane>
            <SidebarTitle>Learn More</SidebarTitle>
            <SidebarLinks>
              <SidebarLink onClick={() => navigate('whatsnew_overview')}>
                <img src="/icons/help.png" alt="" />
                What's New In Windows XP
              </SidebarLink>
              <SidebarLink onClick={() => navigate('acc_dis_custom_nt')}>
                <img src="/icons/help.png" alt="" />
                Customizing Windows
              </SidebarLink>
              <SidebarLink onClick={() => navigate('usercpl_overview')}>
                <img src="/icons/help.png" alt="" />
                User Accounts
              </SidebarLink>
            </SidebarLinks>
          </SidebarPane>
        </Sidebar>

        {/* Content */}
        <Content>
          {/* Search Header */}
          <SearchHeader>
            <SearchLeft>
              <span>Search</span>
              <SearchInput
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder=""
              />
              <SearchGoButton>
                <img src="/gui/toolbar/go.webp" alt="Go" />
              </SearchGoButton>
            </SearchLeft>
            <SearchRight>
              <img src="/icons/help.png" alt="" width="24" height="24" />
              <span>Help and Support Center</span>
            </SearchRight>
          </SearchHeader>

          {/* Article Content */}
          <ContentBody>
            {currentTopic === 'home' ? renderHomeContent() : renderTopicContent()}
          </ContentBody>
        </Content>
      </MainArea>
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  font-family: 'Tahoma', 'Segoe UI', sans-serif;
  font-size: 11px;
`;

const Header = styled.div`
  background: linear-gradient(180deg, #f5f9fd 0%, #d8e8f5 100%);
  border-bottom: 1px solid #8db2d8;
  padding: 4px 8px;
`;

const NavButtons = styled.div`
  display: flex;
  gap: 4px;
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: ${({ disabled }) => disabled ? 'transparent' : 'linear-gradient(180deg, #fff 0%, #e8f0f8 100%)'};
  border: 1px solid ${({ disabled }) => disabled ? '#ccc' : '#8db2d8'};
  border-radius: 3px;
  cursor: ${({ disabled }) => disabled ? 'default' : 'pointer'};
  opacity: ${({ disabled }) => disabled ? 0.5 : 1};
  font-size: 11px;
  font-family: inherit;

  &:hover:not(:disabled) {
    background: linear-gradient(180deg, #fff 0%, #c8e0f8 100%);
  }

  img {
    width: 24px;
    height: 24px;
  }
`;

const MainArea = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const Sidebar = styled.div`
  width: 200px;
  background: linear-gradient(180deg, #6b9dd7 0%, #3a7bc8 50%, #2a5ea8 100%);
  overflow-y: auto;
  flex-shrink: 0;
`;

const SidebarPane = styled.div`
  margin: 8px;
  background: linear-gradient(180deg, #7eb4e8 0%, #4a8cd8 100%);
  border-radius: 5px;
  padding: 8px;
`;

const SidebarTitle = styled.div`
  color: #fff;
  font-weight: bold;
  font-size: 11px;
  padding: 4px 8px;
  margin-bottom: 4px;
`;

const SidebarLinks = styled.div`
  display: flex;
  flex-direction: column;
`;

const SidebarLink = styled.a`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  color: #fff;
  text-decoration: none;
  cursor: pointer;
  font-size: 11px;
  border-radius: 3px;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    text-decoration: underline;
  }

  img {
    width: 16px;
    height: 16px;
  }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const SearchHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #003399;
  color: #fff;
`;

const SearchLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
`;

const SearchInput = styled.input`
  width: 200px;
  padding: 4px 8px;
  border: 1px solid #ccc;
  font-size: 12px;
`;

const SearchGoButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;

  img {
    width: 24px;
    height: 24px;
  }
`;

const SearchRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
`;

const ContentBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #fff;
`;

const HomeContent = styled.div``;

const WelcomeSection = styled.div`
  margin-bottom: 24px;

  h2 {
    color: #003399;
    font-size: 14px;
    font-weight: bold;
    margin: 0 0 12px 0;
    padding-bottom: 4px;
    border-bottom: 1px solid #ccc;
  }
`;

const TopicList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-left: 8px;
`;

const TopicItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #0066cc;
  cursor: pointer;
  font-size: 12px;

  &:hover {
    text-decoration: underline;
  }
`;

const TopicIcon = styled.img`
  width: 16px;
  height: 16px;
`;

const TopicContent = styled.div``;

const ArticleContent = styled.div`
  line-height: 1.5;
  color: #000;

  h1 {
    color: #003399;
    font-size: 18px;
    font-weight: normal;
    margin: 0 0 16px 0;
  }

  h2 {
    color: #003399;
    font-size: 14px;
    font-weight: bold;
    margin: 20px 0 8px 0;
  }

  h3 {
    color: #003399;
    font-size: 12px;
    font-weight: bold;
    margin: 16px 0 6px 0;
  }

  p {
    margin: 0 0 12px 0;
    font-size: 12px;
  }

  ul {
    margin: 8px 0;
    padding-left: 24px;

    li {
      margin: 4px 0;
      font-size: 12px;
    }
  }

  .term {
    color: #0066cc;
    cursor: help;
  }

  .note-box {
    background: #f5f5f5;
    border-left: 3px solid #003399;
    padding: 12px;
    margin: 12px 0;
  }

  .note {
    background: #ffffdd;
    padding: 8px;
    border: 1px solid #e0e0a0;
    margin: 12px 0;
    font-size: 11px;
  }
`;

const RelatedLinks = styled.div`
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #ccc;

  h3 {
    color: #003399;
    font-size: 12px;
    font-weight: bold;
    margin: 0 0 12px 0;
  }
`;

const RelatedLink = styled.a`
  display: block;
  color: #0066cc;
  cursor: pointer;
  font-size: 12px;
  margin: 6px 0;
  padding-left: 8px;

  &:hover {
    text-decoration: underline;
  }

  &::before {
    content: '\\2022';
    margin-right: 8px;
  }
`;

export default HelpAndSupport;
