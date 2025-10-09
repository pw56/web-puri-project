import "detection/detection.js";
import "editing/editing.js";
import "output/output.js";
import "preserve/version.js";

// オフライン対応
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('SW registered!', reg))
      .catch(err => console.error('SW registration failed:', err));
  });
}