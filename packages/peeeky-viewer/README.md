# @peeeky/viewer

> Open-source PDF viewer with built-in engagement tracking. React component.

[![npm](https://img.shields.io/npm/v/@peeeky/viewer)](https://www.npmjs.com/package/@peeeky/viewer)
[![license](https://img.shields.io/npm/l/@peeeky/viewer)](./LICENSE)

## Install

```bash
npm install @peeeky/viewer
```

## Quick Start

```tsx
import { PeeekyViewer } from '@peeeky/viewer'

function App() {
  return (
    <PeeekyViewer
      src="/documents/proposal.pdf"
      apiKey="pk_live_your_key"
      viewerEmail="recipient@company.com"
      onPageView={(page, seconds) => console.log(`Page ${page}: ${seconds}s`)}
    />
  )
}
```

## Standalone (no tracking)

```tsx
<PeeekyViewer src="/doc.pdf" />
```

Works without `apiKey` — just a clean PDF viewer with no external calls.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | required | URL or path to PDF file |
| `apiKey` | `string` | — | Peeeky API key (enables tracking) |
| `endpoint` | `string` | `https://peeeky.com/api/track` | Custom tracking endpoint |
| `viewerEmail` | `string` | — | Identify the viewer |
| `width` | `string \| number` | `"100%"` | Container width |
| `height` | `string \| number` | `"600px"` | Container height |
| `showToolbar` | `boolean` | `true` | Show navigation toolbar |
| `showPageNumbers` | `boolean` | `true` | Show page counter |
| `theme` | `"light" \| "dark"` | `"light"` | Color theme |
| `onPageView` | `(page, seconds) => void` | — | Callback per page |
| `onViewStart` | `(viewId) => void` | — | When view session starts |
| `onViewEnd` | `(totalSeconds) => void` | — | When view session ends |
| `onError` | `(error) => void` | — | On PDF load error |

## Dashboard

Connect to [Peeeky](https://peeeky.com) to get:
- Per-page engagement heatmaps
- AI Chat for document recipients
- Smart follow-up alerts
- Engagement scoring

## License

MIT
