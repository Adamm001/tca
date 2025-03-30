"use client";
import React, { useEffect, useState } from "react";
import { auth, db, storage } from "@/firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import ProfileBookCard from "@/components/profileBookCard";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";

// 📚 Ном устгах функц
const deleteBookFromFirestore = async (bookId: string, imageUrl: string) => {
  const bookRef = doc(db, "books", bookId);
  try {
    // Ном устгах
    await deleteDoc(bookRef);

    // Зураг устгах (хэрэв зураг байгаа бол)
    if (imageUrl) {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    }

    console.log("Ном амжилттай устгагдлаа!");
  } catch (error) {
    console.error("Ном устгахад алдаа гарлаа:", error);
  }
};

// ✏️ Ном засах функц
const updateBookInFirestore = async (bookId: string, updatedData: any) => {
  const bookRef = doc(db, "books", bookId);
  try {
    await updateDoc(bookRef, updatedData);
    console.log("Ном амжилттай шинэчлэгдлээ!");
  } catch (error) {
    console.error("Ном шинэчлэхэд алдаа гарлаа:", error);
  }
};

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userBooks, setUserBooks] = useState<any[]>([]);

  // 📚 Firestore-с хэрэглэгчийн номыг татах функц
  const fetchUserBooks = async (email: string) => {
    const q = query(collection(db, "books"), where("email", "==", email));
    const querySnapshot = await getDocs(q);

    const books = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setUserBooks(books);
  };

  // 🔄 Firebase-аас хэрэглэгчийн мэдээллийг татах
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      // Хэрэв хэрэглэгч нэвтэрсэн бол тухайн хэрэглэгчийн номыг татах
      if (currentUser?.email) {
        fetchUserBooks(currentUser.email);
      }
    });

    return () => unsubscribe();
  }, []);

  // 📚 Ном засах функц
  const handleEditBook = async (bookId: string) => {
    const updatedData = {
      title: prompt("Шинэ номын нэр оруулна уу") || "",
    };
    if (updatedData.title) {
      await updateBookInFirestore(bookId, updatedData);
      fetchUserBooks(user?.email || ""); // Шинэчлэгдсэн өгөгдлийг татах
    }
  };

  // 🗑️ Ном устгах функц
  const handleDeleteBook = async (bookId: string, imageUrl: string) => {
    await deleteBookFromFirestore(bookId, imageUrl);
    setUserBooks(userBooks.filter((book) => book.id !== bookId)); // UI-гаас хасах
  };

  return (
    <div className="w-full min-h-screen bg-[#1a1a1a] text-white p-5">
      <div className="max-w-3xl mx-auto">
        {/* 👤 Хувийн мэдээлэл */}
        <h2 className="text-3xl font-bold mb-6">👤 Хувийн мэдээлэл</h2>
        {user ? (
          <div className="bg-[#252525] p-4 rounded-lg border border-[#2f2f2f] mb-8">
            <p className="text-lg">
              <strong>И-мэйл:</strong> {user.email}
            </p>
            {user.displayName && (
              <p className="text-lg">
                <strong>Нэр:</strong> {user.displayName}
              </p>
            )}
          </div>
        ) : (
          <div className="text-gray-400">Нэвтэрсэн хэрэглэгч алга!</div>
        )}

        {/* 📚 Миний нийтэлсэн номнууд */}
        <h3 className="text-2xl font-semibold mb-4">
          📚 Миний нийтэлсэн номнууд
        </h3>

        {userBooks.length === 0 ? (
          <p className="text-gray-400">Та одоогоор ном нэмээгүй байна.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {userBooks.map((book) => (
              <ProfileBookCard
                key={book.id}
                id={book.id}
                title={book.title}
                author={book.author}
                price={book.price}
                condition={book.condition as "шинэ" | "хэрэглэсэн" | "хуучин"}
                imageUrl={book.imageUrl || "/images/book.png"}
                onEdit={() => handleEditBook(book.id)}
                onDelete={() => handleDeleteBook(book.id, book.imageUrl)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
