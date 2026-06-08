-- Allow image uploads in the media storage bucket (for photo overlays)
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
  'audio/mpeg',
  'audio/mp3',
  'audio/x-mp3',
  'audio/x-mpeg',
  'audio/x-mpeg-3',
  'audio/wav',
  'audio/ogg',
  'audio/aac',
  'audio/mp4',
  'audio/webm',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
]
WHERE id = 'media';
