"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { query, where } from "firebase/firestore";
import { setDoc } from "firebase/firestore";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string; // Хэрэглэгчийн үүрэг
}

const AdminUserCard: React.FC<{
  user: User;
  onDelete: (id: string) => void;
}> = ({ user, onDelete }) => {
  return (
    <div className="bg-[#252525] p-6 rounded-lg border border-[#4a4a4a] w-full flex flex-col items-center">
      <h2 className="text-xl font-semibold">{user.name}</h2>
      <p className="mt-2">Email: {user.email}</p>
      <p className="mt-2">Phone: {user.phone}</p>
      <p className="mt-2">Role: {user.role}</p>
      <button
        onClick={() => onDelete(user.id)}
        className="mt-4 bg-[#4d302b] text-white py-2 px-4 rounded-lg cursor-pointer hover:bg-[#3b241e] transition duration-200"
      >
        Устгах
      </button>
    </div>
  );
};

const Admin = () => {
  const [admins, setAdmins] = useState<User[]>([]); // Админ хэрэглэгчдийн төлөв
  const [Modal, setModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState(""); // Хэрэглэгчийн нэр
  const [phone, setPhone] = useState(""); // Утасны дугаар
  const role = "user"; // Хэрэглэгчийн үүрэг (default: user)
  const [error, setError] = useState("");

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
  // Firestore-оос хэрэглэгчийн өгөгдлийг татах
  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const usersData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<User, "id">),
    }));

    // Админ хэрэглэгчдийг шүүх
    const adminUsers = usersData.filter((user) => user.role === "admin");
    setAdmins(adminUsers);
  };

  // Хэрэглэгч устгах функц
  const handleDeleteUser = async (id: string) => {
    await deleteDoc(doc(db, "users", id));
    setAdmins((prevAdmins) => prevAdmins.filter((admin) => admin.id !== id)); // Админы жагсаалтаас хасах
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-5 w-full text-white flex flex-col items-center min-h-screen">
      <h2 className="text-xl font-semibold bg-[#252525] w-full flex items-center justify-center h-10 rounded-lg border border-[#4a4a4a]">
        Админууд
      </h2>
      <div>
        <p>Админ нэмэх</p>
        <button
          className="bg-[#1e394c] text-white py-2 px-4 rounded-lg mt-2 hover:bg-[#1e394c] transition duration-200"
          onClick={() => setModal(true)}
        >
          Нэмэх
        </button>
      </div>
      <p className="text-sm text-gray-400 mt-2">
        Админ хэрэглэгчид: {admins.length} хэрэглэгч байна.
      </p>
      <div className="grid grid-cols-5 gap-4 mt-4">
        {admins.map((admin) => (
          <AdminUserCard
            key={admin.id}
            user={admin}
            onDelete={handleDeleteUser}
          />
        ))}
      </div>

      {Modal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
          <form
            className="flex flex-col  bg-[#252525] p-6 rounded-lg w-96 text-white"
            onSubmit={handleSubmit}
          >
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
            <div className="flex gap-2 mt-5">
              <button
                type="submit"
                className="bg-[#1e394c] w-2/3 h-10 text-xl font-bold rounded-md border-1 border-[#4a4a4a] cursor-pointer px-3 py-1 hover:bg-[#1e394c] active:bg-[#0e69c3]"
              >
                Бүртгүүлэх
              </button>
              <button
                className="bg-[#db4242] w-1/3 h-10 text-xl font-bold rounded-md border-1 border-[#4a4a4a] cursor-pointer px-3 py-1 hover:bg-[#cd3333] active:bg-[#c30e0e]"
                onClick={() => setModal(false)}
              >
                Хаах
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Admin;
