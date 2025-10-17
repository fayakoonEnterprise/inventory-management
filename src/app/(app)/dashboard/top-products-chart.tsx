
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartTooltipContent, ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { useMemo } from 'react';

const chartConfig = {
  quantity: {
    label: "Quantity",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

type TopProductsChartProps = {
  topProductsString: string | null;
};

// A mock function to simulate fetching quantity for each product
// In a real app, this data might come from the topProductsString or another API call
const getProductQuantity = (productName: string) => {
    // This is a placeholder. 
    // We'll assign a mock quantity based on the product's position for visual representation.
    if (productName.toLowerCase().includes('display')) return 15;
    if (productName.toLowerCase().includes('headphones')) return 10;
    if (productName.toLowerCase().includes('mouse')) return 8;
    return 5;
}


export function TopProductsChart({ topProductsString }: TopProductsChartProps) {
  const data = useMemo(() => {
    if (!topProductsString) {
      return [];
    }
    return topProductsString.split(', ').map(name => ({
      name,
      quantity: getProductQuantity(name) // Using mock quantity
    })).sort((a,b) => a.quantity - b.quantity); // sort for vertical bar chart
  }, [topProductsString]);
  
  if (data.length === 0) {
    return (
        <div className="flex items-center justify-center h-[350px]">
            <p className="text-muted-foreground">No sales data for this period.</p>
        </div>
    )
  }

  return (
    <ChartContainer config={chartConfig}>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
          <XAxis type="number" hide />
          <YAxis
            dataKey="name"
            type="category"
            tickLine={false}
            axisLine={false}
            tick={{
              fontSize: 12,
              width: 120,
              fill: 'hsl(var(--muted-foreground))',
            }}
            width={120}
          />
          <Tooltip
              cursor={{ fill: 'hsl(var(--muted))' }}
              content={<ChartTooltipContent indicator="dot" />}
          />
          <Bar dataKey="quantity" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
