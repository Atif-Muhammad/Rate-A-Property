import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  Star,
  Heart,
  Share2,
  ThumbsDown,
  ThumbsUp,
  MessageCircle,
} from "lucide-react"; // ✅ Lucide icons

const lineData = [
  { date: "Jan 1", reviews: 10 },
  { date: "Jan 3", reviews: 45 },
  { date: "Jan 5", reviews: 30 },
  { date: "Jan 7", reviews: 10 },
  { date: "Jan 9", reviews: 28 },
  { date: "Jan 11", reviews: 20 },
  { date: "Jan 13", reviews: 65 },
  { date: "Jan 15", reviews: 38 },
  { date: "Jan 17", reviews: 18 },
  { date: "Jan 19", reviews: 35 },
  { date: "Jan 21", reviews: 20 },
  { date: "Jan 23", reviews: 42 },
  { date: "Jan 25", reviews: 15 },
  { date: "Jan 28", reviews: 40 },
];

const pieData = [
  { name: "Agree", value: 40 },
  { name: "Disagree", value: 5 },
  { name: "Comments", value: 30 },
  { name: "Share", value: 25 },
];

const pieColorMap = {
  Agree: "#4299E1",
  Disagree: "#F56565",
  Comments: "#ECC94B",
  Share: "#48BB78",
};

const DashboardCharts = () => {
  return (
    <div className="max-w-screen-xl mx-auto p-4">
      <div className="flex flex-col lg:flex-row gap-6 bg-white p-6 rounded-xl shadow-md">
        {/* Line Chart */}
        <div className="w-full flex flex-col justify-between lg:w-1/2 bg-gray-100 p-4 rounded-lg shadow-inner">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-700">Analytics</h2>
            <span className="text-gray-500 font-medium">741</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="reviews"
                stroke="#3182CE"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="w-full lg:w-1/2 bg-gray-50 p-4 rounded-lg shadow-inner relative">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Engagement
          </h2>

          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={pieColorMap[entry.name] || "#CBD5E0"}
                  />
                ))}
              </Pie>

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const { name, value } = payload[0].payload;
                    const total = pieData.reduce(
                      (acc, cur) => acc + cur.value,
                      0
                    );
                    const percent = ((value / total) * 100).toFixed(1);
                    return (
                      <div className="bg-white border p-2 rounded shadow text-sm">
                        <p className="font-semibold text-gray-700">{name}</p>
                        <p className="text-gray-600">{percent}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="text-center text-xl font-bold mt-2">
            249 <span className="text-gray-500 text-sm">reviews</span>
          </div>

          <div className="flex flex-row justify-center items-center gap-2 md:gap-4 mt-4">
            {pieData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: pieColorMap[entry.name] || "#CBD5E0",
                  }}
                ></span>
                <span className="text-sm text-gray-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Rating */}
        <div className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center text-center transition-transform transform hover:scale-105 hover:shadow-lg">
          <Star className="text-yellow-400 w-7 h-7" />
          <h4 className="mt-2 text-sm font-semibold text-gray-700">Rating</h4>
          <p className="text-lg font-bold text-gray-800">4.7</p>
        </div>

        {/* Agree */}
        <div className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center text-center transition-transform transform hover:scale-105 hover:shadow-lg">
          <ThumbsUp className="text-blue-500 w-7 h-7" />
          <h4 className="mt-2 text-sm font-semibold text-gray-700">Agree</h4>
          <p className="text-lg font-bold text-gray-800">3.4K</p>
        </div>

        {/* Disagree */}
        <div className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center text-center transition-transform transform hover:scale-105 hover:shadow-lg">
          <ThumbsDown className="text-rose-500 w-7 h-7" />
          <h4 className="mt-2 text-sm font-semibold text-gray-700">Disagree</h4>
          <p className="text-lg font-bold text-gray-800">172</p>
        </div>

        {/* Comments */}
        <div className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center text-center transition-transform transform hover:scale-105 hover:shadow-lg">
          <MessageCircle className="text-yellow-600 w-7 h-7" />
          <h4 className="mt-2 text-sm font-semibold text-gray-700">Comments</h4>
          <p className="text-lg font-bold text-gray-800">683</p>
        </div>

        {/* Shares */}
        <div className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center text-center transition-transform transform hover:scale-105 hover:shadow-lg">
          <Share2 className="text-green-500 w-7 h-7" />
          <h4 className="mt-2 text-sm font-semibold text-gray-700">Shares</h4>
          <p className="text-lg font-bold text-gray-800">845</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
