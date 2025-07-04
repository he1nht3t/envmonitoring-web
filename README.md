# Environmental Monitoring Dashboard

A comprehensive real-time environmental monitoring dashboard built with Next.js, shadcn UI, and Supabase. This application provides advanced visualization and analysis of sensor data from IoT devices, monitoring temperature, humidity, CO2, air quality, and other critical environmental metrics.

## Features

### Core Functionality
- **Real-time Data Updates**: Live updates of sensor readings using Supabase's real-time capabilities
- **Interactive Map**: View device locations and their latest readings on an interactive map
- **Advanced Analytics**: Comprehensive analytics with multiple time range options (1h, 6h, 24h, 7d, 30d, custom)
- **Device Management**: View and manage your IoT devices with detailed information
- **Multi-device Comparison**: Compare sensor data across multiple devices simultaneously

### Data Visualization
- **Interactive Charts**: Real-time charts with trend analysis and moving averages
- **Statistical Analysis**: Mean, median, min, max, standard deviation, and variance calculations
- **Health Risk Assessment**: Color-coded health risk indicators based on environmental standards
- **Distribution Analysis**: Pie charts and bar charts for data distribution visualization
- **Responsive Design**: Mobile-optimized interface with adaptive layouts

### Time Range Analysis
- **Flexible Time Ranges**: 1-hour, 6-hour, 24-hour, 7-day, 30-day, and custom date ranges
- **Historical Data**: Access and analyze historical sensor readings
- **Date-specific Analysis**: Select specific dates for detailed analysis
- **Trend Visualization**: Moving averages and trend analysis for pattern recognition

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn UI with Radix UI primitives
- **State Management**: Zustand for analytics store
- **Data Visualization**: Recharts with custom chart components
- **Maps**: Leaflet, React-Leaflet for interactive mapping
- **Database & Real-time Updates**: Supabase with PostgreSQL
- **Date Handling**: date-fns for robust date manipulation
- **Styling**: CSS Grid and Flexbox with responsive design

## Recent Improvements

### Code Quality & Performance
- **Enhanced Time Range Logic**: Fixed and optimized time range calculations for accurate data filtering
- **Responsive UI**: Improved mobile experience with adaptive tab layouts
- **Type Safety**: Comprehensive TypeScript implementation with proper type definitions
- **State Management**: Centralized analytics state with Zustand store
- **Error Handling**: Robust error boundaries and loading states

### Bug Fixes
- **Time Range Selector**: Fixed 1h, 6h, and 24h ranges to correctly use selected dates
- **Data Fetching**: Corrected date range parameters in Supabase queries
- **Mobile Layout**: Resolved tab overlap issues on smaller screens
- **Dependency Management**: Fixed React Hook dependency warnings

### Architecture Improvements
- **Modular Components**: Well-structured component hierarchy
- **Context Providers**: Efficient state sharing across components
- **Custom Hooks**: Reusable logic for analytics and data management
- **Utility Functions**: Centralized helper functions for data processing

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd environmental-monitoring-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Database Schema

The application uses the following Supabase tables:

### devices
- `id` (uuid, primary key)
- `name` (text)
- `lat` (float8)
- `long` (float8)

### sensor_data
- `id` (uuid, primary key)
- `device_id` (uuid, foreign key to devices.id)
- `temperature` (float8)
- `humidity` (float8)
- `co` (float8)
- `co2` (float8)
- `nh3` (float8)
- `lpg` (float8)
- `smoke` (float8)
- `alcohol` (float8)
- `sound_intensity` (float8)
- `rain_intensity` (float8)
- `created_at` (timestamptz)

## Project Structure

```
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── analytics/           # Advanced analytics page with time ranges
│   │   ├── devices/             # Device management and monitoring
│   │   ├── page.tsx             # Main dashboard with real-time data
│   │   ├── layout.tsx           # Root layout with navigation
│   │   └── globals.css          # Global styles and Tailwind imports
│   ├── components/              # Reusable React components
│   │   ├── ui/                  # shadcn UI base components
│   │   ├── DeviceMap.tsx        # Interactive map with device markers
│   │   ├── SensorChart.tsx      # Recharts-based sensor visualization
│   │   ├── StatCard.tsx         # Statistical data display cards
│   │   ├── TimeRangeSelector.tsx # Time range selection component
│   │   └── ...                  # Additional UI components
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAnalyticsStore.ts # Zustand store for analytics state
│   │   └── useDevices.ts        # Device data management hook
│   ├── lib/                     # Utility functions and configurations
│   │   ├── supabase.ts          # Supabase client and database helpers
│   │   ├── utils.ts             # General utility functions
│   │   └── constants.ts         # Application constants
│   └── types/                   # TypeScript type definitions
│       └── database.ts          # Database schema types
├── public/                      # Static assets and icons
└── package.json                 # Dependencies and scripts
```

## Development Best Practices

### Code Quality
- **ESLint & Prettier**: Consistent code formatting and linting
- **TypeScript**: Strict type checking for better code reliability
- **Component Composition**: Reusable and maintainable component architecture
- **Custom Hooks**: Separation of concerns with custom React hooks

### Performance Optimization
- **React.memo**: Optimized re-renders for expensive components
- **Efficient State Management**: Zustand for lightweight state management
- **Data Fetching**: Optimized Supabase queries with proper indexing
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Accessibility
- **Semantic HTML**: Proper HTML structure for screen readers
- **ARIA Labels**: Comprehensive accessibility attributes
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Color Contrast**: WCAG compliant color schemes

## API Integration

### Supabase Integration
The application integrates with Supabase for:
- **Real-time Data**: WebSocket connections for live sensor updates
- **Database Queries**: Optimized PostgreSQL queries for historical data
- **Authentication**: User management and access control
- **Row Level Security**: Secure data access patterns

### Data Flow
1. **IoT Devices** → Send sensor data to Supabase
2. **Supabase** → Stores data and triggers real-time updates
3. **Dashboard** → Receives updates and visualizes data
4. **Analytics** → Processes historical data for insights

## Deployment

### Environment Setup
Ensure the following environment variables are configured:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Build Commands
```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Linting and formatting
npm run lint
npm run lint:fix
```

### Deployment Platforms
- **Vercel**: Recommended for Next.js applications
- **Netlify**: Alternative deployment option
- **Docker**: Containerized deployment support

## Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make changes with proper TypeScript types
4. Add tests for new functionality
5. Ensure all linting passes
6. Submit a pull request

### Code Standards
- Follow existing code patterns and conventions
- Write meaningful commit messages
- Add JSDoc comments for complex functions
- Ensure responsive design for all new components

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [shadcn UI](https://ui.shadcn.com/)
- [Supabase](https://supabase.io/)
- [Recharts](https://recharts.org/)
- [Leaflet](https://leafletjs.com/)
