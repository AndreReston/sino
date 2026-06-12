import { VideoProject, VideoClip, AudioTrack } from '../store/videoStore';

export interface ExportOptions {
  fps?: number;
  width?: number;
  height?: number;
  quality?: number;
  bitrate?: string;
  onProgress?: (progress: number) => void;
}

const DEFAULT_FPS = 30;

/**
 * Render a single frame of the video composition at the given timestamp
 */
async function renderFrame(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  project: VideoProject,
  timestamp: number,
  clipMap: Map<string, HTMLVideoElement>
): Promise<void> {
  const width = canvas.width;
  const height = canvas.height;

  // Clear canvas with black background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  // Get the clip that should be playing at this timestamp
  const clipInfo = getClipAtTime(project, timestamp);
  
  if (clipInfo) {
    const clip = clipInfo.clip;
    const video = clipMap.get(clip.id);
    
    if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
      // Calculate the local time within the clip
      const videoTime = clip.trimStart + (clipInfo.clipLocalTime * clip.speed);
      
      // Only render if within bounds
      if (videoTime >= clip.trimStart && videoTime < clip.duration - clip.trimEnd) {
        try {
          video.currentTime = videoTime;
          
          // Apply clip transformations
          ctx.save();
          
          // Handle overlay mode (positioned) vs full-frame (fills canvas)
          if (clip.overlayMode === 'overlay') {
            const scaleX = clip.scaleX || 1;
            const scaleY = clip.scaleY || 1;
            const clipX = (clip.clipX || 50) / 100;
            const clipY = (clip.clipY || 50) / 100;
            
            const x = (width * clipX) - (width * scaleX * clipX);
            const y = (height * clipY) - (height * scaleY * clipY);
            const w = width * scaleX;
            const h = height * scaleY;
            
            ctx.globalAlpha = clip.opacity ?? 1;
            ctx.drawImage(video, x, y, w, h);
          } else {
            // Full-frame mode: scale to fill
            const scaleX = clip.scaleX || 1;
            const scaleY = clip.scaleY || 1;
            const videoAspect = video.videoWidth / video.videoHeight;
            const canvasAspect = width / height;
            
            let drawWidth = width * scaleX;
            let drawHeight = height * scaleY;
            
            if (videoAspect > canvasAspect) {
              drawHeight = drawWidth / videoAspect;
            } else {
              drawWidth = drawHeight * videoAspect;
            }
            
            const offsetX = (clip.offsetX || 0) / 100;
            const offsetY = (clip.offsetY || 0) / 100;
            
            const x = (width - drawWidth) / 2 + offsetX * width;
            const y = (height - drawHeight) / 2 + offsetY * height;
            
            ctx.globalAlpha = 1;
            ctx.drawImage(video, x, y, drawWidth, drawHeight);
          }
          
          // Apply filters as CSS would
          if (clip.filters) {
            const f = clip.filters;
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;
            
            // Apply brightness
            if (f.brightness !== 100) {
              const factor = f.brightness / 100;
              for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, data[i] * factor);
                data[i + 1] = Math.min(255, data[i + 1] * factor);
                data[i + 2] = Math.min(255, data[i + 2] * factor);
              }
            }
            
            // Apply contrast
            if (f.contrast !== 100) {
              const factor = f.contrast / 100;
              const intercept = 128 * (1 - factor);
              for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, Math.max(0, data[i] * factor + intercept));
                data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * factor + intercept));
                data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * factor + intercept));
              }
            }
            
            if (f.brightness !== 100 || f.contrast !== 100) {
              ctx.putImageData(imageData, 0, 0);
            }
          }
          
          ctx.restore();
        } catch (e) {
          // Video not ready yet
        }
      }
    }
  }

  // Render text overlays
  for (const overlay of project.textOverlays) {
    if (timestamp >= overlay.startTime && timestamp <= overlay.endTime) {
      ctx.save();

      const x = (overlay.x / 100) * width;
      const y = (overlay.y / 100) * height;
      const fontSize = overlay.fontSize ?? 32;
      const fontFamily = overlay.fontFamily ?? 'Arial';
      const fontWeight = overlay.fontWeight ?? 'normal';
      const textAlign = (overlay.textAlign as CanvasTextAlign) ?? 'left';
      const lineHeight = fontSize * 1.3;
      const lines = String(overlay.text).split('\n');

      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      ctx.textAlign = textAlign;
      ctx.textBaseline = 'top';

      const maxLineWidth = Math.max(...lines.map((l) => ctx.measureText(l).width));
      const bgPaddingX = 12;
      const bgPaddingY = 8;
      const bgW = maxLineWidth + bgPaddingX * 2;
      const bgH = lines.length * lineHeight + bgPaddingY * 2;
      const bgX = textAlign === 'center' ? x - bgW / 2 : textAlign === 'right' ? x - bgW : x - bgPaddingX;
      const bgY = y - bgPaddingY;

      // Draw background
      if (overlay.backgroundOpacity > 0) {
        ctx.globalAlpha = overlay.backgroundOpacity;
        ctx.fillStyle = overlay.backgroundColor ?? '#000000';
        const r = 6;
        ctx.beginPath();
        ctx.moveTo(bgX + r, bgY);
        ctx.lineTo(bgX + bgW - r, bgY);
        ctx.quadraticCurveTo(bgX + bgW, bgY, bgX + bgW, bgY + r);
        ctx.lineTo(bgX + bgW, bgY + bgH - r);
        ctx.quadraticCurveTo(bgX + bgW, bgY + bgH, bgX + bgW - r, bgY + bgH);
        ctx.lineTo(bgX + r, bgY + bgH);
        ctx.quadraticCurveTo(bgX, bgY + bgH, bgX, bgY + bgH - r);
        ctx.lineTo(bgX, bgY + r);
        ctx.quadraticCurveTo(bgX, bgY, bgX + r, bgY);
        ctx.closePath();
        ctx.fill();
      }

      // Draw text lines
      ctx.globalAlpha = overlay.opacity ?? 1;
      ctx.fillStyle = overlay.color ?? '#ffffff';
      lines.forEach((line, i) => {
        ctx.fillText(line, x, y + i * lineHeight);
      });

      ctx.restore();
    }
  }

  // Render subtitle entries
  for (const subtitle of (project.subtitles ?? [])) {
    if (timestamp >= subtitle.startTime && timestamp <= subtitle.endTime) {
      ctx.save();

      const fontSize = Math.round(height * 0.045);
      const fontFamily = 'Arial, sans-serif';
      ctx.font = `bold ${fontSize}px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';

      const posY = subtitle.position === 'top' ? height * 0.1
        : subtitle.position === 'middle' ? height * 0.5
        : height * 0.9;
      const posX = width / 2;

      const lines = String(subtitle.text).split('\n');
      const lineH = fontSize * 1.25;
      const maxW = Math.max(...lines.map((l) => ctx.measureText(l).width));
      const pad = 14;
      const bgW = maxW + pad * 2;
      const bgH = lines.length * lineH + pad;
      const bgX = posX - bgW / 2;
      const bgY = posY - bgH;

      // Background pill
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.roundRect?.(bgX, bgY, bgW, bgH, 8) ?? ctx.fillRect(bgX, bgY, bgW, bgH);
      ctx.fill();

      // Text
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#ffffff';
      lines.forEach((line, i) => {
        ctx.fillText(line, posX, posY - (lines.length - 1 - i) * lineH - pad / 2);
      });

      ctx.restore();
    }
  }
}

/**
 * Find the clip that should be active at a given timestamp
 */
function getClipAtTime(project: VideoProject, globalTime: number): { clip: VideoClip; clipLocalTime: number } | null {
  if (!project.clips.length) return null;

  const sorted = [...project.clips].sort((a, b) => a.order - b.order);
  let currentTime = 0;

  for (const clip of sorted) {
    const clipDuration = (clip.duration - clip.trimStart - clip.trimEnd) / Math.max(0.25, clip.speed);
    
    if (globalTime >= currentTime && globalTime < currentTime + clipDuration) {
      const clipLocalTime = globalTime - currentTime;
      return { clip, clipLocalTime };
    }
    
    currentTime += clipDuration;
  }

  return null;
}

/**
 * Calculate total duration of all clips
 */
function getTotalDuration(project: VideoProject): number {
  return project.clips.reduce((sum, c) => {
    return sum + (c.duration - c.trimStart - c.trimEnd) / Math.max(0.25, c.speed);
  }, 0);
}

/**
 * Main export function - renders video with audio and exports as WebM
 */
export async function exportVideo(
  project: VideoProject,
  options: ExportOptions = {}
): Promise<Blob> {
  const fps = options.fps || DEFAULT_FPS;
  const totalDuration = getTotalDuration(project);
  const frameCount = Math.ceil(totalDuration * fps);
  
  // Get canvas dimensions from aspect ratio
  const dims = options.width && options.height
    ? { width: options.width, height: options.height }
    : getCanvasDimensionsFromAspect(project.aspectRatio);
  const canvas = document.createElement('canvas');
  canvas.width = dims.width;
  canvas.height = dims.height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  // Create video elements for each clip
  const clipMap = new Map<string, HTMLVideoElement>();
  const clipPromises = project.clips.map(clip => {
    return new Promise<void>((resolve) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.preload = 'metadata';
      video.src = clip.url;
      
      const loadHandler = () => {
        video.removeEventListener('loadedmetadata', loadHandler);
        video.removeEventListener('error', errorHandler);
        resolve();
      };
      const errorHandler = () => {
        video.removeEventListener('loadedmetadata', loadHandler);
        video.removeEventListener('error', errorHandler);
        console.warn(`Failed to load video: ${clip.url}`);
        resolve();
      };
      
      video.addEventListener('loadedmetadata', loadHandler, { once: true });
      video.addEventListener('error', errorHandler, { once: true });
      
      clipMap.set(clip.id, video);
    });
  });

  await Promise.all(clipPromises);

  // Setup audio context for mixing (if there are audio tracks)
  let audioContext: AudioContext | null = null;
  let audioDestination: MediaStreamAudioDestinationNode | null = null;
  
  if ((project.audioTracks && project.audioTracks.length > 0) || project.backgroundMusic) {
    try {
      // S13: Check for browser support and handle AudioContext creation safely
      const AudioContextConstructor = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextConstructor) {
        console.warn('AudioContext not supported in this browser');
      } else {
        audioContext = new AudioContextConstructor();
        
        // S13: Handle suspended AudioContext state
        if (audioContext.state === 'suspended') {
          audioContext.resume().catch(() => {
            console.warn('Could not resume AudioContext');
          });
        }
        
        audioDestination = audioContext.createMediaStreamDestination();
        
        // Load and setup audio tracks
        for (const track of project.audioTracks || []) {
          try {
            // S13: Guard against missing audioDestination/audioContext
            if (!audioContext || !audioDestination) break;
            
            const response = await fetch(track.url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.playbackRate.value = 1; // Could use track.speed if available
            source.loop = false;
            
            const gainNode = audioContext.createGain();
            gainNode.gain.value = track.muted ? 0 : (track.volume || 0.8);
            
            source.connect(gainNode);
            gainNode.connect(audioDestination);
            
            // Schedule to play at the right time
            const now = audioContext.currentTime;
            source.start(now + track.startTime);
          } catch (e) {
            console.warn(`Failed to load audio track: ${track.url}`);
          }
        }
        
        // Setup background music
        if (project.backgroundMusic) {
          try {
            // S13: Guard against missing audioDestination/audioContext
            if (!audioContext || !audioDestination) {
              throw new Error('AudioContext or destination not available');
            }
            
            const response = await fetch(project.backgroundMusic.url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.loop = true;
            
            const gainNode = audioContext.createGain();
            gainNode.gain.value = project.backgroundMusic.muted ? 0 : (project.backgroundMusic.volume || 0.5);
            
            source.connect(gainNode);
            gainNode.connect(audioDestination);
            
            source.start(audioContext.currentTime);
          } catch (e) {
            console.warn(`Failed to load background music: ${project.backgroundMusic.url}`);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to setup audio context:', e);
      audioContext = null;
      audioDestination = null;
    }
  }

  // Combine video stream with audio stream
  const videoStream = canvas.captureStream(fps);
  let finalStream = videoStream;
  
  if (audioDestination) {
    const audioTrack = audioDestination.stream.getAudioTracks()[0];
    if (audioTrack) {
      finalStream.addTrack(audioTrack);
    }
  }

  // Setup MediaRecorder with fallback codec
  let mediaRecorder: MediaRecorder;
  const mimeTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  
  let selectedMimeType = mimeTypes[0];
  for (const mimeType of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      selectedMimeType = mimeType;
      break;
    }
  }
  
  const recorderOptions: MediaRecorderOptions = {
    mimeType: selectedMimeType,
  };
  if (options.bitrate) recorderOptions.videoBitsPerSecond = Number.parseInt(options.bitrate.replace(/\D/g, ''), 10) * 1000;
  else if (options.quality) recorderOptions.videoBitsPerSecond = Math.round((options.width || 1920) * (options.height || 1080) * options.quality * 8);
  
  mediaRecorder = new MediaRecorder(finalStream, recorderOptions);

  const chunks: BlobPart[] = [];

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  };

  // Start recording
  mediaRecorder.start();

  // Render frame by frame
  let currentFrame = 0;
  let lastTime = performance.now();
  
  return new Promise((resolve, reject) => {
    const renderNextFrame = async () => {
      if (currentFrame >= frameCount || !mediaRecorder || mediaRecorder.state === 'inactive') {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
        return;
      }

      const timestamp = currentFrame / fps;
      
      try {
        await renderFrame(canvas, ctx, project, timestamp, clipMap);
        
        if (options.onProgress) {
          options.onProgress((currentFrame / frameCount) * 100);
        }
        
        currentFrame++;
        // Use requestAnimationFrame for smooth rendering
        requestAnimationFrame(renderNextFrame);
      } catch (e) {
        console.error('Frame rendering error:', e);
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
        reject(e);
      }
    };

    mediaRecorder.onstop = () => {
      // Cleanup
      clipMap.forEach((v) => {
        v.pause();
        v.src = '';
      });
      
      if (audioContext) {
        audioContext.close();
      }
      
      const blob = new Blob(chunks, { type: selectedMimeType });
      resolve(blob);
    };

    mediaRecorder.onerror = (event) => {
      console.error('MediaRecorder error:', event.error);
      reject(new Error(`MediaRecorder error: ${event.error}`));
    };

    renderNextFrame();
  });
}


/**
 * Get canvas dimensions based on aspect ratio
 */
function getCanvasDimensionsFromAspect(aspectRatio: string): { width: number; height: number } {
  switch (aspectRatio) {
    case '16:9':
      return { width: 1920, height: 1080 };
    case '9:16':
      return { width: 1080, height: 1920 };
    case '1:1':
      return { width: 1080, height: 1080 };
    default:
      return { width: 1920, height: 1080 };
  }
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
