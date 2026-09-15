# Jobs & News Portal (Cloudflare Workers + D1)

A production-ready Jobs + News website built as a **single Cloudflare Worker**.
No React, no Tailwind, no build step. Just HTML, custom CSS, and vanilla JavaScript.

## Features

- Public Jobs portal with SEO-friendly slug URLs
- Public News CMS
- Global search (jobs + news) with tabs and pagination
- Filters for jobs (category, type, experience, location, WFH)
- Admin dashboard (jobs / news / submissions / categories / settings)
- External **Apply Now** redirect with intermediate confirmation page
- Secure admin auth (PBKDF2, HttpOnly Secure cookies, CSRF tokens)
- HTML sanitization for all user/admin content
- Dynamic `sitemap.xml` and `robots.txt`
- Open Graph, Twitter cards, JSON-LD (JobPosting / NewsArticle / Breadcrumbs)
- AdSense-ready with clearly-marked placeholders
- User submission system (pending moderation)
- Fully responsive and mobile-first
- Cloudflare asset caching for public pages

## Requirements

- Node.js 18+ and npm
- A Cloudflare account
- Wrangler CLI (installed as a project dev-dependency)

## Installation

```bash
npm install
npx wrangler login
