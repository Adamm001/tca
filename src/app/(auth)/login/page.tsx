"use client"; // Энэ зааврыг хамгийн эхэнд бичих хэрэгтэй

import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();
  const linkHref = [
    { href: "/login", label: "Нэвтрэх" },
    { href: "/sign-up", label: "Бүртгүүлэх" },
    { href: "/forgotPass", label: "Нууц үгээ мартсан" },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Firebase Authentication ашиглан нэвтрэх
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Firestore-оос хэрэглэгчийн мэдээллийг татах
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === "admin") {
          router.push("/adminSellBooks"); // Хэрэв role нь admin бол /admin руу чиглүүлэх
        } else {
          router.push("/profile"); // Бусад тохиолдолд /profile руу чиглүүлэх
        }
      } else {
        setError("Хэрэглэгчийн мэдээлэл олдсонгүй.");
      }
    } catch (err) {
      setError("И-мэйл, Нууц үг буруу байна.");
      console.error("Нэвтрэх алдаа:", err);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold uppercase ">Нэвтрэх</h1>
      <ul className="flex flex-col w-full gap-2">
        {linkHref.map((link, index) => (
          <li
            key={index}
            className={`w-full h-10 rounded-md border border-[#4a4a4a] hover:bg-[#2f2f2f] active:bg-[#252525] active:scale-101 transition ${
              link.href === "/login" ? "bg-[#2f2f2f]" : ""
            }`}
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
          И-мэйл хаяг
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="И-мэйл"
          className="w-full border border-[#4a4a4a] p-1 h-10 rounded-md focus:outline-0 focus:bg-[#191919]"
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
          placeholder="Нууц үг"
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-1 h-10 border border-[#4a4a4a] rounded-md focus:outline-0 focus:bg-[#191919]"
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <button
          type="submit"
          className="bg-[#1e394c] w-full h-10 text-xl font-bold rounded-md border-1 border-[#4a4a4a] cursor-pointer px-3 py-1 mt-5 hover:bg-[#1e394c] active:bg-[#0e69c3]"
        >
          Нэвтрэх
        </button>
      </form>
    </>
  );
};

export default Login;
