import html from '../../html.js';

const { useState } = window.React;

export default function ContactContent({ config = {} }) {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');

  const handleChange = event => {
    const { name, value } = event.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = event => {
    event.preventDefault();
    setStatus('sending');

    setTimeout(() => {
      setStatus('sent');
    }, 600);
  };

  return html`
    <div class="app-content contact">
      <p>Send a message and I will respond as soon as possible.</p>
      <form onSubmit=${handleSubmit} class="contact-form">
        <label>
          Name
          <input
            type="text"
            name="name"
            required
            value=${formState.name}
            onChange=${handleChange}
          />
        </label>
        <label>
          Email
          <input
            type="email"
            name="email"
            required
            value=${formState.email}
            onChange=${handleChange}
          />
        </label>
        <label>
          Message
          <textarea
            name="message"
            rows="4"
            required
            value=${formState.message}
            onChange=${handleChange}
          />
        </label>
        <button type="submit" disabled=${status === 'sending'}>
          ${status === 'sending' ? 'Sending...' : 'Send message'}
        </button>
      </form>
      ${status === 'sent' &&
      html`<div role="status" class="contact-status">
        <p>
          Thanks! Your message has been queued. You can also reach me directly at
          <a href=${`mailto:${config.developerEmail || ''}`}>${config.developerEmail}</a>.
        </p>
      </div>`}
    </div>
  `;
}
