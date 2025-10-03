# Copilot Instructions for ERD Tool

This is a React + TypeScript web application for creating and visualizing Entity Relationship Diagrams (ERDs). The tool allows users to create, edit, import, export, and share ERD diagrams through a modern web interface.

## Project Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Diagram Library**: React Flow
- **Routing**: React Router v7
- **State Management**: React hooks with custom state management
- **Data Compression**: LZ-string and msgpackr for URL sharing

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui base components
│   ├── ERDViewer.tsx   # Main diagram viewing component
│   ├── TableNode.tsx   # Individual table node component
│   └── ...             # Other specialized components
├── pages/              # Route-based page components
│   ├── HomePage.tsx    # Landing page with ERD list
│   └── ERDPage.tsx     # Main ERD editing interface
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
│   ├── urlSharing.ts   # URL encoding/decoding for sharing
│   ├── csvProcessor.ts # CSV import processing
│   └── erdExport.ts    # JSON import/export
├── types/              # TypeScript type definitions
└── lib/                # Library configurations
```

## Core Features & Components

### 1. ERD Management
- **ERDView**: Main data structure containing nodes, edges, and metadata
- **Local Storage**: ERDs are persisted in browser localStorage
- **Import/Export**: JSON format for saving/loading diagrams
- **CSV Import**: Convert CSV schema data to ERD format

### 2. Diagram Visualization
- **React Flow**: Powers the interactive diagram canvas
- **TableNode**: Custom node component representing database tables
- **Drag & Drop**: Interactive positioning of tables
- **Zoom & Pan**: Canvas navigation controls

### 3. URL Sharing
- **Compression**: Heavy compression using LZ-string and msgpackr
- **Base64 Encoding**: URL-safe encoding for sharing
- **Minimal Data**: Optimized data structure to reduce URL length

### 4. Table Management
- **Column Types**: Support for various database column types
- **Constraints**: Primary keys, foreign keys, and other constraints
- **Relationships**: Visual connections between related tables

## Coding Standards

### TypeScript Guidelines
- Use strict TypeScript configuration
- Define proper interfaces for all data structures
- Avoid `any` types - use proper typing or `unknown` when necessary
- Use React.FC or function declarations for components
- Export types and interfaces when used across modules

### React Patterns
- Use functional components with hooks
- Custom hooks for complex state logic
- Props interfaces for all components
- Use React.memo for performance optimization when needed
- Proper dependency arrays for useEffect and useMemo

### Component Structure
```typescript
interface ComponentProps {
  // Define all props with proper types
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // Component logic
  return (
    // JSX
  );
}
```

### Styling Guidelines
- Use Tailwind CSS utility classes
- Follow shadcn/ui component patterns
- Consistent spacing using Tailwind's spacing scale
- Use CSS variables for theme colors
- Responsive design with mobile-first approach

### State Management
- Use React hooks for local state
- Custom hooks for reusable state logic
- Props drilling for simple data flow
- Context API for deeply nested state when necessary

## File Organization

### Naming Conventions
- **Components**: PascalCase (e.g., `TableNode.tsx`)
- **Hooks**: camelCase starting with "use" (e.g., `useERDState.ts`)
- **Utils**: camelCase (e.g., `urlSharing.ts`)
- **Types**: PascalCase interfaces/types (e.g., `ERDView`, `TableInfo`)

### Import Order
1. React and React-related imports
2. Third-party libraries
3. Internal components (@ alias)
4. Utility functions
5. Type definitions
6. Relative imports

```typescript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactFlow } from 'reactflow';
import { Button } from '@/components/ui/button';
import { encodeERDData } from '@/utils/urlSharing';
import { ERDView } from '@/types';
import './Component.css'; // if needed
```

## Data Structures

### Key Interfaces
- `ERDView`: Complete ERD document with metadata
- `TableInfo`: Database table schema information
- `ColumnInfo`: Individual column definition
- `TableSettings`: Display and behavior settings

### Storage Format
- **Local Storage**: JSON serialization of ERDView objects
- **URL Sharing**: Compressed binary format for minimal URLs
- **Export**: Human-readable JSON with full metadata

## Error Handling

### Error Boundaries
- Implement error boundaries for critical components
- Graceful degradation for non-critical features
- User-friendly error messages

### Data Validation
- Validate imported data structures
- Handle malformed CSV/JSON imports
- Sanitize user inputs for security

## Performance Considerations

### React Flow Optimization
- Minimize node re-renders using React.memo
- Efficient edge updates
- Proper viewport management

### Data Compression
- Use minimal data structures for URL sharing
- Lazy load large datasets
- Debounce expensive operations

## Testing Guidelines

Currently no test framework is configured. When adding tests:
- Use React Testing Library for component tests
- Jest for unit testing utility functions
- Test user interactions and data flow
- Mock external dependencies

## Build & Development

### Commands
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run lint`: Run ESLint
- `npm run preview`: Preview production build

