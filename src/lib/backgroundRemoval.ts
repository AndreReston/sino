export async function removeBackgroundFromImageSource(source: string): Promise<string> {
  const apiUrl = import.meta.env.VITE_BG_REMOVAL_API_URL || import.meta.env.VITE_BACKGROUND_REMOVAL_API_URL;
  const apiKey = import.meta.env.VITE_BG_REMOVAL_API_KEY || import.meta.env.VITE_BACKGROUND_REMOVAL_API_KEY;

  if (!apiUrl) {
    throw new Error('Background removal API is not configured. Set VITE_BG_REMOVAL_API_URL in your environment.');
  }

  const imageBlob = await sourceToBlob(source);
  const formData = new FormData();
  formData.append('image', imageBlob, 'source.png');

  const headers: Record<string, string> = {};
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Background removal API failed: ${response.status} ${response.statusText} ${text}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const json = await response.json();
    if (typeof json.image === 'string' && json.image.startsWith('data:')) {
      return json.image;
    }
    if (typeof json.url === 'string') {
      return json.url;
    }
    throw new Error('Background removal API returned unexpected JSON response.');
  }

  if (contentType.includes('text/')) {
    const text = await response.text();
    return text.trim();
  }

  const outputBlob = await response.blob();
  return blobToDataURL(outputBlob);
}

async function sourceToBlob(source: string): Promise<Blob> {
  if (source.startsWith('data:')) {
    return dataURLToBlob(source);
  }
  const resp = await fetch(source);
  if (!resp.ok) {
    throw new Error(`Failed to fetch source image for background removal: ${resp.status}`);
  }
  return resp.blob();
}

function dataURLToBlob(dataURL: string): Blob {
  const [meta, base64] = dataURL.split(',');
  const matches = meta.match(/data:(.*?);base64/);
  const contentType = matches?.[1] || 'image/png';
  const byteString = atob(base64);
  const arrayBuffer = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    arrayBuffer[i] = byteString.charCodeAt(i);
  }
  return new Blob([arrayBuffer], { type: contentType });
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to data URL')); 
      }
    };
    reader.onerror = () => reject(new Error('Failed to read blob as data URL'));
    reader.readAsDataURL(blob);
  });
}
