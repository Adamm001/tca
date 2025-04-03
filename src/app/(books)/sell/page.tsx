"use client";
import React, { useState, useEffect } from "react";
import { addDoc, collection } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/firebaseConfig";
import { auth } from "@/firebaseConfig"; // Import the auth object
import { onAuthStateChanged, User } from "firebase/auth"; // Import necessary Firebase Auth functions
import Image from "next/image";

interface Book {
  title: string;
  author: string;
  category: string;
  price: string;
  condition: string;
  status: string;
  imageUrl: string;
  createdAt?: Date; // Optional createdAt property
  email?: string; // Optional email property
}

const Sell = () => {
  const [book, setBook] = useState<Book>({
    title: "",
    author: "",
    category: "",
    price: "",
    condition: "",
    status: "Зарах", // Default value
    imageUrl: "", // New image placeholder
  });

  const [image, setImage] = useState<File | null>(null); // Image file state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // Image preview URL

  const [currentUser, setCurrentUser] = useState<User | null>(null); // State to hold the current user's information

  // Fetch current user data from Firebase Authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  // Upload image to Firebase Storage
  const uploadImageToStorage = async (file: File): Promise<string> => {
    const storageRef = ref(storage, `bookImages/${Date.now()}_${file.name}`);
    try {
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(uploadResult.ref);
      return downloadUrl;
    } catch (error) {
      console.error("Image upload failed:", error);
      return "";
    }
  };

  // Add book to Firestore
  const addBookToFirestore = async (book: Book) => {
    try {
      await addDoc(collection(db, "books"), book);
      console.log("Book added successfully!");
    } catch (error) {
      console.error("Error adding book:", error);
    }
  };

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setBook({ ...book, [e.target.name]: e.target.value });
  };

  // Handle image selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setImage(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile)); // Set image preview
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let uploadedImageUrl = "/images/book-placeholder.png"; // Default image
    if (image) {
      uploadedImageUrl = await uploadImageToStorage(image);
    }

    if (!uploadedImageUrl) {
      console.error("Image upload failed!");
      return;
    }

    // Create a new book object with email and other details
    const newBook: Book = {
      ...book,
      imageUrl: uploadedImageUrl,
      createdAt: new Date(),
      email: currentUser?.email || "", // Add current user's email
    };

    // Save the book to Firestore
    await addBookToFirestore(newBook);
    setSuccessMessage(`"${newBook.title}" has been added successfully!`);

    // Reset the form
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

      <form
        onSubmit={handleSubmit}
        className="bg-[#252525] p-6 rounded-lg border border-[#4a4a4a] w-full max-w-2/5 space-y-4"
      >
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

        <div>
          <label className="block text-gray-300">Зохиолч</label>
          <input
            type="text"
            name="author"
            value={book.author}
            onChange={handleChange}
            placeholder="Зохиолч"
            className="w-full p-2 border h-10 border-[#4a4a4a] bg-[#1a1a1a] text-white rounded focus:outline-0"
            required
          />
        </div>

        <div>
          <label className="block text-gray-300">Төрөл</label>
          <select
            name="category"
            value={book.category}
            onChange={handleChange}
            className="w-full p-2 border h-10 border-[#4a4a4a] bg-[#1a1a1a] text-white rounded focus:outline-0"
            required
          >
            <option value="">Сонгох</option>
            <option value="science">Science</option>
            <option value="literature">Literature</option>
            <option value="technology">Technology</option>
            <option value="history">History</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-300">Шинэ, Хуучин эсэх</label>
          <select
            name="condition"
            value={book.condition}
            onChange={handleChange}
            className="w-full p-2 border h-10 border-[#4a4a4a] bg-[#1a1a1a] text-white rounded focus:outline-0"
            required
          >
            <option value="">Сонгох</option>
            <option value="шинэ">Шинэ</option>
            <option value="хэрэглэсэн">хэрэглэсэн</option>
            <option value="хуучин">Хуучин</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-300">Статус</label>
          <select
            name="status"
            value={book.status}
            onChange={handleChange}
            className="w-full p-2 border h-10 border-[#4a4a4a] bg-[#1a1a1a] text-white rounded focus:outline-0"
          >
            <option value="Зарах">Зарах</option>
            <option value="Солилцох">Солих</option>
            <option value="Хандивлах">Хандивлах</option>
          </select>
        </div>

        {book.status !== "Хандивлах" && book.status !== "Солилцох" && (
          <div>
            <label className="block text-gray-300">Үнэ (₮)</label>
            <input
              type="number"
              name="price"
              value={book.price}
              onChange={handleChange}
              placeholder="₮"
              className="w-full h-10 p-2 border border-[#4a4a4a] bg-[#1a1a1a] text-white rounded focus:outline-0"
              required
            />
          </div>
        )}

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

        {previewUrl && (
          <div className="mt-4 flex justify-center">
            <Image
              height={1000}
              width={1000}
              src={previewUrl}
              alt="Preview Image"
              className="w-40 h-40 rounded-lg border border-[#4a4a4a] shadow-md"
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full h-10 p-2 bg-[#4281db] text-white rounded hover:bg-[#3375cd] active:bg-[#0e69c3] transition duration-200"
        >
          Ном нэмэх
        </button>
      </form>

      {successMessage && (
        <div className="mt-6 bg-green-100 text-green-700 p-4 rounded-lg border border-green-500 w-full max-w-3xl">
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default Sell;
