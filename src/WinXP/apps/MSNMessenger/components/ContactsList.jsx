import React from 'react';
import { getAvatarPath, getStatusLabel } from '../data/constants';

export default function ContactsList({ contacts, activeContactId, unreadCounts, onSelectContact }) {
  return (
    <div className="msn-contacts-list-container">
      <div className="group-container">
        <div className="contact-group-header">
          <span style={{ display: 'inline-block', width: 10, height: 10, backgroundColor: '#4CAF50', borderRadius: '50%' }} />
          <span>Online (<span>{contacts.length}</span>)</span>
        </div>
        <ul className="msn-contacts-list">
          {contacts.map(contact => {
            const unread = unreadCounts[contact.id] || 0;
            return (
              <li
                key={contact.id}
                className={contact.id === activeContactId ? 'active' : ''}
                onClick={() => onSelectContact(contact)}
              >
                <img src={getAvatarPath(contact.avatar)} alt={contact.display_name} />
                <span className="c-name">{contact.display_name} ({getStatusLabel(contact.status)})</span>
                <div className="c-status" style={{ marginLeft: 'auto' }}>
                  {unread > 0 && (
                    <span className="unread-badge">{unread > 9 ? '9+' : unread}</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
