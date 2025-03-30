"use client";
import BookCard from "@/components/bookCard";
import React from "react";

// Номын өгөгдлийн массив
const books = [
  {
    id: 1,
    title: "Шинжлэх ухааны гайхамшиг",
    author: "Жон Доу",
    price: 25000,
    condition: "шинэ",
    imageUrl: "",
  },
  {
    id: 2,
    title: "Уран зохиолын гайхамшигт ертөнц",
    author: "А. Түмэнжаргал",
    price: 18000,
    condition: "хэрэглэсэн",
    imageUrl: "",
  },
  {
    id: 3,
    title: "Технологийн хувьсгал",
    author: "Элон Маск",
    price: 30000,
    condition: "шинэ",
    imageUrl: "",
  },
  {
    id: 4,
    title: "Түүхэн нууцууд",
    author: "Батбаяр",
    price: 20000,
    condition: "хуучин",
    imageUrl: "",
  },
  {
    id: 5,
    title: "JavaScript-ийн үндэс",
    author: "Жон Дэвид",
    price: 15000,
    condition: "шинэ",
    imageUrl: "",
  },
  {
    id: 6,
    title: "Монголын түүх",
    author: "Д. Намжил",
    price: 12000,
    condition: "хуучин",
    imageUrl: "",
  },
];

const Exchange = () => {
  const handleViewDetails = (title: string) => {
    alert(`"${title}" номын дэлгэрэнгүйг харах гэж байна!`);
  };

  return (
    <div className="w-full h-screen flex flex-col items-center overflow-y-auto text-white p-5 ">
      <h1 className="text-3xl font-bold mb-6 text-center">Ном солилцох</h1>
      <div className="w-full gap-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {books.map((book) => (
          <BookCard
            key={book.id}
            title={book.title}
            author={book.author}
            price={book.price}
            condition={book.condition as "шинэ" | "хэрэглэсэн" | "хуучин"}
            imageUrl={book.imageUrl}
            onClick={() => handleViewDetails(book.title)}
          />
        ))}
      </div>
    </div>
  );
};

export default Exchange;
