import CountUp from "react-countup";

export default function StatCard({ title, value, icon, className }) {
  return (
    <div className="bg-white p-4 rounded shadow  dark:bg-gray-800 hover:shadow-lg transition-all duration-300">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-gray-500 dark:text-gray-400">{title}</span>
          <h2
            className={`text-2xl font-bold text-gray-900 dark:text-white ${className}`}
          >
            {value}
            {/* <CountUp end={Number(value)} duration={2} /> */}
          </h2>
        </div>
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded">
          {icon}
        </div>
      </div>
    </div>
  );
}
