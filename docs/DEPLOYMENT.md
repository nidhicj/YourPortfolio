# Deployment Instructions

This guide covers deploying the Portfolio Corridor website to various hosting platforms.

## Prerequisites

1. Build the project:
   ```bash
   npm install
   npm run build
   ```

2. Ensure the `dist/` directory is generated successfully.

## Netlify Deployment

### Option 1: Netlify CLI

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Deploy:
   ```bash
   netlify deploy --prod --dir=dist
   ```

### Option 2: GitHub Integration

1. Push your code to GitHub.

2. Go to [Netlify](https://www.netlify.com) and click "New site from Git".

3. Select your repository.

4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 18 (or latest LTS)

5. Click "Deploy site".

### Option 3: Drag & Drop

1. After building (`npm run build`), go to Netlify dashboard.

2. Drag and drop the `dist` folder.

3. Your site will be live immediately!

## Vercel Deployment

### Option 1: Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   npm run build
   vercel --prod
   ```

### Option 2: GitHub Integration

1. Push your code to GitHub.

2. Go to [Vercel](https://vercel.com) and click "New Project".

3. Import your repository.

4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Click "Deploy".

## GitHub Pages

### Option 1: Using GitHub Actions (Recommended)

1. Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [ main ]

   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
         - run: npm install
         - run: npm run build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

2. Update `vite.config.js` to include base path:
   ```javascript
   export default defineConfig({
     base: '/your-repo-name/',
     // ... rest of config
   });
   ```

3. Push to GitHub and the workflow will deploy automatically.

### Option 2: Manual Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Update `vite.config.js` base path (same as above).

3. Copy contents of `dist/` to the `gh-pages` branch.

## Environment Variables

If needed, create environment variables for:

- API endpoints
- Analytics IDs
- Feature flags

For Netlify/Vercel, set these in the dashboard under Site Settings → Environment Variables.

## Custom Domain

### Netlify

1. Go to Site Settings → Domain Management.
2. Click "Add custom domain".
3. Follow DNS configuration instructions.

### Vercel

1. Go to Project Settings → Domains.
2. Add your domain.
3. Configure DNS as instructed.

## Post-Deployment Checklist

- [ ] Test the site on mobile devices
- [ ] Verify all assets load correctly
- [ ] Check console for errors
- [ ] Test scroll functionality
- [ ] Test door interactions
- [ ] Verify modal functionality
- [ ] Check loading screen
- [ ] Test on different browsers

## Troubleshooting

### 404 Errors on Routes

For SPA routing, configure redirects:

**Netlify** (`netlify.toml`):
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Vercel** (`vercel.json`):
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Assets Not Loading

- Check that asset paths use relative paths (`./` or `/`)
- Verify assets are in the `dist/assets/` directory after build
- Clear browser cache

### Performance Issues

- Enable compression on the hosting platform
- Use CDN for static assets
- Optimize images before uploading
- Enable gzip/brotli compression

## CI/CD Integration

For automated deployments, consider:

- **GitHub Actions**: Already covered above
- **GitLab CI**: Similar workflow configuration
- **CircleCI**: Configure build and deploy jobs

## Monitoring

After deployment, set up:

- **Analytics**: Google Analytics, Plausible, etc.
- **Error Tracking**: Sentry, Bugsnag
- **Performance Monitoring**: Lighthouse CI, Web Vitals



