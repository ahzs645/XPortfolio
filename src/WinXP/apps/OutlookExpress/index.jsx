import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import ProgramLayout from '../../../components/WindowBars/ProgramLayout';

const OUTLOOK_ICONS = {
  inbox: '/icons/outlook/inbox.png',
  outbox: '/icons/outlook/outbox.png',
  sent: '/icons/outlook/sent.png',
  deleted: '/icons/outlook/deleted.png',
  drafts: '/icons/outlook/drafts.png',
  envelope: '/icons/outlook/envelope.png',
  write: '/icons/outlook/write.png',
  contacts: '/icons/outlook/contacts.png',
  find: '/icons/outlook/find.png',
  flag: '/icons/outlook/flag.png',
};

// Sample emails data
const EMAILS = [
  {
    id: 'chain_email',
    from: 'Friend',
    subject: "FW: You Won't Believe This!",
    date: '02/04/2008 4:32 PM',
    content: `<div style="font-family: Arial, sans-serif; padding: 20px;">
      <p>OMG you have to see this!! Forward to 10 friends or bad luck for 7 years!!</p>
      <p>---------- Forwarded Message ----------</p>
      <p>This email has been around the world 7 times! Send it to everyone you know!</p>
    </div>`,
  },
  {
    id: 'bank_alert',
    from: 'Bank Security Dept.',
    subject: 'Your Bank Account Has Been Locked',
    date: '02/04/2008 2:50 PM',
    content: `<div style="font-family: Arial, sans-serif; padding: 20px;">
      <p>Dear Valued Customer,</p>
      <p>We have detected suspicious activity on your account. Please click the link below to verify your identity:</p>
      <p><a href="#" style="color: blue;">www.totally-not-a-scam.com/verify</a></p>
      <p>If you do not verify within 24 hours, your account will be permanently suspended.</p>
      <p>Bank Security Team</p>
    </div>`,
  },
  {
    id: 'work_from_home',
    from: 'FastCash Online',
    subject: 'Make $500 a Day From Home!!!',
    date: '02/03/2008 11:07 AM',
    content: `<div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: green;">$$$ WORK FROM HOME $$$</h2>
      <p>I made $50,000 in my first month working from home!</p>
      <p>All you need is a computer and an internet connection!</p>
      <p>Send $49.99 to get started TODAY!</p>
    </div>`,
  },
  {
    id: 'virus_hoax',
    from: 'System Alert',
    subject: 'WARNING! Delete This Email or Lose Everything!',
    date: '02/02/2008 5:23 PM',
    content: `<div style="font-family: Arial, sans-serif; padding: 20px;">
      <h1 style="color: red;">!!! VIRUS ALERT !!!</h1>
      <p>A new virus called "KILLER.EXE" is spreading! It will delete your entire hard drive!</p>
      <p>Forward this to everyone in your contacts to warn them!</p>
      <p>This is NOT a hoax! Microsoft confirmed it!</p>
    </div>`,
  },
  {
    id: 'lottery_win',
    from: 'Mega Online Lottery',
    subject: 'CONGRATULATIONS! You Won $1,000,000 USD!',
    date: '02/02/2008 9:46 AM',
    content: `<div style="font-family: Arial, sans-serif; padding: 20px;">
      <h1 style="color: gold; text-shadow: 1px 1px black;">CONGRATULATIONS!!!</h1>
      <p>You have been selected as the winner of our MEGA LOTTERY!</p>
      <p>Prize: $1,000,000 USD</p>
      <p>To claim your prize, please send your bank details to: claims@mega-lottery-totally-real.com</p>
    </div>`,
  },
  {
    id: 'nigerian_prince',
    from: 'Prince Adewale',
    subject: 'URGENT: Business Proposal For You',
    date: '02/01/2008 12:18 PM',
    content: `<div style="font-family: Arial, sans-serif; padding: 20px;">
      <p>Dear Friend,</p>
      <p>I am Prince Adewale, son of the late King of Nigeria. I have $45,000,000 USD that I need to transfer out of the country.</p>
      <p>If you help me, I will give you 30% of the funds.</p>
      <p>Please reply with your full name, address, and bank account number.</p>
      <p>God bless you,</p>
      <p>Prince Adewale</p>
    </div>`,
  },
  {
    id: 'outlook_welcome',
    from: 'Microsoft',
    subject: 'Welcome to Outlook Express',
    date: '01/01/2008 12:00 PM',
    content: `<div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Welcome to Outlook Express!</h2>
      <p>Thank you for using Outlook Express, the fast and easy way to send and receive email.</p>
      <p>Features:</p>
      <ul>
        <li>Send and receive email</li>
        <li>Organize your messages with folders</li>
        <li>Manage your contacts</li>
      </ul>
      <p>- The Microsoft Team</p>
    </div>`,
  },
];

