import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList
} from "recharts";

const DEFAULT_COLORS = ["#4F8EF7", "#F7B99F", "#F06A4A", "#C91313", "#2ECC71", "#F1C40F", "#8E44AD"];

const Chart = ({ data }) => {
  let chartObj = data;
  if (Array.isArray(data)) chartObj = data[0];
  if (chartObj && chartObj["Json Object"]) chartObj = chartObj["Json Object"];
  if (!chartObj || !chartObj.Data || !Array.isArray(chartObj.Data)) {
    return <div className="chart-container">No valid chart data.</div>;
  }

  // Prepare data for recharts
  const chartData = chartObj.Data.map((item, idx) => ({
    name: item._DataElementName_ || `Item ${idx + 1}`,
    value: Number(item._Value_),
    fill: item._Color_ && item._Color_.startsWith("#") ? item._Color_ : DEFAULT_COLORS[idx % DEFAULT_COLORS.length]
  }));

  return (
    <div className="chart-container">
      <div className="chart-title">{chartObj.ObjectName || "Bar Chart"}</div>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={chartData}
          margin={{ top: 30, right: 30, left: 10, bottom: 40 }}
          barCategoryGap="30%"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-15} textAnchor="end" interval={0} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value">
            <LabelList dataKey="value" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart; 