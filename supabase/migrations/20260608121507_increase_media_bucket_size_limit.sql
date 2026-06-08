UPDATE storage.buckets
SET file_size_limit = 262144000  -- 250 MB
WHERE id = 'media';
