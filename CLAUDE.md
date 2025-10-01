# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start the Next.js development server (hot reloading enabled)
- `npm run build` - Build the production-ready application
- `npm run start` - Start the production server (requires build first)
- `npm run lint` - Run Next.js linting checks

### Dependencies
- `npm install` - Install all project dependencies

## Architecture Overview

This is a Next.js 14 application for "Canine Paradise" - a doggy daycare webapp built with:
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom theme colors and utilities
- **UI**: React 18 with TypeScript, Framer Motion for animations
- **Icons**: Heroicons React
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Auth**: Supabase Auth with role-based access (admin, staff, user)
- **Database**: Supabase (PostgreSQL) - client configured at `/lib/supabase`
- **Payments**: Stripe integration (Stripe.js & server SDK installed)

### Project Structure
- `/app` - Next.js App Router pages and layouts
  - `/dashboard` - Protected user dashboard area
  - `/staff` - Staff and admin dashboard pages
  - `/login` - Authentication with Supabase
  - `/signup` - User registration
  - `/api` - API routes
- `/components` - Reusable React components (Navbar, Footer, Hero, Services, Team, etc.)
- `/lib` - Utility functions and configurations
- `/public` - Static assets

### Design System

Custom Tailwind theme colors defined:
- `canine-navy`: #1a3a52 (primary dark blue)
- `canine-gold`: #a68756 (accent gold)
- `canine-light-gold`: #c4a874
- `canine-cream`: #f5f2e8 (background)
- `canine-sky`: #e8f4f8 (light accent)

Custom font families:
- `sans`: Inter (body text)
- `display`: Poppins (headings)

Custom CSS utilities available:
- `.btn-primary`, `.btn-secondary`, `.btn-outline` - Button styles
- `.card` - Card component styling
- `.paw-pattern` - Decorative paw pattern background
- `.text-gradient` - Gradient text effect

Custom animations: `bounce-slow`, `wiggle`, `float`

### TypeScript Configuration
- Strict mode enabled
- Path alias configured: `@/*` maps to root directory
- JSX preserved for Next.js optimization

### Authentication & Authorization
- Uses Supabase Auth with email/password authentication
- Role-based routing: admin → `/staff/admin-dashboard`, staff → `/staff/dashboard`, users → `/dashboard`
- Password reset functionality implemented
- Demo credentials available in login page for testing