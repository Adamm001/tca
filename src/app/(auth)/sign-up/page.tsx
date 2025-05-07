"use client"; // Энэ зааврыг хамгийн эхэнд бичих хэрэгтэй

import Link from "next/link";
import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { query, where, collection, getDocs } from "firebase/firestore";
import { setDoc, doc } from "firebase/firestore";
import { db } from "@/firebaseConfig";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState(""); // Хэрэглэгчийн нэр
  const [phone, setPhone] = useState(""); // Утасны дугаар
  const role = "user"; // Хэрэглэгчийн үүрэг (default: user)
  const [error, setError] = useState("");

  const linkHref = [
    { href: "/login", label: "Нэвтрэх" },
    { href: "/sign-up", label: "Бүртгүүлэх" },
    { href: "/forgotPass", label: "Нууц үгээ мартсан" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Алдааны мессежийг цэвэрлэх
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      // Firestore-оос и-мэйл болон утасны дугаарыг шалгах
      const usersRef = collection(db, "users");
      const emailQuery = query(usersRef, where("email", "==", email));
      const phoneQuery = query(usersRef, where("phone", "==", phone));

      const emailSnapshot = await getDocs(emailQuery);
      const phoneSnapshot = await getDocs(phoneQuery);

      if (!emailSnapshot.empty) {
        setError("Энэ И-мейл хаяг бүртгэлтэй байна.");
        return;
      }

      if (!phoneSnapshot.empty) {
        setError("Энэ утасны дугаар бүртгэлтэй байна.");
        return;
      }

      // Хэрэв давхардал байхгүй бол хэрэглэгчийг бүртгэх
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Firebase Firestore-д хэрэглэгчийн мэдээллийг хадгалах
      await setDoc(doc(db, "users", user.uid), {
        name,
        phone,
        email,
        role, // Хэрэглэгчийн үүргийг хадгалах
      });

      // Амжилттай бүртгүүлсний дараа хэрэглэгчийг нэвтрэх хуудас руу шилжүүлэх
      window.location.href = "/tca/login";
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
      <h1 className="text-2xl font-bold uppercase ">Бүртгүүлэх</h1>
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
          htmlFor="name"
          className="block text-sm font-medium text-gray-300"
        >
          Нэр
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Нэр"
          className="w-full h-10 border border-[#4a4a4a] p-1 rounded-md focus:outline-0 focus:bg-[#191919]"
          required
        />

        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-300 mt-2"
        >
          Утасны дугаар
        </label>
        <input
          type="text"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Утасны дугаар"
          className="w-full h-10 border border-[#4a4a4a] p-1 rounded-md focus:outline-0 focus:bg-[#191919]"
          required
        />

        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-300 mt-2"
        >
          И-мэйл хаяг
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="И-мэйл"
          className="w-full h-10 border border-[#4a4a4a] p-1 rounded-md focus:outline-0 focus:bg-[#191919]"
        />

        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-300 mt-2"
        >
          Нууц үг
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Нууц үг"
          required
          className="w-full h-10 border border-[#4a4a4a] p-1 rounded-md focus:outline-0 focus:bg-[#191919]"
        />

        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-300 mt-2"
        >
          Нууц үг давтах
        </label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Нууц үг давтах"
          required
          className="w-full h-10 border border-[#4a4a4a] p-1 rounded-md focus:outline-0 focus:bg-[#191919]"
        />

        <p className="text-[#cf5d57]">{error}</p>
        <button
          type="submit"
          className="bg-[#1e394c] mt-5 w-full h-10 text-xl font-bold rounded-md border-1 border-[#4a4a4a] cursor-pointer px-3 py-1 hover:bg-[#1e394c] active:bg-[#0e69c3]"
        >
          Бүртгүүлэх
        </button>
      </form>
    </>
  );
};

export default SignUp;
