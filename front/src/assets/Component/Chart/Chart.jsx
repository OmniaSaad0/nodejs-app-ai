import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";

const DEFAULT_COLORS = ["#4F8EF7", "#F7B99F", "#F06A4A", "#C91313", "#2ECC71", "#F1C40F", "#8E44AD"];

const Chart = ({ data }) => {
  let chartObj = data;
  if (Array.isArray(data)) chartObj = data[0];
  if (chartObj && chartObj["Json Object"]) chartObj = chartObj["Json Object"];
  if (!chartObj || !chartObj.Data || !Array.isArray(chartObj.Data)) {
    return <div className="chart-container">No valid chart data.</div>;
  }

  // Detect if this is a table (multiple _Value_ fields per row)
  const firstRow = chartObj.Data[0] || {};
  const valueKeys = Object.keys(firstRow).filter(k => k.startsWith("_Value_"));
  const isTable = valueKeys.length > 1;

  // For table: extract Y axis labels for each value key
  const yAxisLabels = {};
  valueKeys.forEach(key => {
    // e.g., _Value_O2 => YAxis_O2
    const suffix = key.replace("_Value_", "");
    const labelKey = `YAxis_${suffix}`;
    yAxisLabels[key] = chartObj[labelKey] || suffix;
  });

  const graphMode = (chartObj._GraphMode_ || "Bar").toLowerCase();

  if (isTable && graphMode === "line") {
    // Prepare data for multi-line chart
    const chartData = chartObj.Data.map((item, idx) => {
      const row = { name: item._DataElementName_ || `Item ${idx + 1}` };
      valueKeys.forEach(key => {
        row[key] = Number(item[key]);
      });
      return row;
    });
    const colors = DEFAULT_COLORS;
    return (
      <div className="chart-container">
        <div className="chart-title">{chartObj.ObjectName || "Line Chart"}</div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData} margin={{ top: 30, right: 30, left: 10, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-15} textAnchor="end" interval={0} label={{ value: chartObj.XAxis || '', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'القيم', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            {valueKeys.map((key, idx) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={yAxisLabels[key]}
                stroke={colors[idx % colors.length]}
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Fallback: original single-series chart logic
  // Prepare data for recharts
  const chartData = chartObj.Data.map((item, idx) => ({
    name: item._DataElementName_ || `Item ${idx + 1}`,
    value: Number(item._Value_),
    fill: item._Color_ && item._Color_.startsWith("#") ? item._Color_ : DEFAULT_COLORS[idx % DEFAULT_COLORS.length]
  }));

  return (
    <div className="chart-container">
      <div className="chart-title">{chartObj.ObjectName || (graphMode === "pie" ? "Pie Chart" : "Bar Chart")}</div>
      <ResponsiveContainer width="100%" height={350}>
        {graphMode === "pie" ? (
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={110}
              label={({ name, value }) => `${name}: ${value}`}
              isAnimationActive={true}
            >
              {chartData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        ) : (
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
              {chartData.map((entry, idx) => (
                <Cell key={`cell-bar-${idx}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default Chart; 