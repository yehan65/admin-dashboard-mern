import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import StatCard from "../components/StatCard";
import { FileText, Users, UserCog, Server } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { useContext } from "react";
import { AuthContext } from "../context/Auth";
import api from "../services/api";

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  const cleanToken =
    typeof user === "string" ? user.replace(/^"|"$/g, "") : user;

  const { data = [] } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const response = await api.get(`/admin/dashboardStats`, {
        headers: {
          "x-auth-token": cleanToken,
        },
      });
      return response.data;
    },
  });

  const { data: chartData = [] } = useQuery({
    queryKey: ["chartData"],
    queryFn: async () => {
      const response = await api.get("/admin/getChartData", {
        headers: {
          "x-auth-token": cleanToken,
        },
      });
      return response.data;
    },
  });

  // const months = [
  //   { month: "Jan", users: 400 },
  //   { month: "Feb", users: 700 },
  //   { month: "Mar", users: 1200 },
  //   { month: "Apr", users: 1500 },
  //   { month: "May", users: 1700 },
  //   { month: "Jun", users: 2000 },
  // ];

  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Users" value={data.TotalUsers} icon={<Users />} />
        <StatCard title="Posts" value={data.TotalPosts} icon={<FileText />} />
        <StatCard title="Admins" value={data.Admins} icon={<UserCog />} />
        <StatCard
          title="Server"
          className={"text-green-900"}
          value={"Online"}
          icon={<Server />}
        />
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded shadow">
          <h3 className="font-bold mb-4 text-gray-900 dark:text-white">
            User Growth
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#6366f1"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Feed */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
          <h3 className="font-bold mb-4 text-gray-900 dark:text-white">
            Recent Activity
          </h3>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span>New user registered</span>
              <span className="text-gray-400">5min</span>
            </div>

            <div className="flex justify-between">
              <span>Post published</span>
              <span className="text-gray-400">-</span>
            </div>

            <div className="flex justify-between">
              <span>Unread Notification</span>
              <span className="text-gray-400">1</span>
            </div>

            <div className="flex justify-between">
              <span>New message</span>
              <span className="text-gray-400">5min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
