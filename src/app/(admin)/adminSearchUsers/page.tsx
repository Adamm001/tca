"use client";

import React, { useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";

// 📚 Хэрэглэгчийн өгөгдлийн төрлийг тодорхойлох
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

// 📚 Хэрэглэгч хайх функц (Firestore-с хайлт хийх)
const searchUsersInFirestore = async (searchTerm: string): Promise<User[]> => {
  const filters: QueryConstraint[] = [
    where("name", "==", searchTerm),
    where("email", "==", searchTerm),
    where("phone", "==", searchTerm),
  ];

  const q = query(collection(db, "users"), ...filters);

  try {
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<User, "id">),
    }));
  } catch (error) {
    console.error("Хайлт хийхэд алдаа гарлаа:", error);
    return [];
  }
};

const AdminSearchUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [noResults, setNoResults] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const results = await searchUsersInFirestore(searchTerm);

    if (results.length === 0) {
      setNoResults(true);
      setSearchResults([]);
    } else {
      setNoResults(false);
      setSearchResults(results);
    }
  };

  return (
    <div className="w-full flex flex-col items-center min-h-screen bg-[#1a1a1a] text-white p-4">
      <h1 className="text-3xl font-bold mb-4">Хэрэглэгч хайх</h1>
      <form
        onSubmit={handleSearch}
        className="p-4 rounded-lg border border-[#4a4a4a] w-full max-w-3/5 space-y-4 bg-[#252525]"
      >
        <div className="w-full">
          <label className="block text-gray-300">Хайх утга</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Нэр, И-мэйл эсвэл Утасны дугаар"
            className="w-full border border-[#4a4a4a] p-2 h-10 rounded-md bg-[#1a1a1a] text-white"
          />
        </div>
        <button
          type="submit"
          className="h-10 w-full p-2 bg-[#4281db] text-white rounded hover:bg-[#3375cd] active:bg-[#0e69c3]"
        >
          Хайх
        </button>
      </form>

      <div className="mt-8 w-full max-w-3/5">
        <h2 className="text-2xl font-bold mb-4">🔍 Хайлтын үр дүн:</h2>
        {noResults ? (
          <div className="bg-[#252525] p-4 rounded-lg border border-[#4a4a4a] text-gray-300">
            Хайлтад тохирох үр дүн олдсонгүй.
          </div>
        ) : (
          <div className="space-y-4">
            {searchResults.map((user) => (
              <div
                key={user.id}
                className="bg-[#252525] p-4 rounded-lg border border-[#4a4a4a] text-white"
              >
                <h3 className="text-xl font-bold">{user.name}</h3>
                <p className="text-gray-400">И-мэйл: {user.email}</p>
                <p className="text-gray-400">Утас: {user.phone}</p>
                <p className="text-gray-400">Үүрэг: {user.role}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSearchUsers;
