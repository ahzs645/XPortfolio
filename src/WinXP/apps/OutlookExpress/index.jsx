import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import DOMPurify from 'dompurify';
import ProgramLayout from '../../../components/WindowBars/ProgramLayout';
import { useApp } from '../../../contexts/AppContext';

// EML Parsing utilities
function parseEmailContent(content) {
  if (!content || typeof content !== 'string') {
    console.error('Invalid email content:', content);
    return { headers: {}, htmlBody: '', textBody: '', attachments: [] };
  }

  const parts = content.split(/\r?\n\r?\n/);
  const headers = {};
  let headersPart = parts.shift();
  let body = parts.join('\n\n');

  // Parse headers - handle multiline headers
  let currentKey = null;
  headersPart.split(/\r?\n/).forEach((line) => {
    if (line.startsWith(' ') || line.startsWith('\t')) {
      // Continuation of previous header
      if (currentKey) {
        headers[currentKey] += ' ' + line.trim();
      }
    } else {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        currentKey = line.slice(0, colonIndex).trim().toLowerCase();
        headers[currentKey] = line.slice(colonIndex + 1).trim();
      }
    }
  });

  // Specifically look for the "To" header
  const toMatch = content.match(/^To:(.+?)(?:\r?\n(?!\s)|\r?\n\r?\n)/ms);
  if (toMatch) {
    headers.to = toMatch[1].trim();
  }

  const contentType = getContentType(headers, body);
  let htmlBody = '';
  let textBody = '';
  let attachments = [];

  if (contentType.includes('multipart/')) {
    const boundaryMatch =
      contentType.match(/boundary="?(.+?)"?(?:;|$)/i) ||
      content.match(/--([^\s]+)/);
    if (boundaryMatch) {
      const boundary = boundaryMatch[1].replace(/"/g, '');
      const bodyParts = body.split(new RegExp(`--${escapeRegex(boundary)}(?:--)?`, 'm'));
      bodyParts.forEach((part) => {
        if (part.trim()) {
          const [partHeaders, ...partContentArr] = part.split(/\r?\n\r?\n/);
          const partContent = partContentArr.join('\n\n');
          const contentTransferEncoding = partHeaders.match(
            /Content-Transfer-Encoding:\s*(.+?)(?:;|$)/im
          );

          if (partHeaders.toLowerCase().includes('text/html')) {
            htmlBody = decodeContent(
              partContent,
              contentTransferEncoding ? contentTransferEncoding[1] : ''
            );
          } else if (partHeaders.toLowerCase().includes('text/plain')) {
            textBody = decodeContent(
              partContent,
              contentTransferEncoding ? contentTransferEncoding[1] : ''
            );
          } else if (
            partHeaders.includes('Content-Disposition: attachment')
          ) {
            const attachmentName = partHeaders.match(
              /filename="?(.+?)"?(?:;|$)/im
            );
            if (attachmentName) {
              const partContentType = partHeaders.match(
                /Content-Type:\s*(.+?)(?:;|$)/im
              );
              const gotContent = partContentType
                ? partContentType[1]
                : 'application/octet-stream';
              attachments.push({
                name: attachmentName[1],
                base64: partContent,
                base_link: `data:${gotContent};base64,${partContent.replace(/[\r\n\s]/g, '')}`,
              });
            }
          }
        }
      });
    } else {
      if (
        body.toLowerCase().includes('<!doctype html>') ||
        body.toLowerCase().includes('<html')
      ) {
        htmlBody = decodeContent(body, headers['content-transfer-encoding']);
      } else {
        textBody = decodeContent(body, headers['content-transfer-encoding']);
      }
    }
  } else if (contentType.includes('text/html')) {
    htmlBody = decodeContent(body, headers['content-transfer-encoding']);
  } else {
    textBody = decodeContent(body, headers['content-transfer-encoding']);
  }

  return { headers, htmlBody, textBody, attachments };
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getContentType(headers, content) {
  let contentType = headers['content-type'] || '';
  if (!contentType) {
    if (
      content.toLowerCase().includes('<!doctype html>') ||
      content.toLowerCase().includes('<html')
    ) {
      contentType = 'text/html';
    } else {
      contentType = 'text/plain';
    }
  }
  return contentType;
}

function decodeContent(content, encoding) {
  if (!encoding) return content;
  try {
    switch (encoding.toLowerCase().trim()) {
      case 'base64':
        return atob(content.replace(/[\r\n\s]/g, ''));
      case 'quoted-printable':
        return content
          .replace(/=\r?\n/g, '')
          .replace(/=([0-9A-F]{2})/gi, (_, p1) =>
            String.fromCharCode(parseInt(p1, 16))
          );
      default:
        return content;
    }
  } catch (error) {
    console.error('Error decoding content:', error);
    return content;
  }
}

function decodeHeaderField(field) {
  if (!field) return '';
  // Decode RFC 2047 encoded parts
  field = field.replace(
    /=\?([^?]+)\?([BQ])\?([^?]+)\?=/gi,
    function (match, charset, encoding, text) {
      try {
        if (encoding.toUpperCase() === 'B') {
          return decodeURIComponent(escape(atob(text)));
        } else if (encoding.toUpperCase() === 'Q') {
          return decodeURIComponent(
            text.replace(/=([0-9A-F]{2})/gi, '%$1').replace(/_/g, ' ')
          );
        }
      } catch (e) {
        console.error('Error decoding header field:', e);
      }
      return text;
    }
  );
  return field;
}

function sanitizeEmailAddress(email) {
  if (!email) return 'Unknown';
  return email.replace(/</g, '').replace(/>/g, ' ').trim();
}

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
  outlook: '/icons/outlook/outlook.png',
  localFolders: '/icons/folder-icon.png',
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

function OutlookExpress({ onClose, onMinimize, onMaximize, emlData, emlFileName }) {
  const { openApp } = useApp();
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [emails, setEmails] = useState(EMAILS);
  const fileInputRef = useRef(null);

  // Parse EML data when provided via props
  useEffect(() => {
    if (emlData) {
      try {
        const parsed = parseEmailContent(emlData);
        const newEmail = {
          id: 'imported_' + Date.now(),
          from: decodeHeaderField(parsed.headers.from) || 'Unknown',
          to: sanitizeEmailAddress(parsed.headers.to),
          subject: decodeHeaderField(parsed.headers.subject) || emlFileName || 'No Subject',
          date: parsed.headers.date || new Date().toLocaleString(),
          content: parsed.htmlBody
            ? DOMPurify.sanitize(parsed.htmlBody)
            : `<pre>${parsed.textBody || 'No content'}</pre>`,
          attachments: parsed.attachments,
          isImported: true,
        };
        setEmails([newEmail, ...EMAILS]);
        setSelectedEmail(newEmail);
        setSelectedFolder('inbox');
      } catch (error) {
        console.error('Error parsing EML file:', error);
      }
    }
  }, [emlData, emlFileName]);

  // Handle file input for Open menu
  const handleFileOpen = useCallback((event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        try {
          const parsed = parseEmailContent(content);
          const newEmail = {
            id: 'imported_' + Date.now(),
            from: decodeHeaderField(parsed.headers.from) || 'Unknown',
            to: sanitizeEmailAddress(parsed.headers.to),
            subject: decodeHeaderField(parsed.headers.subject) || file.name || 'No Subject',
            date: parsed.headers.date || new Date().toLocaleString(),
            content: parsed.htmlBody
              ? DOMPurify.sanitize(parsed.htmlBody)
              : `<pre>${parsed.textBody || 'No content'}</pre>`,
            attachments: parsed.attachments,
            isImported: true,
          };
          setEmails((prev) => {
            // Remove previous imported email if exists, add new one at top
            const filtered = prev.filter(e => !e.isImported);
            return [newEmail, ...filtered];
          });
          setSelectedEmail(newEmail);
          setSelectedFolder('inbox');
        } catch (error) {
          console.error('Error parsing EML file:', error);
        }
      };
      reader.readAsText(file);
    }
    // Reset input so same file can be selected again
    event.target.value = '';
  }, []);

  const windowActions = { onClose, onMinimize, onMaximize };

  const handleOpenFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const menus = [
    {
      id: 'file',
      label: 'File',
      items: [
        { label: 'New Message', action: 'newMessage' },
        { label: 'Open...', action: 'openFile' },
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
        { label: 'New Message', action: 'newMessage' },
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
      action: 'newMessage',
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

  // Open New Message window
  const handleNewMessage = useCallback(() => {
    openApp('New Message');
  }, [openApp]);

  const handleMenuAction = useCallback((action) => {
    switch (action) {
      case 'openFile':
        handleOpenFile();
        break;
      case 'newMessage':
        handleNewMessage();
        break;
      default:
        break;
    }
  }, [handleOpenFile, handleNewMessage]);

  const handleToolbarAction = useCallback((action) => {
    handleMenuAction(action);
  }, [handleMenuAction]);

  const currentEmails = selectedFolder === 'inbox' ? emails : [];

  // Dynamic folder counts
  const folders = [
    { id: 'inbox', name: 'Inbox', icon: OUTLOOK_ICONS.inbox, count: emails.length },
    { id: 'outbox', name: 'Outbox', icon: OUTLOOK_ICONS.outbox, count: 0 },
    { id: 'sent', name: 'Sent Items', icon: OUTLOOK_ICONS.sent, count: 0 },
    { id: 'deleted', name: 'Deleted Items', icon: OUTLOOK_ICONS.deleted, count: 0 },
    { id: 'drafts', name: 'Drafts', icon: OUTLOOK_ICONS.drafts, count: 0 },
  ];

  return (
    <ProgramLayout
      menus={menus}
      menuLogo={OUTLOOK_ICONS.flag}
      toolbarItems={toolbarItems}
      windowActions={windowActions}
      statusFields={`${currentEmails.length} message(s), 0 unread`}
      showStatusBar
      onMenuAction={handleMenuAction}
      onToolbarAction={handleToolbarAction}
    >
      {/* Hidden file input for opening EML files */}
      <HiddenFileInput
        ref={fileInputRef}
        type="file"
        accept=".eml"
        onChange={handleFileOpen}
      />
      <OutlookContainer>
        <Sidebar>
          <SidebarContent>
            <PaneTitle>Folders</PaneTitle>
            <TreeViewContainer>
              <ul className="tree-view">
                <li>
                  <details open>
                    <TreeSummary>
                      <TreeIcon src={OUTLOOK_ICONS.outlook} alt="" />
                      Outlook Express
                    </TreeSummary>
                    <ul>
                      <li>
                        <details open>
                          <TreeSummary>
                            <TreeIcon src={OUTLOOK_ICONS.localFolders} alt="" />
                            Local Folders
                          </TreeSummary>
                          <ul>
                            {folders.map((folder) => (
                              <TreeItem
                                key={folder.id}
                                $active={selectedFolder === folder.id}
                                onClick={() => handleFolderSelect(folder.id)}
                              >
                                <TreeIcon src={folder.icon} alt="" />
                                {folder.name}
                              </TreeItem>
                            ))}
                          </ul>
                        </details>
                      </li>
                    </ul>
                  </details>
                </li>
              </ul>
            </TreeViewContainer>
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
              <>
                {selectedEmail.isImported && (
                  <EmailHeaders>
                    <p><strong>From:</strong> {selectedEmail.from}</p>
                    <p><strong>To:</strong> {selectedEmail.to || 'Unknown'}</p>
                    <p><strong>Date:</strong> {selectedEmail.date}</p>
                    <p><strong>Subject:</strong> {selectedEmail.subject}</p>
                    {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                      <p>
                        <strong>Attachments:</strong>{' '}
                        {selectedEmail.attachments.map((att, idx) => (
                          <AttachmentLink key={idx} href={att.base_link} download={att.name}>
                            {att.name}
                          </AttachmentLink>
                        ))}
                      </p>
                    )}
                  </EmailHeaders>
                )}
                <PreviewContent
                  dangerouslySetInnerHTML={{ __html: selectedEmail.content }}
                />
              </>
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

const TreeViewContainer = styled.div`
  padding: 2px;

  .tree-view {
    font-family: Tahoma, Arial, sans-serif;
    font-size: 11px;
  }

  .tree-view li {
    list-style: none;
  }

  .tree-view details > ul {
    margin-left: 16px;
  }
`;

const TreeSummary = styled.summary`
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: default;
  padding: 1px 2px;

  &::-webkit-details-marker {
    margin-right: 2px;
  }
`;

const TreeIcon = styled.img`
  width: 16px;
  height: 16px;
  object-fit: contain;
  flex-shrink: 0;
`;

const TreeItem = styled.li`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 1px 4px;
  cursor: default;
  background: ${(props) => (props.$active ? '#316ac5' : 'transparent')};
  color: ${(props) => (props.$active ? '#fff' : '#000')};

  &:hover {
    background: ${(props) => (props.$active ? '#316ac5' : 'rgba(49, 106, 197, 0.1)')};
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

const HiddenFileInput = styled.input`
  display: none;
`;

const EmailHeaders = styled.div`
  padding: 8px 12px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
  font-family: Tahoma, Arial, sans-serif;
  font-size: 11px;

  p {
    margin: 2px 0;
  }

  strong {
    color: #333;
  }
`;

const AttachmentLink = styled.a`
  color: #0066cc;
  text-decoration: none;
  margin-right: 8px;

  &:hover {
    text-decoration: underline;
  }
`;

export default OutlookExpress;
