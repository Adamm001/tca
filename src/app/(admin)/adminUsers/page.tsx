"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/firebaseConfig";

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
    <div className="bg-[#252525] p-6 rounded-lg border border-[#4a4a4a] w-full flex flex-col justify-between items-center">
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
  const [users, setUsers] = useState<User[]>([]);

  // Firestore-оос хэрэглэгчийн өгөгдлийг татах
  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const usersData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<User, "id">),
    }));
    setUsers(usersData);
  };

  // Хэрэглэгч устгах функц
  const handleDeleteUser = async (id: string) => {
    await deleteDoc(doc(db, "users", id));
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-5 w-full text-white flex flex-col items-center min-h-screen">
      <h2 className="text-xl font-semibold bg-[#252525] w-full flex items-center justify-center h-10 rounded-lg border border-[#4a4a4a]">
        Хэрэглэгчид
      </h2>
      <div className="grid grid-cols-5  gap-4 mt-4">
        {users.map(
          (user) =>
            user.role !== "admin" && (
              <AdminUserCard
                key={user.id}
                user={user}
                onDelete={handleDeleteUser}
              />
            )
        )}
      </div>
    </div>
  );
};

export default Admin;
