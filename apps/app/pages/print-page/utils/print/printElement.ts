export function printElement(element: HTMLElement | null): void {
  if (!element) return;

  const iframe: HTMLIFrameElement = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';

  document.body.appendChild(iframe);

  const iframeWindow: (Window & typeof globalThis) | null = iframe.contentWindow;
  if (!iframeWindow) throw new Error("印刷用ウィンドウの生成に失敗");

  const doc: Document = iframeWindow.document;
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

  iframe.addEventListener('load', () => {
    iframeWindow.focus();
    iframeWindow.print();
    document.body.removeChild(iframe);
  });
}