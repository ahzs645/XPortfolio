import html from '../../html.js';

const { useEffect, useState } = window.React;

function parseMarkdown(text) {
  return text
    .split(/\n\s*\n/)
    .map(paragraph => paragraph.trim())
    .filter(Boolean);
}

export default function AboutContent() {
  const [paragraphs, setParagraphs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch('./content/about.md')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load about content');
        }
        return response.text();
      })
      .then(text => {
        if (!cancelled) {
          setParagraphs(parseMarkdown(text));
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return html`<div class="app-content"><p>Unable to load about information. Please try again later.</p></div>`;
  }

  if (paragraphs.length === 0) {
    return html`<div class="app-content"><p>Loading your story...</p></div>`;
  }

  return html`<div class="app-content">
    ${paragraphs.map((paragraph, index) => html`<p key=${index}>${paragraph}</p>`)}
  </div>`;
}
