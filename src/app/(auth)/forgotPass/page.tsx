"use client"; // Энэ зааврыг хамгийн эхэнд бичих хэрэгтэй

import Link from "next/link";
import React, { useState } from "react";
import { auth, sendPasswordResetEmail } from "@/firebaseConfig"; // Adjust the path if necessary

const ForgotPass = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const linkHref = [
    { href: "/login", label: "Login" },
    { href: "/sign-up", label: "Sign Up" },
    { href: "/forgotPass", label: "Forgot Password" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Нууц үг сэргээх имэйлийг илгээх
      await sendPasswordResetEmail(auth, email);
      setSuccess(true); // Амжилттай илгээгдсэн гэж тэмдэглэх
      setError(""); // Алдааг арилгах
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message); // Алдаа гарах үед гарч ирэх мессеж
      } else {
        setError("Тодорхойгүй алдаа гарлаа.");
      }
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold uppercase ">Forgot Password</h1>
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
      <form className="flex flex-col w-full " onSubmit={handleSubmit}>
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
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        {success && (
          <p className="text-green-500 text-sm mt-2">
            Password reset email sent!
          </p>
        )}
        <button
          type="submit"
          className="bg-[#4281db] mt-5 w-full h-10 text-xl font-bold rounded-md border-1 border-[#4a4a4a] cursor-pointer px-3 py-1 hover:bg-[#3375cd] active:bg-[#0e69c3]"
        >
          Send
        </button>
      </form>
    </>
  );
};

export default ForgotPass;
