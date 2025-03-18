# Environmental Monitoring Dashboard

A real-time environmental monitoring dashboard built with Next.js, shadcn UI, and Supabase. This application visualizes sensor data from IoT devices, displaying temperature, humidity, CO2, and other environmental metrics.

## Features

- **Real-time Data Updates**: Live updates of sensor readings using Supabase's real-time capabilities
- **Interactive Map**: View device locations and their latest readings on an interactive map
- **Data Visualization**: Charts and graphs for analyzing sensor data trends
- **Device Management**: View and manage your IoT devices
- **Detailed Analytics**: Advanced analytics and data comparison tools

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn UI
- **Data Visualization**: Recharts
- **Maps**: Leaflet, React-Leaflet
- **Database & Real-time Updates**: Supabase

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
│   ├── app/                  # Next.js App Router
│   │   ├── analytics/        # Analytics page
│   │   ├── devices/          # Devices management page
│   │   ├── page.tsx          # Main dashboard page
│   │   └── layout.tsx        # Root layout
│   ├── components/           # React components
│   │   ├── ui/               # shadcn UI components
│   │   ├── DeviceMap.tsx     # Map component
│   │   ├── SensorChart.tsx   # Chart component
│   │   └── ...               # Other components
│   └── lib/                  # Utility functions and libraries
│       └── supabase.ts       # Supabase client and helper functions
└── public/                   # Static assets
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [shadcn UI](https://ui.shadcn.com/)
- [Supabase](https://supabase.io/)
- [Recharts](https://recharts.org/)
- [Leaflet](https://leafletjs.com/)
