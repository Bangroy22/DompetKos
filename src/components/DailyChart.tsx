"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

interface Props {
  labels: string[];
  values: number[];
}

export default function DailyChart({ labels, values }: Props) {
  return (
    <Bar
      data={{
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: (ctx: { dataIndex: number }) =>
              ctx.dataIndex % 2 === 0 ? "#10B981" : "#047857",
            hoverBackgroundColor: "#F59E0B",
            borderRadius: 6,
          },
        ],
      }}
      options={{
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                ` ${new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(Number(ctx.parsed.y))}`,
            },
          },
        },
        scales: {
          x: { ticks: { font: { size: 9 }, maxTicksLimit: 8 } },
          y: { beginAtZero: true, ticks: { font: { size: 9 } } },
        },
        maintainAspectRatio: true,
      }}
    />
  );
}
