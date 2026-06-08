
-- Create the media storage bucket for user-uploaded videos and audio
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  52428800,  -- 50MB limit
  ARRAY[
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/aac',
    'audio/mp4',
    'audio/webm'
  ]
) ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage: users can only manage their own folder
CREATE POLICY "users_upload_own_media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "users_read_own_media" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "users_delete_own_media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read since bucket is public (needed for video/audio playback)
CREATE POLICY "public_read_media" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'media');