const FOLDERS = [
  { id: 'inbox', name: 'Inbox', icon: OUTLOOK_ICONS.inbox, count: EMAILS.length },
  { id: 'outbox', name: 'Outbox', icon: OUTLOOK_ICONS.outbox, count: 0 },
  { id: 'sent', name: 'Sent Items', icon: OUTLOOK_ICONS.sent, count: 0 },
  { id: 'deleted', name: 'Deleted Items', icon: OUTLOOK_ICONS.deleted, count: 0 },
  { id: 'drafts', name: 'Drafts', icon: OUTLOOK_ICONS.drafts, count: 0 },
];

function OutlookExpress({ onClose, onMinimize, onMaximize }) {
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState(null);

  const windowActions = { onClose, onMinimize, onMaximize };

  const menus = [
    {
      id: 'file',
      label: 'File',
      items: [
        { label: 'New', disabled: true },
        { label: 'Open', disabled: true },
        { label: 'Save As...', disabled: true },
        { separator: true },
        { label: 'Print', disabled: true },
        { separator: true },
        { label: 'Work Offline', disabled: true },
        { separator: true },
        { label: 'Close', action: 'exitProgram' },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        { label: 'Copy', disabled: true },
        { label: 'Select All', disabled: true },
        { separator: true },
        { label: 'Find...', disabled: true },
        { separator: true },
        { label: 'Delete', disabled: true },
        { separator: true },
        { label: 'Mark as Read', disabled: true },
        { label: 'Mark as Unread', disabled: true },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { label: 'Current View', disabled: true },
        { label: 'Sort By', disabled: true },
        { label: 'Columns...', disabled: true },
        { separator: true },
        { label: 'Layout', disabled: true },
        { separator: true },
        { label: 'Text Size', disabled: true },
        { separator: true },
        { label: 'Refresh', disabled: true },
      ],
    },
    {
      id: 'tools',
      label: 'Tools',
      items: [
        { label: 'Send and Receive', disabled: true },
        { separator: true },
        { label: 'Address Book...', disabled: true },
        { separator: true },
        { label: 'Message Rules', disabled: true },
        { separator: true },
        { label: 'Options...', disabled: true },
      ],
    },
    {
      id: 'message',
      label: 'Message',
      items: [
        { label: 'New Message', disabled: true },
        { separator: true },
        { label: 'Reply to Sender', disabled: true },
        { label: 'Reply to All', disabled: true },
        { label: 'Forward', disabled: true },
        { separator: true },
        { label: 'Block Sender...', disabled: true },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        { label: 'Contents and Index', disabled: true },
        { separator: true },
        { label: 'About Outlook Express', disabled: true },
      ],
    },
  ];

  const toolbarItems = [
    {
      type: 'button',
      id: 'create',
      icon: OUTLOOK_ICONS.write,
      label: 'Create Mail',
      disabled: true,
      action: 'create',
    },
    { type: 'separator' },
    {
      type: 'button',
      id: 'contacts',
      icon: OUTLOOK_ICONS.contacts,
      label: 'Contacts',
      disabled: true,
      action: 'contacts',
    },
    {
      type: 'button',
      id: 'find',
      icon: OUTLOOK_ICONS.find,
      label: 'Find',
      disabled: true,
      action: 'find',
    },
  ];

  const handleEmailSelect = useCallback((email) => {
    setSelectedEmail(email);
  }, []);

  const handleFolderSelect = useCallback((folderId) => {
    setSelectedFolder(folderId);
    setSelectedEmail(null);
  }, []);

  const currentEmails = selectedFolder === 'inbox' ? EMAILS : [];

  return (
    <ProgramLayout
      menus={menus}
      menuLogo={OUTLOOK_ICONS.flag}
      toolbarItems={toolbarItems}
      windowActions={windowActions}
      statusFields={`${currentEmails.length} message(s), 0 unread`}
      showStatusBar
    >
      <OutlookContainer>
        <Sidebar>
          <SidebarContent>
            <PaneTitle>Folders</PaneTitle>
            <FolderList>
              {FOLDERS.map((folder) => (
                <FolderItem
                  key={folder.id}
                  $active={selectedFolder === folder.id}
                  onClick={() => handleFolderSelect(folder.id)}
                >
                  <img src={folder.icon} alt={folder.name} />
                  <span>{folder.name}</span>
                </FolderItem>
              ))}
            </FolderList>
          </SidebarContent>
        </Sidebar>

        <MainContent>
          <EmailListPane>
            <EmailTable>
              <thead>
                <tr>
                  <th>From</th>
                  <th>Subject</th>
                  <th>Received</th>
                </tr>
              </thead>
              <tbody>
                {currentEmails.map((email) => (
                  <EmailRow
                    key={email.id}
                    $selected={selectedEmail?.id === email.id}
                    onClick={() => handleEmailSelect(email)}
                  >
                    <td>
                      <img src={OUTLOOK_ICONS.envelope} alt="" />
                      {' '}{email.from}
                    </td>
                    <td>{email.subject}</td>
                    <td>{email.date}</td>
                  </EmailRow>
                ))}
              </tbody>
            </EmailTable>
          </EmailListPane>

          <EmailPreviewPane>
            {selectedEmail ? (
              <PreviewContent
                dangerouslySetInnerHTML={{ __html: selectedEmail.content }}
              />
            ) : (
              <EmptyPreview>Select a message to read</EmptyPreview>
            )}
          </EmailPreviewPane>
        </MainContent>
      </OutlookContainer>
    </ProgramLayout>
  );
}

