# 🔒 Firebase Security Setup

## Important: Protecting Your API Keys

Your Firebase API keys are now stored in environment variables and will NOT be pushed to GitHub!

### What was done:

1. **Created `.env` file** - Contains your actual Firebase credentials
2. **Updated `.gitignore`** - Ensures `.env` is never committed to Git
3. **Created `.env.example`** - Template for other developers (without actual keys)
4. **Updated `firebase.js`** - Now reads from environment variables

### How it works:

- The `.env` file is listed in `.gitignore`, so Git will ignore it
- When you push to GitHub, your API keys stay safe on your local machine
- Other developers can copy `.env.example` to `.env` and add their own keys

### For deployment (Vercel, Netlify, etc.):

Add these environment variables in your hosting platform's dashboard:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_DATABASE_URL`

## Note about Firebase API Keys

Firebase API keys are actually safe to expose publicly because:
- They identify your Firebase project
- Firebase Security Rules protect your data
- The real security comes from your Firebase Rules configuration

However, it's still best practice to use environment variables!

## Book Cover Images

To add book cover images to your dashboard:

1. Add images to `public/covers/` folder
2. Update the `coverImage` property in `src/books.js`
3. The dashboard will automatically display them in the library view

Example:
```javascript
{
  id: 'book-1',
  title: 'My Book',
  author: 'Author Name',
  coverImage: '/covers/my-book.jpg', // Add this!
  chapters: [...]
}
```
