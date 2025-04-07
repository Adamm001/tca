"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "@/firebaseConfig";
import { useRouter } from "next/navigation";
import Image from "next/image"; // next/image-ийг импортлох

interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  status: "Зарах" | "Солих" | "Хандивлах"; // Номын төрөл
  imageUrl: string; // Номны зурагны URL
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string; // Хэрэглэгчийн үүрэг
}

const AdminBookCard: React.FC<{
  book: Book;
  onDelete: (id: string) => void;
}> = ({ book, onDelete }) => {
  return (
    <div className="bg-[#252525] p-6 rounded-lg border border-[#4a4a4a] w-full flex flex-col items-center">
      {/* Зургийг next/image ашиглан харуулах */}
      <Image
        src={book.imageUrl}
        alt={book.title}
        width={128} // Зургийн өргөн
        height={160} // Зургийн өндөр
        className="object-cover rounded-md mb-4"
      />
      <h2 className="text-xl font-semibold">{book.title}</h2>
      <p className="mt-2">Зохиолч: {book.author}</p>
      <p className="mt-2">Үнэ: {book.price}₮</p>
      <p className="mt-2">Төрөл: {book.status}</p>
      <button
        onClick={() => onDelete(book.id)}
        className="mt-4 bg-[#4d302b] text-white py-2 px-4 rounded-lg cursor-pointer hover:bg-[#3b241e] transition duration-200"
      >
        Устгах
      </button>
    </div>
  );
};

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
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [admins, setAdmins] = useState<User[]>([]); // Админ хэрэглэгчдийн төлөв
  const router = useRouter();

  // Firestore-оос номын өгөгдлийг татах
  const fetchBooks = async () => {
    const querySnapshot = await getDocs(collection(db, "books"));
    const booksData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Book, "id">),
    }));
    setBooks(booksData);
  };

  // Firestore-оос хэрэглэгчийн өгөгдлийг татах
  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const usersData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<User, "id">),
    }));
    setUsers(usersData);

    // Админ хэрэглэгчдийг шүүх
    const adminUsers = usersData.filter((user) => user.role === "admin");
    setAdmins(adminUsers);
  };

  // Ном устгах функц
  const handleDeleteBook = async (id: string) => {
    await deleteDoc(doc(db, "books", id));
    setBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
  };

  // Хэрэглэгч устгах функц
  const handleDeleteUser = async (id: string) => {
    await deleteDoc(doc(db, "users", id));
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
    setAdmins((prevAdmins) => prevAdmins.filter((admin) => admin.id !== id)); // Админы жагсаалтаас хасах
  };

  // Logout функц
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login"); // Нэвтрэх хуудас руу чиглүүлэх
    } catch (error) {
      console.error("Гарах үед алдаа гарлаа:", error);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchUsers();
  }, []);

  // Номнуудыг төрөл бүрээр шүүх
  const booksForSale = books.filter((book) => book.status === "Зарах");
  const booksForExchange = books.filter((book) => book.status === "Солих");
  const booksForDonation = books.filter((book) => book.status === "Хандивлах");

  return (
    <div className="p-5 w-full text-white flex flex-col items-center min-h-screen">
      <div className="bg-[#252525] p-6 rounded-lg border border-[#4a4a4а] w-full text-center">
        <h1 className="text-2xl font-bold">Админы хэсэг</h1>
        <p className="mt-4">Ном болон хэрэглэгчидийг удирдах</p>
        <button
          onClick={handleLogout}
          className="mt-4 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-500"
        >
          Гарах
        </button>
      </div>
      <div className="p-10 w-full">
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold bg-[#252525] w-full flex items-center justify-center h-10 rounded-lg border border-[#4a4a4a]">
            Админууд
          </h2>
          <div className="grid grid-cols-5 gap-4 mt-4">
            {admins.map((admin) => (
              <AdminUserCard
                key={admin.id}
                user={admin}
                onDelete={handleDeleteUser}
              />
            ))}
          </div>
        </div>
        <div className="mt-6">
          <h2 className="text-xl font-semibold bg-[#252525] w-full flex items-center justify-center h-10 rounded-lg border border-[#4a4a4a]">
            Зарах Номнууд
          </h2>
          <div className="grid grid-cols-6 gap-4 mt-4">
            {booksForSale.map((book) => (
              <AdminBookCard
                key={book.id}
                book={book}
                onDelete={handleDeleteBook}
              />
            ))}
          </div>
        </div>
        <div className="mt-6">
          <h2 className="text-xl font-semibold bg-[#252525] w-full flex items-center justify-center h-10 rounded-lg border border-[#4a4a4a]">
            Солих Номнууд
          </h2>
          <div className="grid grid-cols-6 gap-4 mt-4">
            {booksForExchange.map((book) => (
              <AdminBookCard
                key={book.id}
                book={book}
                onDelete={handleDeleteBook}
              />
            ))}
          </div>
        </div>
        <div className="mt-6">
          <h2 className="text-xl font-semibold bg-[#252525] w-full flex items-center justify-center h-10 rounded-lg border border-[#4a4а]">
            Хандивлах Номнууд
          </h2>
          <div className="grid grid-cols-6 gap-4 mt-4">
            {booksForDonation.map((book) => (
              <AdminBookCard
                key={book.id}
                book={book}
                onDelete={handleDeleteBook}
              />
            ))}
          </div>
        </div>
        <div className="mt-6">
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
      </div>
    </div>
  );
};

export default Admin;
