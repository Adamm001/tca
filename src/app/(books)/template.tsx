"use client";

import Image from "next/image";
import Link from "next/link";
import { auth, db } from "@/firebaseConfig";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LibraryBig,
  Plus,
  ArrowLeftRight,
  LogOut,
  User as LucideUser,
  Files,
  MessageSquare,
  Search,
  Banknote,
} from "lucide-react"; // Lucide-ийн icon-ыг rename хийж оруулах
import { doc, getDoc } from "firebase/firestore";

export default function BooksLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null); // Хэрэглэгчийн нэмэлт мэдээлэл

  const linkHref = [
    { icon: Search, href: "/search", label: "Ном Хайх" },
    { icon: LibraryBig, href: "/container", label: "Зарах Номнууд" },
    { icon: ArrowLeftRight, href: "/exchange", label: "Солилцох Номнууд" },
    { icon: Banknote, href: "/donate", label: "Хандивын Номнууд" },
  ];
  const functionLinkHref = [
    { icon: Plus, href: "/sell", label: "Ном Нэмэх" },
    { icon: Files, href: "/requests", label: "Хүсэлтүүд" },
    { icon: MessageSquare, href: "/chats", label: "Чат" },
  ];
  // 🔄 Firestore-с хэрэглэгчийн нэмэлт мэдээллийг татах
  const fetchUserInfo = async (uid: string) => {
    const userDoc = doc(db, "users", uid);
    const userSnapshot = await getDoc(userDoc);
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      setUserInfo(userData);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserInfo(currentUser.uid); // Call fetchUserInfo when user is set
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null); // Logout хийсний дараа хэрэглэгчийн төлөвийг null болгоно
      router.push("/login"); // /login хуудас руу шилжүүлэх
    } catch (error) {
      console.error("Гарахад алдаа гарлаа: ", error);
    }
  };

  return (
    <div className="flex-1 min-h-full flex w-full">
      {/* Sidebar хэсэг */}
      <header className="h-screen bg-[#202020] w-1/7 p-3 flex flex-col border-r border-[#2b2b2b] shadow-lg justify-between">
        <div className="flex flex-col gap-3">
          {/* Лого */}
          <Image
            src="/logo/Logo.png"
            alt="logo"
            height={1000}
            width={1000}
            className="w-6 h-6"
          />
          {/* Хувийн мэдээлэл */}
          <div className="flex flex-col gap-1">
            <Link
              href={"/profile"}
              className="w-full h-8 p-1 flex items-center gap-3 my-2 hover:bg-[#2c2c2c] rounded-lg transition ease-in-out duration-200"
            >
              <div className="w-6 h-6 bg-black rounded-md flex items-center justify-center">
                <LucideUser className="text-[#9b9b9b]" />
              </div>

              {user && userInfo && (
                <p className="text-lg text-[#d5d5d5] truncate">
                  {userInfo.name ? userInfo.name : user.email}
                </p>
              )}
            </Link>
            {/* Үндсэн холбоосууд */}
            {linkHref.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="w-full h-8 p-2 flex items-center gap-3 hover:bg-[#2c2c2c] rounded-lg transition ease-in-out duration-200"
              >
                <link.icon className="w-5 h-5 text-[#9b9b9b]" />
                <p className="text-lg text-[#9b9b9b] truncate">{link.label}</p>
              </Link>
            ))}
          </div>

          {/* Функц холбоосууд */}
          <div className="flex flex-col gap-1 w-full">
            <p className="text-[#9b9b9b]">Функц</p>
            {functionLinkHref.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="w-full h-8 p-2 flex items-center gap-3 hover:bg-[#2c2c2c] rounded-lg transition ease-in-out duration-200"
              >
                <link.icon className="w-5 h-5 text-[#9b9b9b]" />
                <p className="text-lg text-[#9b9b9b] truncate">{link.label}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Гарах товч */}
        {user && (
          <button
            onClick={handleLogout}
            className="w-full h-8 p-1 flex items-center gap-3 hover:bg-[#2c2c2c] rounded-lg transition ease-in-out duration-200 text-[#d5d5d5]"
          >
            <LogOut className="w-5 h-5 text-red-500" />
            <p className="text-lg text-[#9b9b9b]">Гарах</p>
          </button>
        )}
      </header>

      {/* Main хэсэг - Scroll нэмэгдсэн */}
      <main className="text-white p-3 w-6/7 fixed min-h-screen top-0 right-0 flex flex-col gap-10 items-center overflow-y-auto scrollbar-thin scrollbar-thumb-[#2f2f2f] scrollbar-track-[#1a1a1a] bg-[#1a1a1a]">
        {children}
      </main>
    </div>
  );
}
