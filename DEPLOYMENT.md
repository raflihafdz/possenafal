# 🚀 Vercel Deployment Guide for PossENafal POS

## Pre-Deployment Checklist

### 1. **Environment Variables Setup**

You need to configure these in Vercel Dashboard:

#### **Required Variables (Set in Vercel):**
```
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require&channel_binding=require
AUTH_SECRET=[generate-a-random-secret]
AUTH_URL=https://your-domain.vercel.app
NEXTAUTH_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

#### **Optional Public Variables:**
```
NEXT_PUBLIC_APP_NAME=PossENafal POS
NEXT_PUBLIC_STORE_NAME=Your Store Name
NEXT_PUBLIC_STORE_ADDRESS=Your Address
NEXT_PUBLIC_STORE_PHONE=Your Phone
```

### 2. **How to Set Environment Variables in Vercel**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`possenafal`)
3. Click **Settings** → **Environment Variables**
4. Add each variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Your Neon PostgreSQL URL
   - **Environments**: Production, Preview, Development
   - Click **Save**

Repeat for: `AUTH_SECRET`, `AUTH_URL`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`

### 3. **Database URL from Neon**

Your Neon database URL looks like:
```
postgresql://neondb_owner:npg_8rnWZkquK4PI@ep-soft-pond-aqpmm9mp-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**Where to find it:**
1. Go to [Neon Console](https://console.neon.tech)
2. Select your project
3. Click **Connection String**
4. Copy the PostgreSQL connection string
5. Add `?sslmode=require&channel_binding=require` if not already present

### 4. **Generate AUTH_SECRET**

Run this command to generate a secure secret:

**On Windows PowerShell:**
```powershell
[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).Guid + (New-Guid).Guid))
```

**On macOS/Linux:**
```bash
openssl rand -base64 32
```

### 5. **Deployment Steps**

#### **Option A: Deploy from GitHub (Recommended)**

1. Push your code to GitHub:
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

2. Go to [Vercel](https://vercel.com/import)
3. Connect your GitHub repository
4. Vercel will auto-detect Next.js settings
5. Click **Deploy**

#### **Option B: Deploy with Vercel CLI**

```bash
npm install -g vercel
vercel login
vercel --prod
```

### 6. **Post-Deployment Steps**

After deployment is successful:

#### **Run Database Migrations (if needed)**

```bash
# Set the environment variable temporarily
$env:DATABASE_URL="your-neon-url-here"

# Run migrations
npx prisma db push

# Seed data (optional)
npx prisma db seed
```

Or use Vercel's CLI:
```bash
vercel env pull .env.local
npx prisma db push
```

### 7. **Verify Deployment**

After Vercel builds and deploys:

1. Visit your deployment URL (e.g., `https://possenafal.vercel.app`)
2. Try logging in with test credentials
3. Check dashboard loads properly
4. Verify POS works
5. Check all routes are accessible

### 8. **Troubleshooting**

#### **"DATABASE_URL is not defined" Error**
- Check that DATABASE_URL is set in Vercel Environment Variables
- Make sure it's marked for Production environment
- Wait a few seconds and redeploy: `vercel --prod`

#### **Build Fails**
- Check build logs in Vercel Dashboard
- Run `npm run build` locally to test
- Ensure all dependencies are installed: `npm install`

#### **Database Connection Issues**
- Verify DATABASE_URL is correct
- Check Neon allows connections from Vercel (IP whitelist)
- In Neon, go to **Settings** → **IP Whitelist** → add `0.0.0.0/0` for Vercel

#### **Auth Not Working**
- Verify `AUTH_URL` and `NEXTAUTH_URL` match your domain
- Generate new `AUTH_SECRET`
- Clear browser cookies and try again

### 9. **Environment File Structure**

Your environment setup:

```
.env                    ← Committed (safe defaults for local dev)
.env.local              ← Not committed (local secrets only)
.env.example            ← Committed (template for developers)
Vercel Dashboard        ← Production secrets (DATABASE_URL, AUTH_SECRET, etc.)
```

### 10. **First Admin User Setup**

After deployment:

1. Access `/login` (should show login page)
2. You can't create users through the UI yet
3. Create first user directly in database:

```sql
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  'usr_' || gen_random_uuid()::text,
  'admin@store.com',
  '$2b$10$...hashed_password...',
  'Admin',
  'ADMIN',
  NOW(),
  NOW()
);
```

Or use Prisma Studio:
```bash
npx prisma studio
```

### 11. **Monitoring & Logs**

Monitor your deployment:

- **Vercel Dashboard**: Real-time deployment status
- **Logs**: Click project → **Deployments** → click deployment → **Logs**
- **Error Tracking**: Vercel captures Next.js errors automatically
- **Analytics**: View in project Settings → **Analytics**

### 12. **Custom Domain Setup**

To use your own domain:

1. In Vercel Dashboard → **Settings** → **Domains**
2. Add your domain (e.g., `pos.yourcompany.com`)
3. Follow DNS configuration instructions
4. Update `AUTH_URL` and `NEXTAUTH_URL` to use your domain

### 13. **Performance Optimization**

Already configured:

- ✅ Next.js 16 (Latest)
- ✅ Image optimization
- ✅ Code splitting
- ✅ Automatic compression
- ✅ CDN caching

No additional config needed!

### 14. **Security Best Practices**

- ✅ Never commit `.env.local` or real secrets
- ✅ Use strong `AUTH_SECRET` (32+ characters)
- ✅ Enable Vercel's automatic HTTPS
- ✅ Regularly rotate `AUTH_SECRET`
- ✅ Keep dependencies updated: `npm audit`

---

## Quick Command Reference

```bash
# Local development
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Test build locally
npm start                # Start production server

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:seed          # Seed test data
npm run db:studio        # Open Prisma Studio GUI

# Deployment
vercel --prod            # Deploy with Vercel CLI
git push origin main     # Deploy via GitHub (if connected)
```

---

## Support

If you encounter issues:

1. Check [Vercel Docs](https://vercel.com/docs)
2. Check [Next.js Docs](https://nextjs.org/docs)
3. Check [Prisma Docs](https://www.prisma.io/docs/)
4. Check [Neon Docs](https://neon.tech/docs)

Good luck with your deployment! 🚀
