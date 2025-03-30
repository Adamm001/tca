"use client";
import React, { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/firebaseConfig";

const Sell = () => {
  const [book, setBook] = useState({
    title: "",
    author: "",
    category: "",
    price: "",
    condition: "",
    status: "Зарах", // Анхдагч утга
    imageUrl: "", // Шинэ зураг хадгалах
  });

  const [image, setImage] = useState<File | null>(null); // Файл хадгалах төлөв
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // Урьдчилан харах зураг

  // 📤 Зураг upload хийх функц
  const uploadImageToStorage = async (file: File) => {
    const storageRef = ref(storage, `bookImages/${Date.now()}_${file.name}`);
    try {
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(uploadResult.ref);
      return downloadUrl;
    } catch (error) {
      console.error("Зураг байршуулахад алдаа гарлаа:", error);
      return "";
    }
  };

  // 📚 Firestore-д ном хадгалах функц
  const addBookToFirestore = async (book: any) => {
    try {
      await addDoc(collection(db, "books"), book);
      console.log("Ном амжилттай нэмэгдлээ!");
    } catch (error) {
      console.error("Ном хадгалахад алдаа гарлаа:", error);
    }
  };

  // 📑 Input утгуудыг өөрчлөх
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setBook({ ...book, [e.target.name]: e.target.value });
  };

  // 📸 Файл сонгох үед зураг хадгалах
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setImage(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile)); // Урьдчилан харах зураг
    }
  };

  // 🎯 Ном нэмэх үйлдэл
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let uploadedImageUrl = "/images/book-placeholder.png"; // Default зураг
    if (image) {
      uploadedImageUrl = await uploadImageToStorage(image);
    }

    if (!uploadedImageUrl) {
      console.error("Зураг upload хийгдсэнгүй!");
      return;
    }

    const newBook = {
      ...book,
      imageUrl: uploadedImageUrl,
      createdAt: new Date(),
    };

    // Firestore-т ном хадгалах
    await addBookToFirestore(newBook);
    setSuccessMessage(`"${newBook.title}" амжилттай нэмэгдлээ!`);

    // 📚 Input утгуудыг хоослох
    setBook({
      title: "",
      author: "",
      category: "",
      price: "",
      condition: "",
      status: "Зарах",
      imageUrl: "",
    });
    setImage(null);
    setPreviewUrl(null);
  };

  return (
    <div className="w-full h-screen flex flex-col items-center overflow-y-auto text-white p-4 bg-[#1a1a1a]">
      <h1 className="text-3xl font-bold mb-4">Ном нэмэх</h1>

      {/* 📚 Ном нэмэх форм */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#252525] p-6 rounded-lg border border-[#4a4a4a] w-full max-w-2/5 space-y-4"
      >
        {/* 📚 Номын нэр */}
        <div>
          <label className="block text-gray-300">Номын нэр</label>
          <input
            type="text"
            name="title"
            value={book.title}
            onChange={handleChange}
            placeholder="Номын нэр"
            className="w-full p-2 border h-10 border-[#4a4a4a] bg-[#1a1a1a] text-white rounded focus:outline-0"
            required
          />
        </div>

        {/* ✍️ Зохиолчийн нэр */}
        <div>
          <label className="block text-gray-300">Зохиолчийн нэр</label>
          <input
            type="text"
            name="author"
            value={book.author}
            onChange={handleChange}
            placeholder="Зохиолчийн нэр"
            className="w-full p-2 border h-10 border-[#4a4a4a] bg-[#1a1a1a] text-white rounded focus:outline-0"
            required
          />
        </div>

        {/* 📚 Номын төрөл */}
        <div>
          <label className="block text-gray-300">Номын төрөл</label>
          <select
            name="category"
            value={book.category}
            onChange={handleChange}
            className="w-full p-2 border h-10 border-[#4a4a4a] bg-[#1a1a1a] text-white rounded focus:outline-0"
            required
          >
            <option value="">Сонгох</option>
            <option value="science">Шинжлэх ухаан</option>
            <option value="literature">Уран зохиол</option>
            <option value="technology">Технологи</option>
            <option value="history">Түүх</option>
          </select>
        </div>

        {/* 🏷️ Номын төлөв */}
        <div>
          <label className="block text-gray-300">Номын төлөв</label>
          <select
            name="condition"
            value={book.condition}
            onChange={handleChange}
            className="w-full p-2 border h-10 border-[#4a4a4a] bg-[#1a1a1a] text-white rounded focus:outline-0"
            required
          >
            <option value="">Сонгох</option>
            <option value="шинэ">Шинэ</option>
            <option value="хэрэглэсэн">Хэрэглэсэн</option>
            <option value="хуучин">Хуучин</option>
          </select>
        </div>

        {/* 🔁 Үйлчилгээний төрөл */}
        <div>
          <label className="block text-gray-300">Үйлчилгээний төрөл</label>
          <select
            name="status"
            value={book.status}
            onChange={handleChange}
            className="w-full p-2 border h-10 border-[#4a4a4a] bg-[#1a1a1a] text-white rounded focus:outline-0"
          >
            <option value="Зарах">Зарах</option>
            <option value="Солилцох">Солилцох</option>
            <option value="Хандивлах">Хандивлах</option>
          </select>
        </div>

        {/* 💸 Үнэ (Зарах эсвэл Солилцох үед) */}
        {book.status !== "Хандивлах" && (
          <div>
            <label className="block text-gray-300">Үнэ (₮)</label>
            <input
              type="number"
              name="price"
              value={book.price}
              onChange={handleChange}
              placeholder="₮"
              className="w-full h-10 p-2 border border-[#4a4a4a] bg-[#1a1a1a] text-white rounded focus:outline-0"
              required={book.status !== "Хандивлах"}
            />
          </div>
        )}

        {/* 🖼️ Зураг сонгох хэсэг */}
        <div>
          <label className="block text-gray-300">Номын зураг</label>
          <label
            htmlFor="fileInput"
            className="h-10 cursor-pointer flex items-center justify-center w-full p-3 border border-[#4a4a4a] text-white rounded hover:bg-[#1a1a1a] transition duration-200"
          >
            Зураг сонгох
          </label>
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* 🌄 Урьдчилан харах зураг */}
        {previewUrl && (
          <div className="mt-4 flex justify-center">
            <img
              src={previewUrl}
              alt="Зураг харагдаж байна"
              className="w-40 h-40 rounded-lg border border-[#4a4a4a] shadow-md"
            />
          </div>
        )}

        {/* ✅ Ном нэмэх товч */}
        <button
          type="submit"
          className="w-full p-2 bg-[#4281db] text-white rounded hover:bg-[#3375cd] active:bg-[#0e69c3] transition duration-200"
        >
          Ном нэмэх
        </button>
      </form>

      {/* 🎉 Амжилтын мэдэгдэл */}
      {successMessage && (
        <div className="mt-6 bg-green-100 text-green-700 p-4 rounded-lg border border-green-500 w-full max-w-3xl">
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default Sell;
