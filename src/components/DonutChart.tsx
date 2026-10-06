"use client";

import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  labels: string[];
  values: number[];
  colors: string[];
}

export default function DonutChart({ labels, values, colors }: Props) {
  return (
    <Doughnut
      data={{
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: colors,
            borderWidth: 3,
            borderColor: "#ffffff",
            hoverOffset: 8,
          },
        ],
      }}
      options={{
        cutout: "62%",
        plugins: {
          legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                ` ${new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(Number(ctx.parsed))}`,
            },
          },
        },
        maintainAspectRatio: true,
      }}
    />
  );
}
