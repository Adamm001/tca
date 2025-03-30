"use client"; // Энэ зааврыг хамгийн эхэнд бичих хэрэгтэй

import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebaseConfig";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();
  const linkHref = [
    { href: "/login", label: "Login" },
    { href: "/sign-up", label: "Sign Up" },
    { href: "/forgotPass", label: "Forgot Password" },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/container"); // Redirect to home page after successful login
    } catch (err) {
      setError("Invalid email or password.");
      console.error("Login error:", err);
    }
  };
  return (
    <>
      <h1 className="text-2xl font-bold uppercase ">
        Log in to your iBook account
      </h1>
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

      <form className="flex flex-col w-full " onSubmit={handleLogin}>
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
          className="w-full border border-[#4a4a4a] p-1 h-10 rounded-md focus:outline-0 focus:bg-[#191919]"
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
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-1 h-10 border border-[#4a4a4a] rounded-md focus:outline-0 focus:bg-[#191919]"
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <button
          type="submit"
          className="bg-[#4281db] w-full h-10 text-xl font-bold rounded-md border-1 border-[#4a4a4a] cursor-pointer px-3 py-1 mt-5 hover:bg-[#3375cd] active:bg-[#0e69c3]"
        >
          Login
        </button>
      </form>
    </>
  );
};

export default Login;
