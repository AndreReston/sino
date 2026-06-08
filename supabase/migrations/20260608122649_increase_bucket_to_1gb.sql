-- Increase media bucket size limit to 1 GB for larger video uploads
UPDATE storage.buckets
SET file_size_limit = 1073741824  -- 1 GB
WHERE id = 'media';
