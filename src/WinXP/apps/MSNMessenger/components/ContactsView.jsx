import React from 'react';
import { getAvatarPath, getStatusLabel, CONTACTS_STRIP_PATH, AD_BANNER_PATH } from '../data/constants';
import ContactsList from './ContactsList';

export default function ContactsView({ user, contacts, activeContactId, unreadCounts, onSelectContact, onSignOut }) {
  return (
    <div className="msn-contacts-view">
      <div className="msn-user-header">
        <div className="user-info-main">
          <img className="contacts-avatar" src={getAvatarPath(user.avatar)} alt="Avatar" />
          <div style={{ flexGrow: 1 }}>
            <span style={{ fontWeight: 'bold' }}>{user.name}</span><br />
            <span style={{ color: '#70809C' }}>({getStatusLabel(user.status)})</span>
          </div>
        </div>
        <button className="msn-btn" onClick={onSignOut}>Sign Out</button>
      </div>
      <div className="contacts-body">
        <div className="contacts-sidebar">
          <img src={CONTACTS_STRIP_PATH} alt="Chat" />
        </div>
        <ContactsList
          contacts={contacts}
          activeContactId={activeContactId}
          unreadCounts={unreadCounts}
          onSelectContact={onSelectContact}
        />
      </div>
      <div className="contacts-footer">
        <div className="ad-banner">
          <img src={AD_BANNER_PATH} style={{ width: 250, cursor: 'pointer' }} alt="Ad" />
        </div>
      </div>
    </div>
  );
}
