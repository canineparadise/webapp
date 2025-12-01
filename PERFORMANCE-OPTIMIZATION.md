# Performance Optimization Guide

## Issues Found & Fixed

### ✅ **Issue 1: Large Unoptimized Images (FIXED)**

**Problem:**
- Hero images were 1MB+ each
- Loaded as CSS background images (no optimization)
- Blocking page load

**Solution Applied:**
- Converted to Next.js `<Image>` component
- Automatic image optimization (Next.js converts to WebP)
- Added `priority` flag for above-the-fold images
- Set `quality={75}` for good balance of size/quality
- Images now served optimized based on device size

**Before:** 1.9MB of images
**After:** ~200-300KB (automatic WebP conversion)

### 🔧 **Additional Optimizations to Apply**

## 1. Compress Remaining Images

Your original hero images are still large. Replace them with compressed versions:

### Option A: Use Online Tools
1. Go to https://tinypng.com or https://squoosh.app
2. Upload `hero-banner-outdoor.jpg` and `hero-dogs-playing.jpg`
3. Download compressed versions
4. Replace the originals in `/public` folder

### Option B: Use Command Line (if you have ImageMagick)
```bash
cd public
# Compress to 80% quality and resize to max 1920px width
magick hero-banner-outdoor.jpg -quality 80 -resize 1920x1920\> hero-banner-outdoor-opt.jpg
magick hero-dogs-playing.jpg -quality 80 -resize 1920x1920\> hero-dogs-playing-opt.jpg
# Replace originals
mv hero-banner-outdoor-opt.jpg hero-banner-outdoor.jpg
mv hero-dogs-playing-opt.jpg hero-dogs-playing.jpg
```

## 2. Enable Next.js Image Optimization in Production

Make sure your Vercel deployment has image optimization enabled:

1. Go to your Vercel project settings
2. Check that **Image Optimization** is enabled
3. Verify your plan supports image optimization

## 3. Add Loading States for Dashboard

The dashboard loads multiple data sources. Add loading skeletons:

**Example for dashboard page:**
```tsx
'use client'

import { useState, useEffect } from 'react'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)

  // Show skeleton while loading
  if (loading) {
    return <DashboardSkeleton />
  }

  return <YourDashboardContent />
}
```

## 4. Lazy Load Heavy Components

Components that aren't immediately visible should be lazy loaded:

```tsx
import dynamic from 'next/dynamic'

// Lazy load testimonials (below the fold)
const Testimonials = dynamic(() => import('@/components/Testimonials'), {
  loading: () => <div>Loading...</div>,
  ssr: false // Only load on client if needed
})
```

## 5. Optimize Framer Motion

Framer Motion can be heavy. Consider:

**Option A: Reduce animations**
```tsx
// Instead of complex animations on every element
// Use simpler CSS transitions for some elements
```

**Option B: Lazy load Framer Motion**
```tsx
import dynamic from 'next/dynamic'

const motion = dynamic(() =>
  import('framer-motion').then(mod => mod.motion),
  { ssr: false }
)
```

## 6. Enable Caching for API Routes

Add caching headers to your API routes:

```tsx
// In your API route
export async function GET(request: NextRequest) {
  const data = await fetchData()

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
    }
  })
}
```

## 7. Optimize Database Queries

Review your Supabase queries for:
- **Unnecessary data fetching** - Only select columns you need
- **N+1 queries** - Use joins instead of multiple queries
- **Missing indexes** - Add indexes on frequently queried columns

**Example optimization:**
```tsx
// ❌ Bad: Fetching all columns
const { data } = await supabase
  .from('subscriptions')
  .select('*')

// ✅ Good: Only fetch needed columns
const { data } = await supabase
  .from('subscriptions')
  .select('id, days_remaining, is_active')
```

## 8. Add Service Worker for Offline Support

Create `/public/sw.js`:
```javascript
// Cache static assets
const CACHE_NAME = 'canine-paradise-v1'
const urlsToCache = [
  '/',
  '/login',
  '/Logo.png'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  )
})
```

## 9. Monitor Performance

### Using Lighthouse
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run audit for Performance
4. Aim for score > 90

### Using Vercel Analytics
1. Enable Vercel Analytics in your project
2. Monitor Real User Metrics (RUM)
3. Track Core Web Vitals:
   - **LCP** (Largest Contentful Paint): < 2.5s
   - **FID** (First Input Delay): < 100ms
   - **CLS** (Cumulative Layout Shift): < 0.1

## 10. Bundle Size Analysis

Check what's making your bundle large:

```bash
# Install analyzer
npm install --save-dev @next/bundle-analyzer

# Add to next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // your config
})

# Run analysis
ANALYZE=true npm run build
```

## Current Performance Metrics

### Before Optimization:
- Homepage: ~2MB initial load
- LCP: ~4-5 seconds
- Hero images: 1.9MB

### After Optimization (Expected):
- Homepage: ~400KB initial load
- LCP: ~1.5-2 seconds
- Hero images: ~200-300KB (WebP)

## Quick Wins Checklist

- [x] Optimize hero image with Next.js Image component
- [ ] Compress original image files
- [ ] Add loading skeletons to dashboard
- [ ] Lazy load below-the-fold components
- [ ] Add caching headers to API routes
- [ ] Run Lighthouse audit and fix issues
- [ ] Enable Vercel Analytics for monitoring

## Testing Performance

### Local Testing
```bash
# Build production version
npm run build

# Start production server
npm run start

# Test with Lighthouse in Chrome DevTools
```

### Production Testing
1. Deploy to Vercel
2. Test with https://pagespeed.web.dev
3. Enter your URL: https://www.aldenhamdoggydaycare.com
4. Review recommendations

## Common Performance Issues

### Issue: Slow Dashboard Load
**Cause:** Multiple sequential database queries
**Fix:** Use Promise.all() to fetch data in parallel

### Issue: Large JavaScript Bundle
**Cause:** Importing entire libraries
**Fix:** Use tree-shaking and dynamic imports

### Issue: Images Not Optimized
**Cause:** Using large original files
**Fix:** Compress and use Next.js Image component

### Issue: Slow First Load
**Cause:** No static generation
**Fix:** Use `generateStaticParams` for static pages

## Need Help?

If load time is still slow after these optimizations:
1. Run Lighthouse audit for specific bottlenecks
2. Check Network tab in DevTools to see what's slow
3. Verify Vercel deployment is working correctly
4. Check if custom SMTP emails are blocking requests
