"use client";

import React, { useEffect, useState } from "react";
const SystemSettings = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Browser-оос хадгалсан theme-г ачаалах
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">Системийн тохиргоо</h1>
      <div className="bg-gray-200 dark:bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md">
        <p className="text-base font-medium text-center mb-4">
          Та доорх горимыг сонгоно уу:
        </p>
        <div className="flex justify-center">
          <button
            onClick={toggleTheme}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-black dark:text-white rounded"
          >
            {isDark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
