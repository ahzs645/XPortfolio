import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import DOMPurify from 'dompurify';
import ProgramLayout from '../../../components/WindowBars/ProgramLayout';
import { useApp } from '../../../contexts/AppContext';
import { withBaseUrl } from '../../../utils/baseUrl';

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

// Email content components - rendered directly in React (no iframes)
const EmailContent = {
  chain_email: () => (
    <div style={{ fontFamily: '"Courier New", monospace', fontSize: '10pt', color: '#000', backgroundColor: '#CCFFCC', padding: '10px', height: '100%' }}>
      <h2 style={{ fontFamily: '"Comic Sans MS", cursive', color: '#FF6600' }}>FW: FW: FW: MUST READ!!!</h2>
      <p>This is the funniest joke of the year!</p>
      <p><span style={{ fontWeight: 'bold', color: '#FF00FF' }}>Q: Why did the chicken cross the road?</span><br />
      A: To send this email to you!</p>
      <p>Forward to 10 friends or your computer will freeze forever!</p>
      <marquee behavior="scroll" direction="left" style={{ color: '#0000FF', fontWeight: 'bold' }}>LOL LOL LOL ~*~*~*~ FORWARD THIS ~*~*~*~ LOL LOL LOL</marquee>
    </div>
  ),
  bank_alert: () => (
    <div style={{ fontFamily: 'Georgia, serif', fontSize: '11pt', color: '#000080', backgroundColor: '#FFCCCC', padding: '10px', height: '100%' }}>
      <h2 style={{ color: '#8B0000', fontWeight: 'bold' }}>IMPORTANT NOTICE</h2>
      <table style={{ border: '2px inset #999', padding: '10px', backgroundColor: '#fff' }}>
        <tbody>
          <tr><td>Dear Valued Customer,</td></tr>
          <tr><td>&nbsp;</td></tr>
          <tr><td>Your bank account has been temporarily <span style={{ fontWeight: 'bold', color: '#FF0000' }}>LOCKED</span> due to suspicious activity.</td></tr>
          <tr><td>To restore access, please click the link below and verify your account information immediately:</td></tr>
          <tr><td>&nbsp;</td></tr>
          <tr><td><a href="#" style={{ color: '#0000FF', textDecoration: 'underline' }}>www.totally-legit-bank-security.com/verify</a></td></tr>
          <tr><td>&nbsp;</td></tr>
          <tr><td><span style={{ fontWeight: 'bold', color: '#FF0000', animation: 'blink 1s linear infinite' }}>Failure to respond may result in permanent account closure!</span></td></tr>
        </tbody>
      </table>
    </div>
  ),
  virus_hoax: () => (
    <div style={{ fontFamily: '"Arial Black", Gadget, sans-serif', fontSize: '11pt', color: '#FF0000', backgroundColor: '#FFFF66', padding: '10px', height: '100%' }}>
      <h2 style={{ color: '#FF0000', textTransform: 'uppercase' }}>!!! VIRUS ALERT !!!</h2>
      <p style={{ fontWeight: 'bold', textDecoration: 'underline', animation: 'blink 0.5s linear infinite' }}>WARNING! WARNING! WARNING!</p>
      <p>Your computer may be infected with a deadly virus called <span style={{ fontWeight: 'bold', textDecoration: 'underline' }}>"JDBGMGR.EXE"</span>!</p>
      <p>It looks like a TEDDY BEAR but it will DELETE YOUR ENTIRE HARD DRIVE in 14 days!!!</p>
      <p>Forward this message to <span style={{ fontWeight: 'bold', textDecoration: 'underline' }}>10 friends</span> immediately to protect yourself!</p>
      <hr />
      <p><span style={{ fontWeight: 'bold', textDecoration: 'underline' }}>THIS IS NOT A HOAX!</span> AOL and Microsoft have confirmed it!</p>
    </div>
  ),
  lottery_win: () => (
    <div style={{ fontFamily: '"Times New Roman", serif', fontSize: '12pt', color: '#000080', backgroundColor: '#FFFFCC', padding: '10px', height: '100%' }}>
      <p style={{ color: '#FFD700', fontSize: '18pt', textAlign: 'center' }}>★ ★ ★ ★ ★ ★ ★ ★ ★ ★</p>
      <h1 style={{ color: '#FFD700', textShadow: '2px 2px #000', fontSize: '24pt', textAlign: 'center' }}>CONGRATULATIONS!!!</h1>
      <h2 style={{ color: '#008000', textAlign: 'center' }}>YOU HAVE WON THE MEGA ONLINE LOTTERY!</h2>
      <table style={{ border: '3px ridge #FFD700', padding: '15px', backgroundColor: '#fff', margin: '10px auto' }}>
        <tbody>
          <tr><td style={{ textAlign: 'center' }}><span style={{ color: '#FFD700', fontWeight: 'bold' }}>Prize Amount:</span> <span style={{ fontWeight: 'bold', color: '#FF0000', backgroundColor: '#FFFF00' }}>$1,000,000.00 USD</span></td></tr>
          <tr><td style={{ textAlign: 'center' }}>Winning Ticket Number: <b>XJ-4892-KL-2847</b></td></tr>
          <tr><td style={{ textAlign: 'center' }}>Reference Code: <b>MLOT/2008/WIN/USA</b></td></tr>
        </tbody>
      </table>
      <p style={{ textAlign: 'center' }}>Your email was selected from over <span style={{ fontWeight: 'bold', color: '#FF0000', backgroundColor: '#FFFF00' }}>5,000,000 entries</span> worldwide!</p>
      <p style={{ textAlign: 'center' }}>To claim your prize, email: <a href="#" style={{ color: '#0000FF' }}>claims@mega-lottery-winner.com</a></p>
      <p style={{ textAlign: 'center', fontWeight: 'bold', color: '#FF0000', backgroundColor: '#FFFF00', animation: 'blink 0.8s linear infinite' }}>Offer expires in 24 hours! Act NOW!</p>
      <p style={{ color: '#FFD700', fontSize: '18pt', textAlign: 'center' }}>★ ★ ★ ★ ★ ★ ★ ★ ★ ★</p>
    </div>
  ),
  nigerian_prince: () => (
    <div style={{ fontFamily: 'Verdana, sans-serif', fontSize: '10pt', color: '#000', backgroundColor: '#FFF8DC', padding: '10px', height: '100%' }}>
      <h2 style={{ color: '#8B0000' }}>URGENT BUSINESS PROPOSAL</h2>
      <p>Dear Friend,</p>
      <p>I am <span style={{ backgroundColor: '#FFFF00', fontWeight: 'bold' }}>Prince Adewale of Nigeria</span>. I have a large sum of money totaling <span style={{ backgroundColor: '#FFFF00', fontWeight: 'bold' }}>$4,500,000 USD</span> which I need to transfer out of my country due to a financial emergency.</p>
      <p>Because of your trustworthiness and integrity, I am seeking your assistance. In return, you will receive <span style={{ backgroundColor: '#FFFF00', fontWeight: 'bold' }}>30% of the total funds</span> as a reward.</p>
      <p>All I need is your <span style={{ backgroundColor: '#FFFF00', fontWeight: 'bold' }}>full name, address, phone number, and bank account details</span>.</p>
      <p>Please reply immediately to <a href="#" style={{ color: '#0000FF', textDecoration: 'underline' }}>prince_adewale@royalmail.ng</a>.</p>
      <p style={{ marginTop: '20px', fontStyle: 'italic' }}>Sincerely,<br />Prince Adewale<br />Royal Family of Nigeria</p>
    </div>
  ),
  outlook_welcome: () => (
    <div style={{ margin: 0, backgroundColor: '#fff', fontFamily: 'Verdana, sans-serif', fontSize: '8pt', color: '#000', height: '100%' }}>
      <table border="0" cellPadding="0" cellSpacing="0" style={{ width: '100%', height: '100%' }}>
        <tbody>
          <tr>
            <td colSpan="4" valign="top">
              <table border="0" cellPadding="0" cellSpacing="0" style={{ width: '100%', height: '50px', backgroundColor: '#fff' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '141px' }}><img src={withBaseUrl('/outlook/outlook_welcome/oelogo1.gif')} alt="Logo 1" /></td>
                    <td colSpan="2" style={{ height: '25px', textAlign: 'right' }}>&nbsp;</td>
                  </tr>
                  <tr>
                    <td style={{ width: '141px' }}><img src={withBaseUrl('/outlook/outlook_welcome/oelogo2.gif')} alt="Logo 2" /></td>
                    <td valign="bottom" style={{ height: '22px', backgroundColor: '#000', paddingBottom: '2px', color: '#fff', fontWeight: 'bold' }}>
                      The solution for all your messaging needs
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td style={{ width: '100%' }}>
              <table border="0" cellPadding="0" cellSpacing="0" style={{ width: '100%', height: '100%' }}>
                <tbody>
                  <tr>
                    <td valign="top" style={{ padding: '10px' }}>
                      <div style={{ backgroundColor: '#ccc', width: '140px', height: '18px', padding: '0 4px' }}>
                        <span style={{ fontWeight: 'bold' }}>Featuring</span>
                      </div>
                      <div style={{ paddingLeft: '15%', paddingTop: '10px' }}>
                        <p><img src={withBaseUrl('/outlook/outlook_welcome/dot.gif')} alt="" /> E-mail and Newsgroups</p>
                        <p><img src={withBaseUrl('/outlook/outlook_welcome/dot.gif')} alt="" /> Multiple accounts and Identities</p>
                        <p><img src={withBaseUrl('/outlook/outlook_welcome/dot.gif')} alt="" /> HTML message support</p>
                        <p><img src={withBaseUrl('/outlook/outlook_welcome/dot.gif')} alt="" /> Address Book and directory services</p>
                        <p><img src={withBaseUrl('/outlook/outlook_welcome/dot.gif')} alt="" /> Offline synchronization</p>
                        <p><img src={withBaseUrl('/outlook/outlook_welcome/dot.gif')} alt="" /> Improved Inbox rules</p>
                      </div>
                      <div style={{ marginTop: '20px', backgroundColor: '#ccc', width: '140px', height: '18px', padding: '0 4px' }}>
                        <span style={{ fontWeight: 'bold' }}>More Information</span>
                      </div>
                      <div style={{ paddingLeft: '15%', paddingTop: '10px' }}>
                        <p>For the most current Outlook Express information, go to the Help menu, and then click Read Me.</p>
                        <p>For Feedback, frequently asked questions, and tips visit our newsgroup.</p>
                      </div>
                      <hr style={{ width: '100%', height: '1px' }} />
                      <p style={{ padding: '6px' }}>Thank you for choosing Internet Explorer and Outlook Express 6.</p>
                      <p style={{ padding: '6px', fontWeight: 'bold' }}>The Microsoft Outlook Express Team</p>
                    </td>
                    <td style={{ height: '100%', backgroundColor: '#003399', width: '8px' }}>&nbsp;</td>
                    <td style={{ height: '100%', width: '160px', backgroundColor: '#fff', padding: '10px' }} valign="top">
                      <img src={withBaseUrl('/outlook/outlook_welcome/hotmail.gif')} alt="Hotmail" /><br />
                      <p style={{ fontSize: '8pt' }}>Tired of sharing your e-mail account? <a href="#" style={{ color: '#0099FF' }}>Get a free Hotmail account!</a></p>
                      <img src={withBaseUrl('/outlook/outlook_welcome/infobeat.gif')} alt="InfoBeat" style={{ marginTop: '10px' }} /><br />
                      <p style={{ fontSize: '8pt' }}>Surf, search and sift no more! <a href="#" style={{ color: '#0099FF' }}>InfoBeat</a> delivers personalized news.</p>
                      <img src={withBaseUrl('/outlook/outlook_welcome/verisign.gif')} alt="VeriSign" style={{ marginTop: '10px' }} /><br />
                      <p style={{ fontSize: '8pt' }}>Obtain a free trial personal digital ID from <a href="#" style={{ color: '#0099FF' }}>VeriSign</a>.</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  ),
};

