"use client";
import BookCard from "@/components/bookCard";
import React, { useEffect, useState } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { auth, db } from "@/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  category: string;
  imageUrl?: string;
  status: string;
  userId: string; // Хэрэглэгчийн ID-г хадгалах
}

// Firestore-с ном унших функц
const getBooksFromFirestore = async (): Promise<Book[]> => {
  const querySnapshot = await getDocs(collection(db, "books"));
  const books: Book[] = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Book, "id">),
  }));
  return books;
};

const Container = () => {
  const [books, setBooks] = useState<Book[]>([]); // Firestore-оос татах тул анх хоосон массив
  const [selectedBook, setSelectedBook] = useState<Book | null>(null); // Сонгосон номын мэдээлэл
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal-ийн төлөв
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); // Одоогийн хэрэглэгчийн ID

  // Firebase Authentication-аас одоогийн хэрэглэгчийн ID-г авах
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid); // Хэрэглэгчийн ID-г хадгалах
      } else {
        setCurrentUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Номын дэлгэрэнгүй харах товчийг дарах үед ажиллах функц
  const handleViewDetails = (book: Book) => {
    setSelectedBook(book);
    setIsModalOpen(true); // Modal-ийг нээх
  };

  // Modal-ийг хаах функц
  const handleCloseModal = () => {
    setSelectedBook(null);
    setIsModalOpen(false);
  };

  // Авах хүсэлт илгээх функц
  const handleSendRequest = async () => {
    if (!selectedBook || !currentUserId) return;

    try {
      await addDoc(collection(db, "requests"), {
        bookId: selectedBook.id,
        buyerId: currentUserId, // Одоогийн хэрэглэгчийн ID-г buyerId болгон хадгалах
        userId: selectedBook.userId, // Номын эзний ID-г хадгалах
        status: "хүлээгдэж байна",
        date: new Date().toISOString(),
        type: "Зарах", // Хүсэлтийн төрөл
      });
      alert("Хүсэлт амжилттай илгээгдлээ!");
      handleCloseModal(); // Modal-ийг хаах
    } catch (error) {
      console.error("Хүсэлт илгээхэд алдаа гарлаа:", error);
    }
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
      <h1 className="text-3xl font-bold mb-6 text-center">Зарах Номнууд</h1>

      {/* Ном байхгүй үед харагдах хэсэг */}
      {books.length === 0 ? (
        <div className="text-center text-gray-400 text-lg">Ном олдсонгүй.</div>
      ) : (
        <div className="w-full gap-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {books.map(
            (book) =>
              book.status === "Зарах" &&
              book.userId !== currentUserId && (
                <BookCard
                  key={book.id}
                  title={book.title}
                  author={book.author}
                  price={book.price}
                  imageUrl={book.imageUrl || "/images/book-placeholder.png"}
                  onClick={() => handleViewDetails(book)}
                />
              )
          )}
        </div>
      )}

      {/* Modal хэсэг */}
      {isModalOpen && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#252525] p-6 rounded-lg w-110 text-white flex flex-col ">
            <h2 className="text-3xl font-bold mb-4 uppercase">
              {selectedBook.title}
            </h2>
            <p className="ml-4 mb-2 bg-[#]">
              <strong>Зохиолч:</strong> {selectedBook.author}
            </p>
            <p className="ml-4 mb-2">
              <strong>Төрөл:</strong> {selectedBook.category}
            </p>
            <p className="ml-4 mb-2">
              <strong>Төлөв:</strong> {selectedBook.status}
            </p>
            <p className="ml-4 mb-4 text-xl">
              <strong>Үнэ:</strong> {selectedBook.price.toLocaleString()}₮
            </p>
            <div className="flex justify-end gap-3 w-full">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
              >
                Хаах
              </button>
              <button
                onClick={handleSendRequest}
                className="px-4 py-2 bg-[#1e394c] rounded"
              >
                Хүсэлт илгээх
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Container;