### Environment
- Node.js 18+ required
- Modern browser support (ES2020+)
- No server-side requirements (client-only app)

## Common Patterns

### URL Sharing Implementation
```typescript
// Compress ERD data for sharing
const shareUrl = encodeERDData({
  nodes: erdData.nodes,
  edges: erdData.edges,
  settings: erdData.settings
});
```

### Table Node Structure
```typescript
interface TableNodeData {
  label: string;
  columns: ColumnInfo[];
}
```

### CSV Processing
- Parse CSV headers to determine column types
- Generate table relationships from foreign key references
- Handle various CSV formats and encodings

## Deployment
- Static site deployment (Vercel, Netlify, GitHub Pages)
- No backend dependencies
- All data stored client-side

## Common Issues & Solutions

### Current Lint Issues
The codebase currently has several ESLint warnings that should be addressed:
- Unused imports and variables
- `@typescript-eslint/no-explicit-any` violations
- Missing dependency array items in React hooks
- Components that break fast refresh requirements

### URL Length Limitations
- Browser URL length limits (~2000 chars) affect large diagrams
- Implement fallback for oversized diagrams
- Consider server-side storage for complex ERDs

### Browser Compatibility
- LocalStorage quotas vary by browser
- Handle storage quota exceeded errors
- Test across different browsers and devices

## Development Workflows

### Adding New Features
1. Create types first in `src/types.ts`
2. Implement utility functions with proper error handling
3. Create/update components with TypeScript interfaces
4. Test data flow and state management
5. Update this documentation

### Debugging Tips
- Use React DevTools for component state inspection
- Browser DevTools for React Flow node/edge debugging
- Console logging for data compression/decompression
- Network tab for analyzing bundle size

### Code Review Checklist
- [ ] TypeScript types are properly defined
- [ ] No `any` types unless absolutely necessary
- [ ] Components follow existing patterns
- [ ] Error handling is implemented
- [ ] Performance impact is considered
- [ ] Mobile responsiveness maintained
- [ ] URL sharing still works with changes

## Security Considerations
- Client-side only application
- No sensitive data transmission
- URL sharing uses compression, not encryption
- Sanitize imported data to prevent XSS
- Validate all user inputs before processing

## Accessibility Guidelines
- Use semantic HTML elements
- Provide proper ARIA labels for interactive elements
- Ensure keyboard navigation works
- Maintain color contrast ratios
- Test with screen readers when possible

---

## Quick Reference for Contributors

### File Changes Impact
- `urlSharing.ts` changes: Test share/import functionality thoroughly
- `ERDViewer.tsx` changes: Test all diagram interactions
- Type changes: Verify backward compatibility with stored data
- Component changes: Check responsive design on multiple screen sizes

### When to Update Instructions
- New major features or architectural changes
- Breaking changes to data structures
- New external dependencies
- Performance optimizations
- Security-related changes

---

When working on this codebase:
1. Follow the existing patterns and conventions
2. Maintain type safety throughout
3. Consider performance impact of changes
4. Test URL sharing functionality thoroughly
5. Ensure responsive design compliance
6. Address existing lint issues when touching related files
7. Update this documentation when adding new features