// Sample emails data
const EMAILS = [
  {
    id: 'chain_email',
    from: 'Friend',
    subject: "FW: You Won't Believe This!",
    date: '02/04/2008 4:32 PM',
  },
  {
    id: 'bank_alert',
    from: 'Bank Security Dept.',
    subject: 'Your Bank Account Has Been Locked',
    date: '02/04/2008 2:50 PM',
  },
  {
    id: 'virus_hoax',
    from: 'System Alert',
    subject: 'WARNING! Delete This Email or Lose Everything!',
    date: '02/02/2008 5:23 PM',
  },
  {
    id: 'lottery_win',
    from: 'Mega Online Lottery',
    subject: 'CONGRATULATIONS! You Won $1,000,000 USD!',
    date: '02/02/2008 9:46 AM',
  },
  {
    id: 'nigerian_prince',
    from: 'Prince Adewale',
    subject: 'URGENT: Business Proposal For You',
    date: '02/01/2008 12:18 PM',
  },
  {
    id: 'outlook_welcome',
    from: 'Microsoft',
    subject: 'Welcome to Outlook Express',
    date: '01/01/2008 12:00 PM',
  },
];

function OutlookExpress({ onClose, onMinimize, onMaximize, emlData, emlFileName }) {
  const { openApp } = useApp();
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [emails, setEmails] = useState(EMAILS);
  const fileInputRef = useRef(null);

  // Parse EML data when provided via props
  /* eslint-disable react-hooks/set-state-in-effect -- import email from prop data */
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
  /* eslint-enable react-hooks/set-state-in-effect */

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
          <FoldersPaneHeader>
            <span>Folders</span>
            <PaneCloseButton>&times;</PaneCloseButton>
          </FoldersPaneHeader>
          <SidebarContent>
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
                {EmailContent[selectedEmail.id] ? (
                  <EmailContentWrapper>
                    {EmailContent[selectedEmail.id]()}
                  </EmailContentWrapper>
                ) : selectedEmail.content ? (
                  <PreviewContent
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedEmail.content) }}
                  />
                ) : null}
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
  margin: 0 2px 2px 2px;
  border: 1px solid #919b9c;
  border-top: none;
  flex: 1;
  overflow-y: auto;
