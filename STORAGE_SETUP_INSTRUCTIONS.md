# 📦 Supabase Storage Setup - Complete Instructions

## ✅ What's Been Done

All code has been updated to use proper storage buckets and upload functions:

1. **Storage utility library created** ([lib/storage.ts](lib/storage.ts))
   - `uploadDogPhoto()` - Upload dog photos to public bucket
   - `uploadVaccinationCertificate()` - Upload vaccination docs to private bucket
   - `uploadMedicalRecord()` - Upload medical records to private bucket
   - `deleteFile()` - Delete files from storage
   - File validation (type, size)
   - Error handling

2. **Add Dog page updated** ([app/dashboard/add-dog/page.tsx](app/dashboard/add-dog/page.tsx))
   - Dog photo upload (max 5MB, JPEG/PNG/WebP)
   - Vaccination certificate upload (max 10MB, PDF/Images)
   - Automatic file validation
   - Progress indicators

3. **Documents page updated** ([app/dashboard/documents/page.tsx](app/dashboard/documents/page.tsx))
   - Upload any document type (vaccination, medical, insurance, other)
   - Automatic bucket selection based on type
   - Delete documents with storage cleanup
   - View documents with signed URLs for private files

---

## 🚀 Setup Steps (Run ONCE in Supabase)

### Step 1: Go to Supabase Dashboard

1. Open your Supabase project: https://supabase.com/dashboard
2. Select your project: **Canine Paradise** (hmlmazrdoglqfictjcnm)
3. Go to **SQL Editor** (left sidebar)

### Step 2: Run Storage Setup SQL

1. Click **"New Query"**
2. Copy the entire contents of [`supabase/storage-setup.sql`](supabase/storage-setup.sql)
3. Paste into the SQL editor
4. Click **"Run"** (or press Ctrl/Cmd + Enter)

**Expected Output:**
```
✅ Storage buckets and policies configured successfully!

Buckets created:
  - dog-photos (public)
  - vaccination-docs (private)
  - medical-records (private)

Storage policies applied ✓
```

### Step 3: Verify Buckets Created

1. Go to **Storage** in the left sidebar
2. You should see 3 buckets:
   - `dog-photos` (Public)
   - `vaccination-docs` (Private)
   - `medical-records` (Private)

### Step 4: Verify Policies (Optional)

1. Click on each bucket
2. Click **"Policies"** tab
3. You should see policies like:
   - "Allow authenticated users to upload dog photos"
   - "Allow public to view dog photos"
   - "Allow users to view own vaccination docs"
   - "Allow staff to view all vaccination docs"

---

## 📋 What Each Bucket Does

### 1. `dog-photos` (Public Bucket)
**Purpose**: Store dog profile photos

**Access**:
- ✅ Anyone can view (public)
- ✅ Authenticated users can upload
- ✅ Users can delete their own photos

**File Types**: JPEG, PNG, WebP
**Max Size**: 5MB
**Path Structure**: `{userId}/{dogId}_{timestamp}.jpg`

**Used In**:
- Add dog form (photo upload)
- Dog profile cards
- Dashboard displays

---

### 2. `vaccination-docs` (Private Bucket)
**Purpose**: Store vaccination certificates

**Access**:
- ✅ Users can view their own docs
- ✅ Staff/Admin can view all docs
- ✅ Users can upload their own docs
- ✅ Users can delete their own docs

**File Types**: PDF, JPEG, PNG, WebP
**Max Size**: 10MB
**Path Structure**: `{userId}/vaccination_{dogId}_{timestamp}.pdf`

**Used In**:
- Add dog form (vaccination certificate upload)
- Documents page (upload/view/delete)

**Note**: Files are accessed via signed URLs (temporary secure links)

---

### 3. `medical-records` (Private Bucket)
**Purpose**: Store medical records, insurance docs, other sensitive documents

**Access**:
- ✅ Users can view their own docs
- ✅ Staff/Admin can view all docs
- ✅ Users can upload their own docs

**File Types**: PDF, JPEG, PNG, WebP
**Max Size**: 10MB
**Path Structure**: `{userId}/{docType}_{dogId}_{timestamp}.pdf`

**Used In**:
- Documents page (all non-vaccination docs)

---

## 🧪 Testing the Upload System

### Test 1: Dog Photo Upload

1. **Login** to user account
2. Go to **Dashboard** → **Add Dog**
3. Fill in basic dog info
4. **Upload a photo** (JPEG/PNG, max 5MB)
5. You should see:
   - ✅ Preview of the photo
   - ✅ File name displayed
6. Complete the form and submit
7. **Verify**:
   - Go to Supabase → Storage → dog-photos
   - You should see the uploaded photo
   - Dog profile should show the photo

### Test 2: Vaccination Certificate Upload

1. Stay in **Add Dog** form
2. Go to **Health Information** section
3. Mark dog as "Vaccinated"
4. **Upload vaccination certificate** (PDF or image, max 10MB)
5. You should see:
   - ✅ File name displayed
   - ✅ Green checkmark when selected
6. Complete the form and submit
7. **Verify**:
   - Go to Supabase → Storage → vaccination-docs
   - You should see the uploaded certificate
   - Go to Dashboard → Documents → dog's name
   - Certificate should be listed

