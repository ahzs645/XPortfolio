import { useState } from 'react';
import './ContentArea.css';

function ContentArea() {
  const [activeTab, setActiveTab] = useState('news');

  const newsContent = [
    {
      title: 'Welcome to Wizard101!',
      content: 'Welcome, young Wizard! The Spiral awaits your arrival. Enroll in the Ravenwood School of Magical Arts and begin your magical journey today!'
    },
    {
      title: 'New World: Empyrea',
      content: 'The final chapter of the second arc is here! Travel to Empyrea and discover the secrets of the Spiral.'
    },
    {
      title: 'Double XP Weekend',
      content: 'This weekend only - earn double experience points on all quests and battles!'
    }
  ];

  return (
    <div className="wiz101-content-area">
      <div className="content-tabs">
        <button
          className={`tab ${activeTab === 'news' ? 'active' : ''}`}
          onClick={() => setActiveTab('news')}
        >
          News
        </button>
        <button
          className={`tab ${activeTab === 'help' ? 'active' : ''}`}
          onClick={() => setActiveTab('help')}
        >
          Help
        </button>
      </div>

      <div className="content-body">
        {activeTab === 'news' ? (
          <div className="news-list">
            {newsContent.map((item, index) => (
              <div key={index} className="wiz101-news-item">
                <h3>{item.title}</h3>
                <p>{item.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="help-content">
            <img
              src="/apps/wizard101/images/welcome.gif"
              alt="How to Login"
              className="help-image"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ContentArea;
