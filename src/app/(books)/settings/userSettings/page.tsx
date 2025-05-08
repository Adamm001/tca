"use client";

import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";

const UserSettings = () => {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); // Утасны дугаарын төлөв
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Хэрэглэгчийн мэдээллийг татах
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setName(userData.name || "");
          setEmail(userData.email || "");
          setPhone(userData.phone || ""); // Утасны дугаарыг татах
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  // Хэрэглэгчийн мэдээллийг шинэчлэх
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, { name, email, phone }); // Утасны дугаарыг шинэчлэх
      setSuccessMessage("Мэдээлэл амжилттай шинэчлэгдлээ!");
    } catch (error) {
      console.error("Мэдээлэл шинэчлэхэд алдаа гарлаа:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-center text-white">
        Хэрэглэгчийн тохиргоо
      </h1>
      <div className="flex flex-col items-center justify-center h-screen text-white">
        <div className="bg-[#8d8d8d27] p-5 rounded-lg shadow-lg flex flex-col gap-5 w-full max-w-md">
          <form onSubmit={handleUpdate} className="flex flex-col gap-4">
            <label className="flex flex-col">
              Нэр:
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="p-2 rounded bg-[#2f2f2f] text-white"
                required
              />
            </label>
            <label className="flex flex-col">
              Имэйл:
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-2 rounded bg-[#2f2f2f] text-white"
                required
              />
            </label>
            <label className="flex flex-col">
              Утасны дугаар:
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="p-2 rounded bg-[#2f2f2f] text-white"
                required
              />
            </label>
            <button
              type="submit"
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? "Шинэчилж байна..." : "Шинэчлэх"}
            </button>
          </form>
          {successMessage && (
            <p className="text-green-500 text-center">{successMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
