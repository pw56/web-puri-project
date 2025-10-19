export function printElement(element) {
  if (!element) return;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';

  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
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
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    document.body.removeChild(iframe);
  };
}

export function isLengthValue(str) {
  return /^(\d+(\.\d+)?)(cm|mm)$/.test(str);
}