"use client";
import BookCard from "@/components/bookCard";
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebaseConfig";

// Firestore-с ном унших функц
const getBooksFromFirestore = async () => {
  const querySnapshot = await getDocs(collection(db, "books"));
  const books = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  console.log("Номын жагсаалт:", books);
  return books;
};

const Container = () => {
  // 📚 Номын өгөгдлийн төлөв (useState ашиглана)
  const [books, setBooks] = useState<any[]>([]); // Firestore-оос татах тул анх хоосон массив

  // Номын дэлгэрэнгүй харах товчийг дарах үед ажиллах функц
  const handleViewDetails = (title: string) => {
    alert(`"${title}" номын дэлгэрэнгүйг харах гэж байна!`);
  };

  // 🎯 Ном татах үед ашиглах
  useEffect(() => {
    const fetchBooks = async () => {
      const booksData = await getBooksFromFirestore(); // Firestore-оос татна
      setBooks(booksData); // State-д хадгалах
    };
    fetchBooks();
  }, []);

  return (
    <div className="w-full h-screen flex flex-col items-center overflow-y-auto text-white p-5 bg-[#1a1a1a]">
      <h1 className="text-3xl font-bold mb-6 text-center">Хандивын номнууд</h1>

      {/* Ном байхгүй үед харагдах хэсэг */}
      {books.length === 0 ? (
        <div className="text-center text-gray-400 text-lg">Ном олдсонгүй.</div>
      ) : (
        <div className="w-full gap-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {books.map(
            (book) =>
              book.status === "Хандивлах" && (
                <BookCard
                  key={book.id}
                  title={book.title}
                  author={book.author}
                  price={book.price}
                  condition={book.condition as "шинэ" | "хэрэглэсэн" | "хуучин"}
                  imageUrl={book.imageUrl || "/images/book-placeholder.png"}
                  onClick={() => handleViewDetails(book.title)}
                />
              )
          )}
        </div>
      )}
    </div>
  );
};

export default Container;
