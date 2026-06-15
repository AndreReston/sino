import { VideoProject, VideoClip, AudioTrack, StickerOverlay } from '../store/videoStore';

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

  // Render subtitle entries with style support
  for (const subtitle of (project.subtitles ?? [])) {
    if (timestamp >= subtitle.startTime && timestamp <= subtitle.endTime) {
      ctx.save();

      const fontSize = Math.round(height * 0.045);
      const fontFamily = 'Arial, sans-serif';
      const style = subtitle.style ?? 'minimal';
      const progress = (timestamp - subtitle.startTime) / (subtitle.endTime - subtitle.startTime);

      // Calculate position
      const posY = subtitle.position === 'top' ? height * 0.1
        : subtitle.position === 'middle' ? height * 0.5
        : height * 0.9;
      const posX = width / 2;
      const lines = String(subtitle.text).split('\n');
      const lineH = fontSize * 1.25;

      // Style-specific rendering
      if (style === 'karaoke') {
        // Karaoke: highlight words progressively
        ctx.font = `bold ${fontSize}px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        const totalChars = subtitle.text.length;
        const highlightedChars = Math.floor(totalChars * progress);
        const maxW = ctx.measureText(subtitle.text).width + 20;
        const bgH = lineH + 12;
        const bgX = posX - maxW / 2;
        const bgY = posY - bgH;

        // Background
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.roundRect?.(bgX, bgY, maxW, bgH, 6) ?? ctx.fillRect(bgX, bgY, maxW, bgH);
        ctx.fill();

        // Unhighlighted portion
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#666666';
        ctx.fillText(subtitle.text, posX, posY - 6);

        // Highlighted portion (clip to reveal karaoke effect)
        if (highlightedChars > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(bgX, bgY, (maxW * highlightedChars) / totalChars, bgH);
          ctx.clip();
          ctx.fillStyle = '#ffffff';
          ctx.fillText(subtitle.text, posX, posY - 6);
          ctx.restore();
        }
      } else if (style === 'tiktok' || style === 'pop-up') {
        // TikTok/Pop-up style: word-by-word pop in
        const words = subtitle.text.split(' ');
        const wordProgress = Math.floor(progress * words.length);
        const displayText = words.slice(0, wordProgress + 1).join(' ');

        ctx.font = `bold ${fontSize}px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        const maxW = ctx.measureText(displayText).width + 24;
        const bgH = lineH + 16;
        const bgX = posX - maxW / 2;
        const bgY = posY - bgH;

        // Animated scale on new word
        const wordFadeProgress = (progress * words.length) % 1;
        const scale = 1 + (wordFadeProgress < 0.1 ? (0.1 - wordFadeProgress) * 2 : 0);

        ctx.globalAlpha = 0.9;
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.roundRect?.(bgX, bgY, maxW, bgH, 8) ?? ctx.fillRect(bgX, bgY, maxW, bgH);
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(fontSize * scale)}px ${fontFamily}`;
        ctx.fillText(displayText, posX, posY - 8);
      } else if (style === 'bold-highlight') {
        // Bold highlight: current word is bold, rest is normal
        const words = subtitle.text.split(' ');
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        let totalW = 0;
        const wordWidths: number[] = [];
        for (const w of words) {
          ctx.font = `bold ${fontSize}px ${fontFamily}`;
          const wW = ctx.measureText(w + ' ').width;
          wordWidths.push(wW);
          totalW += wW;
        }

        const bgW = totalW + 24;
        const bgH = lineH + 12;
        const bgX = posX - bgW / 2;
        const bgY = posY - bgH;

        ctx.globalAlpha = 0.8;
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.roundRect?.(bgX, bgY, bgW, bgH, 6) ?? ctx.fillRect(bgX, bgY, bgW, bgH);
        ctx.fill();

        const highlightWord = Math.min(Math.floor(progress * words.length), words.length - 1);
        let cursorX = posX - totalW / 2;
        ctx.globalAlpha = 1;

        for (let i = 0; i < words.length; i++) {
          ctx.font = i === highlightWord ? `bold ${fontSize}px ${fontFamily}` : `normal ${fontSize}px ${fontFamily}`;
          ctx.fillStyle = i === highlightWord ? '#fbbf24' : '#ffffff';
          ctx.fillText(words[i], cursorX, posY - 6);
          cursorX += wordWidths[i];
        }
      } else {
        // Minimal (default): simple centered text
        ctx.font = `bold ${fontSize}px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        const maxW = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 28;
        const bgH = lines.length * lineH + 14;
        const bgX = posX - maxW / 2;
        const bgY = posY - bgH;

        ctx.globalAlpha = 0.75;
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.roundRect?.(bgX, bgY, maxW, bgH, 8) ?? ctx.fillRect(bgX, bgY, maxW, bgH);
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.fillStyle = '#ffffff';
        lines.forEach((line, i) => {
          ctx.fillText(line, posX, posY - (lines.length - 1 - i) * lineH - 7);
        });
      }

      ctx.restore();
    }
  }

  // Render sticker overlays
  for (const sticker of (project.stickerOverlays ?? [])) {
    if (timestamp >= sticker.startTime && timestamp <= sticker.endTime) {
      ctx.save();

      const x = (sticker.x / 100) * width;
      const y = (sticker.y / 100) * height;
      const scale = sticker.scale ?? 1;
      const rotation = (sticker.rotation ?? 0) * Math.PI / 180;
      const opacity = sticker.opacity ?? 1;

      ctx.globalAlpha = opacity;
      ctx.translate(x, y);
      ctx.rotate(rotation);

      if (sticker.type === 'emoji') {
        // Render emoji as text
        const emojiSize = Math.round(height * 0.08 * scale);
        ctx.font = `${emojiSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sticker.content, 0, 0);
      } else if (sticker.type === 'photo' && sticker.content) {
        // Photo sticker would need async image loading - render placeholder
        const size = Math.round(height * 0.15 * scale);
        ctx.fillStyle = sticker.color ?? '#333333';
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(-size / 2, -size / 2, size, size);
      } else if (sticker.type === 'shape') {
        // Render basic shape
        const size = Math.round(height * 0.06 * scale);
        ctx.fillStyle = sticker.color ?? '#ffffff';
        if (sticker.content === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, size, 0, Math.PI * 2);
          ctx.fill();
        } else if (sticker.content === 'heart') {
          ctx.beginPath();
          const s = size * 0.6;
          ctx.moveTo(0, s);
          ctx.bezierCurveTo(-s * 2, -s, -s * 0.5, -s * 2, 0, -s * 0.5);
          ctx.bezierCurveTo(s * 0.5, -s * 2, s * 2, -s, 0, s);
          ctx.fill();
        } else {
          // Default: square
          ctx.fillRect(-size / 2, -size / 2, size, size);
        }
      } else if (sticker.type === 'arrow') {
        const arrowLen = Math.round(height * 0.08 * scale);
        const arrowW = Math.round(height * 0.02 * scale);
        ctx.strokeStyle = sticker.color ?? '#ffffff';
        ctx.fillStyle = sticker.color ?? '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-arrowLen / 2, 0);
        ctx.lineTo(arrowLen / 2 - arrowW, 0);
        ctx.lineTo(arrowLen / 2 - arrowW, -arrowW);
        ctx.lineTo(arrowLen / 2, 0);
        ctx.lineTo(arrowLen / 2 - arrowW, arrowW);
        ctx.lineTo(arrowLen / 2 - arrowW, 0);
        ctx.stroke();
        ctx.fill();
      }

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
