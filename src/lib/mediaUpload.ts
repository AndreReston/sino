import { supabase } from './supabase';
import { uploadMediaFile, saveUserMedia } from './userStorage';
import type { VideoProject } from '../store/videoStore';

export function isEphemeralMediaUrl(url: string | undefined | null): boolean {
  return !!url && url.startsWith('blob:');
}

export function projectHasEphemeralUrls(project: VideoProject): boolean {
  for (const clip of project.clips) {
    if (isEphemeralMediaUrl(clip.url)) return true;
  }
  for (const track of project.audioTracks) {
    if (isEphemeralMediaUrl(track.url)) return true;
  }
  if (project.backgroundMusic && isEphemeralMediaUrl(project.backgroundMusic.url)) return true;
  for (const sticker of project.stickerOverlays ?? []) {
    if (sticker.type === 'photo' && isEphemeralMediaUrl(sticker.content)) return true;
  }
  return false;
}

export function countEphemeralUrls(project: VideoProject): number {
  let count = 0;
  for (const clip of project.clips) {
    if (isEphemeralMediaUrl(clip.url)) count++;
  }
  for (const track of project.audioTracks) {
    if (isEphemeralMediaUrl(track.url)) count++;
  }
  if (project.backgroundMusic && isEphemeralMediaUrl(project.backgroundMusic.url)) count++;
  for (const sticker of project.stickerOverlays ?? []) {
    if (sticker.type === 'photo' && isEphemeralMediaUrl(sticker.content)) count++;
  }
  return count;
}

function mediaTypeFromFile(file: File): 'image' | 'video' {
  return file.type.startsWith('video/') ? 'video' : 'image';
}

async function uploadToLocalServer(file: File): Promise<string | null> {
  try {
    const body = new FormData();
    body.append('file', file);
    const res = await fetch('/api/media/upload', { method: 'POST', body });
    if (!res.ok) return null;
    const payload = await res.json();
    if (!payload.url) return null;
    return payload.url.startsWith('http')
      ? payload.url
      : `${window.location.origin}${payload.url}`;
  } catch {
    return null;
  }
}

/**
 * Upload a file to durable storage. Prefers Supabase when signed in.
 * Never returns a blob: URL — those only work in the current browser session.
 */
export const MAX_MEDIA_FILE_SIZE = 1024 * 1024 * 1024; // 1 GB

// S2: Client-side file size validation before upload
export function validateMediaFile(file: File): { valid: boolean; error: string | null } {
  if (file.size > MAX_MEDIA_FILE_SIZE) {
    return {
      valid: false,
      error: 'File is too large for upload. Maximum allowed size is 1 GB.',
    };
  }
  return { valid: true, error: null };
}

export async function uploadMediaForPersistence(
  file: File
): Promise<{ url: string | null; error: string | null }> {
  // S2: Validate file size before attempting upload
  const validation = validateMediaFile(file);
  if (!validation.valid) {
    return {
      url: null,
      error: validation.error,
    };
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { url, error: uploadError } = await uploadMediaFile(file);
    if (url) {
      saveUserMedia({
        name: file.name,
        url,
        type: mediaTypeFromFile(file),
      }).catch(() => { /* non-blocking */ });
      return { url, error: null };
    }
    return {
      url: null,
      error: uploadError ?? 'Cloud upload failed. Check your connection and try again.',
    };
  }

  const localUrl = await uploadToLocalServer(file);
  if (localUrl) {
    return { url: localUrl, error: null };
  }

  return {
    url: null,
    error: 'Sign in so your media is saved to the cloud and works on all your devices.',
  };
}

export async function getVideoDuration(file: File): Promise<number> {
  const blobUrl = URL.createObjectURL(file);
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  try {
    return await new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
        video.onloadedmetadata = null;
        video.onerror = null;
      };

      video.onloadedmetadata = () => {
        cleanup();
        resolve(video.duration);
      };

      video.onerror = () => {
        cleanup();
        reject(new Error('Could not read video metadata'));
      };

      // S8: Set timeout to prevent hanging if loadedmetadata never fires
      timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error('Video metadata load timed out'));
      }, 10000); // 10 second timeout

      video.src = blobUrl;
    });
  } finally {
    // S8: Always revoke the blob URL to prevent memory leaks
    URL.revokeObjectURL(blobUrl);
  }
}

export async function getAudioDuration(file: File): Promise<number> {
  const blobUrl = URL.createObjectURL(file);
  try {
    return await new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.preload = 'metadata';
      audio.addEventListener('loadedmetadata', () => {
        resolve(isFinite(audio.duration) ? audio.duration : 0);
      }, { once: true });
      audio.addEventListener('error', () => reject(new Error('Could not read audio metadata')), { once: true });
      audio.src = blobUrl;
      audio.load();
    });
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}
