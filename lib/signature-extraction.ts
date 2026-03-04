/**
 * Extract signature from an image by removing the background.
 * Uses Canvas API to process pixels - dark pixels (ink) become opaque,
 * light pixels (paper background) become transparent.
 */
export function extractSignature(
  imageElement: HTMLImageElement,
  threshold: number = 128
): string {
  const canvas = document.createElement("canvas");
  canvas.width = imageElement.naturalWidth;
  canvas.height = imageElement.naturalHeight;
  const ctx = canvas.getContext("2d")!;

  // Draw original image
  ctx.drawImage(imageElement, 0, 0);

  // Get pixel data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data; // RGBA flat array

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Calculate perceived luminance (brightness)
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

    if (luminance > threshold) {
      // Light pixel = background -> make fully transparent
      data[i + 3] = 0;
    } else {
      // Dark pixel = ink -> make opaque black for clean look
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}

/**
 * Extract signature preserving the original ink color.
 */
export function extractSignaturePreserveColor(
  imageElement: HTMLImageElement,
  threshold: number = 128
): string {
  const canvas = document.createElement("canvas");
  canvas.width = imageElement.naturalWidth;
  canvas.height = imageElement.naturalHeight;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(imageElement, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

    if (luminance > threshold) {
      // Background -> transparent
      data[i + 3] = 0;
    } else {
      // Ink -> keep original color, full opacity
      // Optionally adjust alpha based on how dark the pixel is
      const alpha = Math.min(255, Math.round((1 - luminance / threshold) * 255 * 1.5));
      data[i + 3] = alpha;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}
