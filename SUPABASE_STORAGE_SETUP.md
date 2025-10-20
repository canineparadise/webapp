# Supabase Storage Setup for Assessment Videos

## Step 1: Create Storage Bucket

1. Go to your Supabase project dashboard
2. Click on **Storage** in the left sidebar
3. Click **New bucket**
4. Enter the following details:
   - **Name:** `assessment-videos`
   - **Public bucket:** ✅ Check this box (videos need to be accessible)
   - **File size limit:** 500MB
   - **Allowed MIME types:** Leave empty or add: `video/mp4, video/webm, video/ogg, video/quicktime`
5. Click **Create bucket**

## Step 2: Set Up Storage Policies

After creating the bucket, set up the following policies:

### Policy 1: Allow Authenticated Users to Upload (Staff Only)
```sql
CREATE POLICY "Staff can upload assessment videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'assessment-videos' AND
  (auth.jwt() ->> 'user_role')::text = 'staff'
);
```

### Policy 2: Allow Public Read Access (Anyone can view videos)
```sql
CREATE POLICY "Anyone can view assessment videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'assessment-videos');
```

### Alternative Simple Policies (If role-based auth isn't set up yet)

If you don't have role-based authentication, use these simpler policies:

#### Allow All Authenticated Users to Upload
```sql
CREATE POLICY "Authenticated users can upload assessment videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'assessment-videos');
```

#### Allow All Authenticated Users to Delete Their Own Videos
```sql
CREATE POLICY "Users can delete own assessment videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'assessment-videos' AND auth.uid() = owner);
```

## Step 3: Verify Setup

1. Go back to **Storage** in Supabase
2. Click on the `assessment-videos` bucket
3. You should see the policies listed
4. Try uploading a test video through the staff portal

## Troubleshooting

### If upload fails with "new row violates row-level security policy":
- Check that the INSERT policy exists
- Verify the user is authenticated
- Check browser console for detailed error messages

### If videos don't play:
- Verify the bucket is set to **Public**
- Check that the SELECT policy exists
- Ensure the video file format is supported (MP4, WebM, OGG)

### If file size error:
- Default Supabase limit is 50MB
- You may need to contact Supabase support to increase to 500MB
- Or adjust your requirements to 50MB-100MB max

## File Size Recommendations

- **Current setting:** 500MB max
- **Recommended:** 100-200MB for better performance
- **Compression:** Encourage staff to compress videos before upload
- **Format:** MP4 (H.264) is most compatible across browsers

## Storage Costs

Supabase Free Tier includes:
- 1GB storage
- 2GB bandwidth per month

Paid plans start at $25/month:
- 100GB storage
- 200GB bandwidth

Monitor your usage in the Supabase dashboard under **Settings > Usage**.
