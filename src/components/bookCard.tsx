"use client";
import Image from "next/image";
import React from "react";

// Props interface тодорхойлох
interface BookCardProps {
  title: string;
  author: string;
  price?: number; // Nullable болгож тохируулсан
  imageUrl: string;
  onClick?: () => void;
}

const BookCard: React.FC<BookCardProps> = ({
  title,
  author,
  price,
  imageUrl,
  onClick,
}) => {
  return (
    <div
      className="bg-[#262626] rounded-lg p-4 flex flex-col border border-[#2f2f2f] shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200 ease-in-out hover:-translate-y-2 hover:bg-[#333333] "
      onClick={onClick}
    >
      {/* Номын зураг */}
      <div className="w-full aspect-square relative ">
        <Image
          src={imageUrl || "/images/book.png"}
          alt={title || "Номын зураг"} // ✅ Alt утга оноох
          width={1000}
          height={1000}
          className="w-full h-full object-cover rounded-md"
        />
      </div>

      {/* Номын мэдээлэл */}
      <div className="mt-3 text-white space-y-2">
        {/* Номын нэр */}
        <h2 className="text-lg font-semibold truncate">{title}</h2>
        {/* Зохиолчийн нэр */}
        <p className="text-sm text-gray-400 truncate">Зохиолч: {author}</p>

        {/* Үнэ ба төлөв */}
        <div className="flex justify-between items-center">
          <p className="text-base font-medium text-[#659c75]">
            {price !== undefined && price !== null
              ? `${price.toLocaleString()} ₮`
              : "Үнэ байхгүй"}
          </p>
        </div>

        {/* Дэлгэрэнгүй товч */}
        <button
          className="mt-3 w-full p-2 bg-[#1e394c] text-white rounded-md hover:bg-[#1e394c] transition"
          onClick={onClick}
        >
          Дэлгэрэнгүй
        </button>
      </div>
    </div>
  );
};

export default BookCard;
