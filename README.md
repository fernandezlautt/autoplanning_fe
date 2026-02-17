# AutoPlanning Frontend

Next.js frontend application for the AutoPlanning tool.

## Features

- Create subjects with semester selection (1st, 2nd, or yearly)
- Week-by-week content editing
- Resource management (URLs, titles, descriptions)
- Dashboard to view and manage all subjects
- Excel export functionality
- Modern, responsive UI

## Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (see backend README)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file (optional, defaults to `http://localhost:3001`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

3. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Usage

1. **Create a Subject**: Click "Create New Subject" and fill in the subject name and select the semester.

2. **Edit Week Content**: 
   - Select a subject from the home page
   - Use the week selector to navigate between weeks
   - Enter content for each week
   - Click "Save Content" to persist changes

3. **Add Resources**:
   - While editing a week, click "Add Resource"
   - Enter the URL (required) and optionally add a title and description
   - Resources will be displayed below the week content

4. **Export to Excel**:
   - Open any subject
   - Click "Export to Excel" to download the planning as an Excel file

## Project Structure

```
src/
├── app/              # Next.js app directory
│   ├── subjects/     # Subject pages
│   │   ├── new/      # Create subject page
│   │   └── [id]/     # Subject detail/dashboard page
│   ├── globals.css   # Global styles
│   ├── layout.tsx    # Root layout
│   └── page.tsx      # Home page
├── components/       # React components
│   └── WeekEditor.tsx
└── lib/              # Utilities
    └── api.ts        # API client
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
