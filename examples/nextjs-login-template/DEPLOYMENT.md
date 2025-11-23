# Deployment Guide

Simple guide for deploying your white-label login page.

---

## Vercel (Recommended)

**Easiest deployment option with automatic SSL and CDN.**

### Steps:

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/login-page.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Add environment variables
   - Click "Deploy"

3. **Configure Custom Domain**
   - Project Settings → Domains
   - Add `login.yourdomain.com`
   - Update DNS with CNAME record

---

## Alternative Platforms

### Netlify
Similar to Vercel - import from GitHub and deploy

### Cloudflare Pages
Free tier with unlimited bandwidth

### Railway
Simple deployment from GitHub

---

## DNS Configuration

Add a CNAME record:

```
Type: CNAME
Name: login
Value: cname.vercel-dns.com (or your platform's CNAME)
```

---

## SSL/HTTPS

Vercel and other platforms automatically provision SSL certificates via Let's Encrypt.

---

## Checklist

- [ ] Domain configured
- [ ] SSL certificate active
- [ ] Environment variables set
- [ ] OAuth flow tested
- [ ] Branding displays correctly

---

**That's it!** Your login page is live.
