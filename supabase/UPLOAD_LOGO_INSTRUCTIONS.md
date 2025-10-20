# How to Add Logo to Email Templates

## Step 1: Upload Logo to Supabase Storage

1. Go to Supabase Dashboard → **Storage**
2. Create a new bucket called `public-assets` (make it PUBLIC)
3. Upload your logo file (`logo.jpeg` from your public folder)
4. After uploading, click on the logo file
5. Copy the **Public URL** (should look like: `https://hmlmazrdoglqfictjcnm.supabase.co/storage/v1/object/public/public-assets/logo.jpeg`)

## Step 2: Add Logo to Email Template

Replace the header section in your email template with this:

```html
<!-- Header with Navy Background -->
<tr>
  <td style="background: linear-gradient(135deg, #1a3a52 0%, #2a4a62 100%); padding: 40px 30px; text-align: center;">
    <img src="YOUR_LOGO_URL_HERE" alt="Canine Paradise Logo" style="max-width: 150px; height: auto; margin-bottom: 15px; border-radius: 8px;">
    <h1 style="margin: 0; color: #a68756; font-size: 32px; font-weight: bold;">Canine Paradise</h1>
    <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">Where Every Dog Finds Paradise</p>
  </td>
</tr>
```

Replace `YOUR_LOGO_URL_HERE` with the public URL from Step 1.

## Option 2: Use Your Vercel Domain (Easier)

Your logo is already at: `https://canineparadise-p88d.vercel.app/logo.jpeg`

Use this URL directly in the template!
