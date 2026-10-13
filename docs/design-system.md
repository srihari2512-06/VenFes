# Design System Tokens

## Color Palette
- Primary: `#2563eb` (Blue 600)
- Primary Hover: `#1d4ed8` (Blue 700)
- Secondary: `#475569` (Slate 600)
- Accent: `#f59e0b` (Amber 500)
- Success: `#16a34a` (Green 600)
- Danger: `#dc2626` (Red 600)
- Warning: `#eab308` (Yellow 500)
- Background: `#f8fafc` (Slate 50)
- Surface / Card: `#ffffff`
- Text Primary: `#0f172a` (Slate 900)
- Text Secondary: `#64748b` (Slate 500)
- Border: `#e2e8f0` (Slate 200)

## Typography
- Font Family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- Headings: Bold, line-height 1.25
- Body: Regular 14px / 16px, line-height 1.5

## Spacing Tokens
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

## Component Rules
- Every screen must render explicit Loading, Empty, and Error states (NFR-12).
- Semantic HTML tags (`<main>`, `<nav>`, `<header>`, `<article>`, `<button>`) with proper ARIA attributes and labels for accessibility (NFR-13).
