import { createRoot } from 'react-dom/client';
import "components/index"
import "pages/index"

const root = createRoot(document.getElementById('root'));
root.render(<App />);