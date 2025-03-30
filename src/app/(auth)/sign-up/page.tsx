"use client"; // Энэ зааврыг хамгийн эхэнд бичих хэрэгтэй

import Link from "next/link";
import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebaseConfig";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const linkHref = [
    { href: "/login", label: "Login" },
    { href: "/sign-up", label: "Sign Up" },
    { href: "/forgotPass", label: "Forgot Password" },
  ];
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Redirect user or show success message
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred.");
      }
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold uppercase ">Sign Up</h1>
      <ul className="flex flex-col w-full gap-2">
        {linkHref.map((link, index) => (
          <li
            key={index}
            className="w-full h-10 rounded-md border border-[#4a4a4a] hover:bg-[#2f2f2f] active:bg-[#252525] active:scale-101 transition"
          >
            <Link
              className="w-full h-full flex items-center justify-center text-lg "
              href={link.href}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      <form className="flex flex-col w-full" onSubmit={handleSubmit}>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-300"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full h-10 border border-[#4a4a4a] p-1 rounded-md focus:outline-0 focus:bg-[#191919]"
        />

        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-300 mt-2"
        >
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full h-10 border border-[#4a4a4a] p-1 rounded-md focus:outline-0 focus:bg-[#191919]"
        />

        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-300 mt-2"
        >
          Re-enter Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-Password"
          className="w-full h-10 border border-[#4a4a4a] p-1 rounded-md focus:outline-0 focus:bg-[#191919]"
        />
        <p className="text-[#cf5d57]">{error}</p>
        <button
          type="submit"
          className="bg-[#4281db] mt-5 w-full h-10 text-xl font-bold rounded-md border-1 border-[#4a4a4a] cursor-pointer px-3 py-1 hover:bg-[#3375cd] active:bg-[#0e69c3]"
        >
          Sign Up
        </button>
      </form>
    </>
  );
};

export default SignUp;