### Test 3: Additional Documents Upload

1. Go to **Dashboard** → **Documents**
2. Click **"Upload Document"**
3. Select a dog from dropdown
4. Choose document type (vaccination, medical, insurance, other)
5. **Upload a file**
6. Click **"Upload Document"**
7. **Verify**:
   - Document appears in the dog's document list
   - Click "View" to see the document
   - Supabase Storage shows the file

### Test 4: Delete Document

1. In **Documents** page
2. Find a document
3. Click the **trash icon** (🗑️)
4. Confirm deletion
5. **Verify**:
   - Document removed from list
   - File deleted from Supabase Storage

---

## 🐛 Troubleshooting

### Problem: "Error uploading photo"

**Possible Causes**:
1. Storage buckets not created
   - **Solution**: Run `storage-setup.sql` in Supabase SQL Editor

2. File too large
   - **Solution**: Photos max 5MB, documents max 10MB

3. Invalid file type
   - **Solution**: Use JPEG, PNG, WebP for photos; PDF/Images for docs

4. Not authenticated
   - **Solution**: Make sure user is logged in

### Problem: "Failed to upload vaccination document"

**Possible Causes**:
1. Wrong bucket name (check SQL was run correctly)
   - **Solution**: Verify buckets exist in Supabase → Storage

2. RLS policies not applied
   - **Solution**: Re-run `storage-setup.sql`

3. File path issue
   - **Solution**: Check browser console for detailed error

### Problem: "Can't view document" or "Access denied"

**Possible Causes**:
1. Private bucket requires signed URL (should be automatic)
   - **Solution**: Check storage.ts `getSignedUrl()` function is being called

2. RLS policy blocking access
   - **Solution**: Verify user owns the dog or is staff/admin

3. URL expired (signed URLs expire after 1 year by default)
   - **Solution**: Refresh the page to generate new signed URL

### Problem: "Document deleted but file still in storage"

**Possible Cause**: Delete function didn't extract file path correctly

**Solution**:
1. Manually delete from Supabase → Storage
2. Check the file path extraction logic in documents page

---

## 📊 Storage Quotas

**Supabase Free Tier**:
- 1GB storage total
- Unlimited bandwidth (within fair use)

**Current Usage Estimate**:
- Dog photo (compressed): ~500KB - 2MB each
- Vaccination cert (PDF): ~200KB - 5MB each
- Medical record: ~500KB - 3MB each

**Example Capacity**:
- ~1000 dog photos (1MB avg)
- ~200 vaccination certs (5MB avg)
- Mix: ~300 dogs with photos + docs

**To Monitor**:
- Supabase Dashboard → Settings → Usage
- Watch storage usage meter

**If You Exceed**:
- Upgrade to Pro plan ($25/month) for 100GB
- Or implement image compression before upload

---

## 🔒 Security Notes

### What's Protected:

1. **Dog Photos** (Public)
   - Anyone can view (intended for displaying on site)
   - Only authenticated users can upload
   - Only owner can delete

2. **Vaccination Docs** (Private)
   - Only owner can view their own
   - Staff/admin can view all
   - Temporary signed URLs (secure)

3. **Medical Records** (Private)
   - Only owner can view their own
   - Staff/admin can view all
   - Temporary signed URLs (secure)

### Row Level Security (RLS)

All storage policies use RLS to ensure:
- Users can only access their own files (unless staff/admin)
- File paths are organized by user ID
- Policies verified on every request

### Best Practices:

1. **Never expose service role key** in client-side code
2. **Always validate file types** (done automatically)
3. **Enforce size limits** (done automatically)
4. **Use signed URLs** for private files (done automatically)
5. **Delete files when dogs/users are deleted** (consider adding this)

---

## ✅ Checklist for Going Live

- [ ] Run `storage-setup.sql` in Supabase SQL Editor
- [ ] Verify 3 buckets created (dog-photos, vaccination-docs, medical-records)
- [ ] Test dog photo upload
- [ ] Test vaccination certificate upload
- [ ] Test document upload from Documents page
- [ ] Test document deletion
- [ ] Test viewing private documents (signed URLs work)
- [ ] Verify RLS policies (users can't see other users' private files)
- [ ] Check storage usage in Supabase dashboard
- [ ] Set up monitoring/alerts for storage quota

---

## 🎉 Success Criteria

When everything is working, you should be able to:

1. ✅ Upload dog photo in add-dog form → see preview → save → photo shows in dashboard
2. ✅ Upload vaccination cert in add-dog form → save → see in documents page
3. ✅ Upload additional docs in documents page → see immediately in list
4. ✅ View all documents (public and private) without errors
5. ✅ Delete documents → file removed from storage and database
6. ✅ Staff/admin can view all users' documents
7. ✅ Regular users can only see their own documents

---

## 📞 Need Help?

**Common Issues**:
- "Bucket not found" → Run storage-setup.sql
- "Access denied" → Check RLS policies were created
- "File too large" → Compress image or reduce PDF size
- "Upload failed" → Check browser console for detailed error

**Next Steps After This Works**:
1. Configure Stripe payment integration
2. Set up email notifications
3. Update environment variables for production
4. Test on mobile devices

---

*Last Updated: October 3, 2025*
*All code changes are committed and ready to deploy*
