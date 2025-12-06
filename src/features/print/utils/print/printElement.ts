export function printElement(element: HTMLElement | null): void {
  if (!element) return;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';

  document.body.appendChild(iframe);

  const iframeWindow = iframe.contentWindow;
  if (!iframeWindow) return;

  const doc = iframeWindow.document;
  doc.open();
  doc.write(`
    <html>
      <head>
        <title>Printing</title>
        <style>
          body { margin: 0; padding: 20px; font-family: sans-serif; }
        </style>
      </head>
      <body>${element.outerHTML}</body>
    </html>
  `);
  doc.close();

  iframe.onload = () => {
    iframeWindow.focus();
    iframeWindow.print();
    document.body.removeChild(iframe);
  };
}