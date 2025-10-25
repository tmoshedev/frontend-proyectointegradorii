import { toPng } from 'html-to-image';

interface ExportAsImageOptions {
  filename: string;
  padding?: number;
  backgroundColor?: string;
}

const DEFAULT_BACKGROUND = '#ffffff';

/**
 * Converts the provided DOM node into a PNG image and triggers a download.
 * Returns true if the export succeeds, false otherwise.
 */
export async function exportElementAsImage(
  element: HTMLElement | null,
  { filename, padding = 12, backgroundColor = DEFAULT_BACKGROUND }: ExportAsImageOptions,
): Promise<boolean> {
  if (!element) {
    return false;
  }

  try {
    const dataUrl = await toPng(element, {
      pixelRatio: Math.min(window.devicePixelRatio || 2, 3),
      cacheBust: true,
      quality: 0.96,
      backgroundColor,
      style: {
        padding: `${padding}px`,
        backgroundColor,
      },
      filter: node => !(node instanceof HTMLElement && node.dataset?.exportIgnore != null),
    });

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
    return true;
  } catch (error) {
    console.error('No se pudo exportar el elemento como imagen', error);
    return false;
  }
}

export default exportElementAsImage;