`;

const FoldersPaneHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #d6d2c6;
  color: #000;
  font-family: Tahoma, Arial, sans-serif;
  font-size: 11px;
  font-weight: bold;
  padding: 2px 3px 2px 5px;
  border: 1px solid #919b9c;
  border-bottom: 1px solid #b5b5a5;
  margin: 2px 2px 0 2px;
`;

const PaneCloseButton = styled.button`
  background: #d4d0c8;
  border: 1px solid #808080;
  font-size: 8px;
  font-family: Tahoma, sans-serif;
  min-width: 0;
  width: 11px;
  height: 9px;
  line-height: 7px;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  flex-shrink: 0;

  &:hover {
    background: #e0dcd4;
  }

  &:active {
    background: #c0bcb4;
  }
`;

const TreeViewContainer = styled.div`
  padding: 4px;

  ul.tree-view {
    font-family: Tahoma, Arial, sans-serif;
    font-size: 11px;
    border: none;
    padding: 0;
    margin: 0;
    background: transparent;
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
  display: flex;
  flex-direction: column;
`;

const PreviewContent = styled.div`
  padding: 8px;
  font-family: Arial, sans-serif;
  font-size: 12px;

  a {
    color: #0066cc;
  }
`;

const EmailContentWrapper = styled.div`
  flex: 1;
  overflow: auto;

  @keyframes blink {
    50% { opacity: 0; }
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