const OutlookContainer = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  background: #fff;
`;

const Sidebar = styled.div`
  width: 180px;
  min-width: 180px;
  background: #ece9d8;
  border-right: 1px solid #919b9c;
  display: flex;
  flex-direction: column;
`;

const SidebarContent = styled.div`
  background: #fff;
  margin: 4px;
  border: 2px inset #c7c5b2;
  flex: 1;
  overflow-y: auto;
`;

const PaneTitle = styled.div`
  background: #0a246a;
  background: linear-gradient(180deg, #0a246a 0%, #a6caf0 100%);
  color: #fff;
  font-family: Tahoma, Arial, sans-serif;
  font-size: 11px;
  font-weight: bold;
  padding: 4px 8px;
`;

const FolderList = styled.div`
  padding: 4px;
`;

const FolderItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 6px;
  cursor: default;
  font-family: Tahoma, Arial, sans-serif;
  font-size: 11px;
  background: ${(props) => (props.$active ? '#316ac5' : 'transparent')};
  color: ${(props) => (props.$active ? '#fff' : '#000')};

  img {
    width: 16px;
    height: 16px;
    object-fit: contain;
  }

  &:hover {
    background: ${(props) => (props.$active ? '#316ac5' : '#e0e0e0')};
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const EmailListPane = styled.div`
  flex: 0 0 40%;
  border: 2px inset #c7c5b2;
  margin: 4px 4px 2px 0;
  overflow: auto;
  background: #fff;
`;

const EmailTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: Tahoma, Arial, sans-serif;
  font-size: 11px;

  thead {
    position: sticky;
    top: 0;
    z-index: 1;
  }

  th {
    background: #ebeadb;
    border-bottom: 2px inset #c7c5b2;
    text-align: left;
    padding: 4px 8px;
    font-weight: normal;
  }

  td {
    padding: 2px 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    img {
      width: 16px;
      height: 16px;
      vertical-align: middle;
      margin-right: 4px;
    }
  }
`;

const EmailRow = styled.tr`
  cursor: default;
  background: ${(props) => (props.$selected ? '#316ac5' : 'transparent')};
  color: ${(props) => (props.$selected ? '#fff' : '#000')};

  &:hover {
    background: ${(props) => (props.$selected ? '#316ac5' : '#e8e8e8')};
  }
`;

const EmailPreviewPane = styled.div`
  flex: 1;
  border: 2px inset #c7c5b2;
  margin: 2px 4px 4px 0;
  overflow: auto;
  background: #fff;
`;

const PreviewContent = styled.div`
  padding: 8px;
  font-family: Arial, sans-serif;
  font-size: 12px;

  a {
    color: #0066cc;
  }
`;

const EmptyPreview = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #888;
  font-family: Tahoma, Arial, sans-serif;
  font-size: 11px;
`;

export default OutlookExpress;
