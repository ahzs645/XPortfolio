import { withBaseUrl } from '../../../utils/baseUrl';
import './PatchClientContent.css';

function PatchClientContent() {
  return (
    <div className="wiz101-patch-client-content">
      <iframe
        src={withBaseUrl('/apps/wizard101/archive/20140331212705/https.html')}
        className="wiz101-patch-client-iframe"
        title="Ravenwood News"
        frameBorder="0"
      />
    </div>
  );
}

export default PatchClientContent;
