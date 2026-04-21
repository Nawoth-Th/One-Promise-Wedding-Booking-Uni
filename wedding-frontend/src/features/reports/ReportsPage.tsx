/**
 * @file ReportsPage.tsx
 * @description Admin Dashboard for Business Intelligence (BI) and Analytics.
 * This component visualizes system data using Recharts, providing the studio 
 * with insights into financial health, operational volume, and team performance.
 * 
 * Features:
 * - Real-time Data Visualization (Line/Bar/Pie Charts).
 * - Key Performance Indicators (KPIs) through Metric Cards.
 * - Responsive Layout for cross-device management.
 */

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { StatsSummary } from '@/lib/types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Calendar, Users, MapPin, TrendingUp, CreditCard } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

/**
 * Component: ReportsPage
 * Orchestrates the fetching and rendering of system-wide metrics.
 */
export default function ReportsPage() {
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * Logic: Initial Data Load
     * Feature: Centralized metric fetching from the BI backend.
     */
    const fetchStats = async () => {
      try {
        const data = await api.getStatsSummary();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-96">Loading Reports...</div>;
  if (!stats) return <div className="p-8 text-center">Failed to load system reports.</div>;

  const revenueData = stats.revenueByMonth.map(m => ({
    name: `${m._id.month}/${m._id.year}`,
    revenue: m.revenue,
    count: m.count
  }));

  const packageData = stats.packageDistribution.map(p => ({
    name: p._id,
    value: p.count
  }));

  const eventTypesData = [
    { name: 'Wedding', value: stats.eventTypes.wedding },
    { name: 'Homecoming', value: stats.eventTypes.homecoming },
    { name: 'Engagement', value: stats.eventTypes.engagement },
    { name: 'Pre-Shoot', value: stats.eventTypes.preShoot }
  ];

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Business Intelligence Dashboard</h1>
        <p className="text-muted-foreground">Strategic overview of One Promise Wedding performance and metrics.</p>
      </div>

      {/* 1. Financial Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">LKR {stats.summary.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across {stats.summary.count} bookings</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">LKR {stats.summary.totalBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Revenue yet to be collected</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">LKR {Math.round(stats.summary.averageOrderValue).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Average revenue per order</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5 border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.eventTypes.wedding + stats.eventTypes.homecoming}</div>
                <p className="text-xs text-muted-foreground">Live projects in pipeline</p>
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 2. Revenue Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Income Stream Trend</CardTitle>
            <CardDescription>Monthly revenue growth over the current fiscal year.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `LKR ${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 3. Package Popularity */}
        <Card>
          <CardHeader>
            <CardTitle>Package Distribution</CardTitle>
            <CardDescription>Market share analysis of wedding packages.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={packageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {packageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {/* 4. Event Type Distribution */}
         <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Service Mix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {eventTypesData.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <span className="text-xl font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 5. Team Utilization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
               {stats.teamUtilization.length > 0 ? stats.teamUtilization.map((member, idx) => (
                 <div key={member._id} className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate max-w-[150px]">{member._id}</span>
                    <div className="flex items-center gap-2">
                        <div className="bg-secondary px-2 py-0.5 rounded text-xs font-semibold">
                            {member.eventCount} Events
                        </div>
                    </div>
                 </div>
               )) : <p className="text-sm text-muted-foreground">No assignments yet.</p>}
            </div>
          </CardContent>
        </Card>

        {/* 6. Geographic Distribution */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Top Locations
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                {stats.topVenues.length > 0 ? stats.topVenues.map((venue, idx) => (
                    <div key={venue._id} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{venue._id}</span>
                        <span className="text-sm font-bold text-primary">{venue.count} bookings</span>
                    </div>
                )) : <p className="text-sm text-muted-foreground">No location data available.</p>}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
