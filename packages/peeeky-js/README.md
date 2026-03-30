# peeeky-js

> Track document engagement from any app. Lightweight SDK for [Peeeky](https://peeeky.com).

[![npm](https://img.shields.io/npm/v/peeeky-js)](https://www.npmjs.com/package/peeeky-js)
[![bundle size](https://img.shields.io/bundlephobia/minzip/peeeky-js)](https://bundlephobia.com/package/peeeky-js)
[![license](https://img.shields.io/npm/l/peeeky-js)](./LICENSE)

## Install

```bash
npm install peeeky-js
```

## Quick Start

```javascript
import { Peeeky } from 'peeeky-js'

// Initialize with your API key
Peeeky.init({ apiKey: 'pk_live_your_key' })

// Start tracking a document view
const viewId = await Peeeky.startView('doc_123', 'viewer@email.com')

// Track individual page views
await Peeeky.track({
  documentId: 'doc_123',
  page: 1,
  duration: 45, // seconds
  action: 'page_view'
})

// End the view session
await Peeeky.endView('doc_123', 180) // total duration in seconds
```

## Page Timer Helper

```javascript
// Automatically measure time spent on each page
Peeeky.startPageTimer()

// When user navigates to next page
const secondsOnPage = Peeeky.stopPageTimer(1) // page number
```

## Configuration

```javascript
Peeeky.init({
  apiKey: 'pk_live_your_key', // Required
  endpoint: 'https://peeeky.com/api/track', // Default
  debug: false, // Log events to console
})
```

## API

| Method | Description |
|--------|-------------|
| `Peeeky.init(config)` | Initialize with API key |
| `Peeeky.track(event)` | Send a tracking event |
| `Peeeky.startView(docId, email?)` | Start a view session |
| `Peeeky.endView(docId, duration)` | End a view session |
| `Peeeky.startPageTimer()` | Start measuring time on page |
| `Peeeky.stopPageTimer(page)` | Stop timer and send page_view |
| `Peeeky.getViewId()` | Get current view session ID |
| `Peeeky.reset()` | Clear all state |

## Dashboard

All tracked events appear in your [Peeeky dashboard](https://peeeky.com/documents) with:

- Per-page engagement heatmaps
- Viewer identification and history
- AI-powered engagement scoring
- Smart follow-up alerts

**Free tier:** 5 documents, basic analytics
**Pro ($39/mo):** Unlimited documents, full analytics, AI chat

## License

MIT
