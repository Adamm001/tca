"use client";
import React, { useState } from "react";
import Image from "next/image";

// Props interface тодорхойлох
interface ProfileBookCardProps {
  id: number;
  title: string;
  author: string;
  price: number;
  condition: "шинэ" | "хэрэглэсэн" | "хуучин";
  imageUrl: string;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const ProfileBookCard: React.FC<ProfileBookCardProps> = ({
  id,
  title,
  author,
  price,
  condition,
  imageUrl,
  onEdit,
  onDelete,
}) => {
  // Засах горимын төлөв
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedPrice, setEditedPrice] = useState(price);

  // Засвар хадгалах функц
  const handleSaveEdit = () => {
    if (!editedTitle.trim()) {
      alert("Номын нэр хоосон байж болохгүй!");
      return;
    }
    onEdit(id);
    setIsEditing(false);
  };

  return (
    <div className="bg-[#262626] rounded-lg p-4 flex flex-col border border-[#323232] shadow-md hover:scale-105 transition-transform duration-200 ease-in-out hover:-translate-y-2 cursor-pointer">
      {/* Номын зураг */}
      <div className="w-full aspect-square relative mb-3">
        <Image
          src={imageUrl || "/images/book.png"} // Default зураг
          alt={title}
          width={1000}
          height={1000}
          className="w-full h-full object-cover rounded-md"
        />
      </div>

      {/* Номны мэдээлэл */}
      {isEditing ? (
        <div className="text-white space-y-2">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="w-full p-2 bg-[#1a1a1a] border border-[#4a4a4a] rounded focus:outline-none"
            placeholder="Номын нэр"
          />
          <input
            type="number"
            value={editedPrice}
            onChange={(e) => setEditedPrice(Number(e.target.value))}
            className="w-full p-2 bg-[#1a1a1a] border border-[#4a4a4a] rounded focus:outline-none"
            placeholder="Үнэ"
          />
          <div className="flex justify-between mt-3">
            <button
              onClick={handleSaveEdit}
              className="p-2 bg-[#2a3c31] text-white rounded cursor-pointer transition"
            >
              Хадгалах
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
            >
              Цуцлах
            </button>
          </div>
        </div>
      ) : (
        <div className="text-white space-y-2">
          <h2 className="text-lg font-semibold truncate">{title}</h2>
          <p className="text-sm text-gray-400 truncate">Зохиолч: {author}</p>
          <div className="flex justify-between items-center">
            <p className="text-base font-medium text-green-400">
              {price.toLocaleString()}₮
            </p>
            <span
              className={`text-xs px-2 py-1 rounded-md ${
                condition === "шинэ"
                  ? "bg-[#2a3c31] text-white"
                  : condition === "хэрэглэсэн"
                  ? "bg-[#53442c] text-white"
                  : "bg-[#4d302b] text-white"
              }`}
            >
              {condition}
            </span>
          </div>

          {/* Засах, Устгах товч */}
          <div className="flex justify-between mt-4 space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 p-2 bg-[#1e394c] text-white rounded cursor-pointer transition"
            >
              Засах
            </button>
            <button
              onClick={() => onDelete(id)}
              className="flex-1 p-2 bg-[#4d302b] text-white rounded cursor-pointer transition"
            >
              Устгах
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileBookCard;
