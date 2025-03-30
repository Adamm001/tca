"use client";

import Link from "next/link";
import React from "react";

const Home = () => {
  return (
    <div className="text-white ">
      <Link href="/login">Login</Link>
      <Link href="/sign-up">Sign Up</Link>
      <Link href="/forgotPass">Forgot Password</Link>
      <Link href="/container">home</Link>
    </div>
  );
};

export default Home;
