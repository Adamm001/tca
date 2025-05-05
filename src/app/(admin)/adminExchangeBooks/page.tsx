"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import Image from "next/image"; // next/image-ийг импортлох

interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  status: "Зарах" | "Солих" | "Хандивлах"; // Номын төрөл
  imageUrl: string; // Номны зурагны URL
}

const AdminBookCard: React.FC<{
  book: Book;
  onDelete: (id: string) => void;
}> = ({ book, onDelete }) => {
  return (
    <div className="bg-[#252525] p-6 rounded-lg border border-[#4a4a4a] w-full flex flex-col justify-between items-center">
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

const Admin = () => {
  const [books, setBooks] = useState<Book[]>([]);

  // Firestore-оос номын өгөгдлийг татах
  const fetchBooks = async () => {
    const querySnapshot = await getDocs(collection(db, "books"));
    const booksData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Book, "id">),
    }));
    setBooks(booksData);
  };

  // Ном устгах функц
  const handleDeleteBook = async (id: string) => {
    await deleteDoc(doc(db, "books", id));
    setBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const booksForExchange = books.filter((book) => book.status === "Солих");

  return (
    <div className="p-5 w-full text-white flex flex-col items-center">
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
  );
};

export default Admin;
