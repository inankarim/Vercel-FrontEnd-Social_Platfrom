import React from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 bg-base-100 p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Button 1 - Go to Chat Home */}
      <Link to="/chathome" className="btn btn-primary w-48">
        Chat With Us
      </Link>

      
    </div>
  );
};

export default Dashboard;