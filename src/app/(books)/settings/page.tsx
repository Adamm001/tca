"use client";

import Link from "next/link";
import React from "react";

const Settings = () => {
  return (
    <div className="min-h-screen  text-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-100">
        Тохиргооны хэсэг
      </h1>
      <div className=" p-6 rounded-lg shadow-md w-full max-w-lg">
        <p className="text-base font-medium text-center mb-4 text-gray-300">
          Та доорх тохиргооны хэсгүүдээс сонгоно уу:
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/settings/userSettings"
            className="block w-full text-center py-2 px-4 bg-blue-600 rounded-md text-white font-medium hover:bg-blue-700 transition"
          >
            Хэрэглэгчийн тохиргоо
          </Link>
          <Link
            href="/settings/systemSettings"
            className="block w-full text-center py-2 px-4 bg-gray-600 rounded-md text-white font-medium hover:bg-gray-700 transition"
          >
            Системийн тохиргоо
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Settings;
