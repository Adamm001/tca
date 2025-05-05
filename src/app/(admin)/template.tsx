"use client";

import Image from "next/image";
import Link from "next/link";
import { auth } from "@/firebaseConfig";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LibraryBig,
  UserRoundSearch,
  ArrowLeftRight,
  LogOut,
  User as LucideUser,
  Search,
  Banknote,
  Settings,
  Users,
  ShieldUser,
  MessageCircle,
} from "lucide-react"; // Lucide-ийн icon-ыг rename хийж оруулах

// 📌 Хэрэглэгчийн мэдээллийн интерфэйс
interface UserInfo {
  name?: string;
  email?: string;
  phone?: string;
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const linkHref = [
    { icon: Search, href: "searchBooks", label: "Ном Хайх" },
    { icon: LibraryBig, href: "adminSellBooks", label: "Зарах Номнууд" },
    {
      icon: ArrowLeftRight,
      href: "adminExchangeBooks",
      label: "Солилцох Номнууд",
    },
    { icon: Banknote, href: "adminDonateBooks", label: "Хандивын Номнууд" },
  ];
  const functionLinkHref = [
    {
      icon: UserRoundSearch,
      href: "adminSearchUsers",
      label: "Хэрэглэгч хайх",
    },
    { icon: Users, href: "adminUsers", label: "Хэрэглэгчид" },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
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
          <div className="flex items-center gap-5">
            <Image
              src="/logo/Logo.png"
              alt="logo"
              height={1000}
              width={1000}
              className="w-6 h-6"
            />
            <p className="text-[#9b9b9b] font-semibold text-lg uppercase">
              Admin
            </p>
          </div>
          {/* Хувийн мэдээлэл */}
          <div className="flex flex-col gap-1">
            <div className="w-full h-8 p-1 flex items-center gap-3 my-2 hover:bg-[#2c2c2c] rounded-lg transition ease-in-out duration-200">
              <div className="w-6 h-6 bg-black rounded-md flex items-center justify-center">
                <LucideUser className="text-[#ffffff]" />
              </div>

              <p className="text-lg text-[#d5d5d5] font-semibold truncate">
                Админ
              </p>
            </div>
            {/* Үндсэн холбоосууд */}
            <p className="text-[#9b9b9b]">Номнууд</p>
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
            <p className="text-[#9b9b9b]">Хэрэглэгч</p>
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
          <div className="flex flex-col gap-1 w-full">
            <p className="text-[#9b9b9b]">Админууд</p>
            <Link
              href="/admins"
              className="w-full h-8 p-2 flex items-center gap-3 hover:bg-[#2c2c2c] rounded-lg transition ease-in-out duration-200"
            >
              <ShieldUser className="w-5 h-5 text-[#9b9b9b]" />
              <p className="text-lg text-[#9b9b9b] truncate">Админууд</p>
            </Link>
          </div>
          <div className="flex flex-col gap-1 w-full">
            <p className="text-[#9b9b9b]">Функц</p>
            <Link
              href="#"
              className="w-full h-8 p-2 flex items-center gap-3 hover:bg-[#2c2c2c] rounded-lg transition ease-in-out duration-200"
            >
              <MessageCircle className="w-5 h-5 text-[#9b9b9b]" />
              <p className="text-lg text-[#9b9b9b] truncate">Чат</p>
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-3 w-full">
          <div>
            <Link
              href="/settings"
              className="w-full h-8 p-1 flex items-center gap-3 hover:bg-[#2c2c2c] rounded-lg transition ease-in-out duration-200 text-[#d5d5d5]"
            >
              <Settings className="w-5 h-5 text-[#9b9b9b]" />
              <p className="text-lg text-[#9b9b9b]">Тохиргоо</p>
            </Link>
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
        </div>
      </header>

      {/* Main хэсэг - Scroll нэмэгдсэн */}
      <main className="text-white p-3 w-6/7 fixed h-screen top-0 right-0 flex flex-col gap-10 items-center overflow-y-auto scrollbar-thin scrollbar-thumb-[#2f2f2f] scrollbar-track-[#1a1a1a] bg-[#1a1a1a]">
        {children}
      </main>
    </div>
  );
}
