export function imageDataToBlob(imageData: ImageData): Promise<Blob | null> {
  const mimeType = 'image/png';

  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.resolve(null);

  ctx.putImageData(imageData, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, mimeType);
  });
}