# Book Covers

Place your book cover images here.

## How to add book covers:

1. Add your image files to this folder (e.g., `alice-in-wonderland.jpg`, `pride-and-prejudice.jpg`)
2. Update the `coverImage` property in `src/books.js`:

```javascript
{
  id: 'alice-in-wonderland',
  title: "Alice's Adventures in Wonderland",
  author: 'Lewis Carroll',
  coverImage: '/covers/alice-in-wonderland.jpg', // Update this!
  chapters: [...]
}
```

## Supported formats:
- JPG/JPEG
- PNG
- WebP
- SVG

## Recommended dimensions:
- Width: 300-400px
- Height: 450-600px
- Aspect ratio: 2:3 (portrait)

The dashboard will automatically display your cover images in the cozy library view!
