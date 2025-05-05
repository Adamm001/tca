"use client";

import Link from "next/link";
import React from "react";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-white ">
      <div className=" bg-[#8d8d8d27] p-5 rounded-lg shadow-lg flex flex-col gap-5">
        <Link
          className="h-10 w-60 rounded-lg bg-[#212121] hover:bg-[#1b1b1b] cursor-pointer flex items-center justify-center text-lg"
          href="/login"
        >
          Login
        </Link>
        <Link
          className="h-10 w-60 rounded-lg bg-[#212121] hover:bg-[#1b1b1b] cursor-pointer flex items-center justify-center text-lg"
          href="/sign-up"
        >
          Sign Up
        </Link>
        <Link
          className="h-10 w-60 rounded-lg bg-[#212121] hover:bg-[#1b1b1b] cursor-pointer flex items-center justify-center text-lg"
          href="/forgotPass"
        >
          Forgot Password
        </Link>
      </div>
    </div>
  );
};

export default Home;
