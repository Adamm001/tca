"use client"; // Энэ зааврыг хамгийн эхэнд бичих хэрэгтэй

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
  getDoc,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { Dot, User as UserLucide } from "lucide-react";

// 📌 Номын өгөгдлийн интерфэйс
interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  imageUrl?: string;
}

// 📌 Хэрэглэгчийн мэдээллийн интерфэйс
interface UserInfo {
  name?: string;
  phone?: string;
  email?: string;
}

// 📌 Хүсэлтийн өгөгдлийн интерфэйс
interface Request {
  id: string;
  bookId: string;
  userId: string;
  status: "хүлээгдэж байна" | "баталгаажсан" | "цуцлагдсан";
  date: string;
}

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
const updateBookInFirestore = async (
  bookId: string,
  updatedData: Partial<Book>
) => {
  const bookRef = doc(db, "books", bookId);
  try {
    await updateDoc(bookRef, updatedData);
    console.log("Ном амжилттай шинэчлэгдлээ!");
  } catch (error) {
    console.error("Ном шинэчлэхэд алдаа гарлаа:", error);
  }
};

// 🔄 Номын нэрийг татах функц
const fetchBookTitle = async (bookId: string): Promise<string> => {
  try {
    const bookDoc = doc(db, "books", bookId);
    const bookSnapshot = await getDoc(bookDoc);
    if (bookSnapshot.exists()) {
      const bookData = bookSnapshot.data();
      return bookData.title || "Нэр олдсонгүй";
    }
    return "Ном олдсонгүй";
  } catch (error) {
    console.error("Номын нэр татахад алдаа гарлаа:", error);
    return "Алдаа гарлаа";
  }
};

const BookTitleCell: React.FC<{ bookId: string }> = ({ bookId }) => {
  const [title, setTitle] = useState<string>("Ачааллаж байна...");

  useEffect(() => {
    const fetchTitle = async () => {
      const fetchedTitle = await fetchBookTitle(bookId);
      setTitle(fetchedTitle);
    };
    fetchTitle();
  }, [bookId]);

  return <span>{title}</span>;
};

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userBooks, setUserBooks] = useState<Book[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null); // Хэрэглэгчийн нэмэлт мэдээлэл
  const [myRequests, setMyRequests] = useState<Request[]>([]); // Миний хүсэлтүүд

  // 📚 Firestore-с хэрэглэгчийн номыг татах функц
  const fetchUserBooks = async (userId: string) => {
    const q = query(collection(db, "books"), where("userId", "==", userId)); // userId-аар шүүх
    const querySnapshot = await getDocs(q);

    const books: Book[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Book, "id">),
    }));
    setUserBooks(books);
  };

  // 🔄 Firestore-с хэрэглэгчийн нэмэлт мэдээллийг татах
  const fetchUserInfo = async (uid: string) => {
    const userDoc = doc(db, "users", uid);
    const userSnapshot = await getDoc(userDoc);
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data() as UserInfo;
      setUserInfo(userData);
    }
  };

  // 🔄 Firestore-с миний хүсэлтүүдийг татах
  const fetchMyRequests = async (uid: string) => {
    try {
      const q = query(collection(db, "requests"), where("buyerId", "==", uid));
      const querySnapshot = await getDocs(q);

      const requests: Request[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Request, "id">),
      }));

      console.log("Миний хүсэлтүүд:", requests); // Хүсэлтүүдийг консолд хэвлэх
      setMyRequests(requests);
    } catch (error) {
      console.error("Миний хүсэлтүүдийг татахад алдаа гарлаа:", error);
    }
  };

  // 🔄 Firebase-аас хэрэглэгчийн мэдээллийг татах
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      // Хэрэв хэрэглэгч нэвтэрсэн бол тухайн хэрэглэгчийн ном болон хүсэлтийг татах
      if (currentUser?.email) {
        fetchUserBooks(currentUser.uid);
        fetchUserInfo(currentUser.uid);
        fetchMyRequests(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  // 📚 Ном засах функц
  const handleEditBook = async (bookId: string) => {
    const updatedData: Partial<Book> = {
      title: prompt("Шинэ номын нэр оруулна уу") || "",
    };
    if (updatedData.title) {
      await updateBookInFirestore(bookId, updatedData);
      fetchUserBooks(user?.uid || ""); // Шинэчлэгдсэн өгөгдлийг татах
    }
  };

  // 🗑️ Ном устгах функц
  const handleDeleteBook = async (bookId: string, imageUrl: string) => {
    await deleteBookFromFirestore(bookId, imageUrl);
    setUserBooks(userBooks.filter((book) => book.id !== bookId)); // UI-гаас хасах
  };

  // 🗑️ Хүсэлт цуцлах функц
  const handleCancelRequest = async (requestId: string) => {
    try {
      // Firestore-оос хүсэлтийг устгах
      await deleteDoc(doc(db, "requests", requestId));

      // UI-аас устгах
      setMyRequests((prev) =>
        prev.filter((request) => request.id !== requestId)
      );

      alert("Хүсэлт амжилттай цуцлагдлаа!");
    } catch (error) {
      console.error("Хүсэлт цуцлахад алдаа гарлаа:", error);
      alert("Хүсэлт цуцлахад алдаа гарлаа!");
    }
  };

  return (
    <div
      className="w-full h-screen flex flex-col items-center overflow-y-auto 
                [&::-webkit-scrollbar]:w-2 
                [&::-webkit-scrollbar-track]:bg-white
                [&::-webkit-scrollbar-thumb]:bg-black
                [&::-webkit-scrollbar-track]:rounded-full
                [&::-webkit-scrollbar-thumb]:rounded-full bg-[#1a1a1a] text-white p-5"
    >
      <div className="w-full">
        {user && userInfo ? (
          <div className="bg-[#252525] p-4 h-50 flex justify-between items-center  rounded-lg border border-[#2f2f2f]">
            <div className="flex items-center flex-1 gap-5">
              <UserLucide className="h-40 w-40 bg-[#1a1a1a] border border-[#2f2f2f] rounded-lg" />
              <div className="flex flex-col gap-2 h-full justify-center p-3 border-l-2 border-white">
                <p className="text-xl font-bold">Хэрэглэгчийн мэдээлэл</p>
                {userInfo.name && (
                  <p className="inline-flex  gap-2">
                    <Dot /> {userInfo.name}
                  </p>
                )}
                <p className="inline-flex  gap-2">
                  <Dot />
                  {user.email}
                </p>
                {userInfo.phone && (
                  <p className="inline-flex  gap-2">
                    <Dot />
                    {userInfo.phone}
                  </p>
                )}
              </div>
            </div>
            <div className="flex-1 bg-[#1a1a1a] h-full rounded-lg p-3">
              {/* 📋 Миний хүсэлтүүд */}
              <h3 className="text-lg font-semibold h-1/5 ">Миний хүсэлтүүд</h3>

              {myRequests.length === 0 ? (
                <p className="text-gray-400 h-4/5  bg-gray-600 rounded-lg p-2">
                  Таны гаргасан хүсэлт алга байна.
                </p>
              ) : (
                <div
                  className="space-y-4 h-4/5 rounded-lg overflow-y-scroll 
                [&::-webkit-scrollbar]:w-2 
                [&::-webkit-scrollbar-track]:bg-white
                [&::-webkit-scrollbar-thumb]:bg-black
                [&::-webkit-scrollbar-track]:rounded-full
                [&::-webkit-scrollbar-thumb]:rounded-full"
                >
                  <table className="w-full text-sm text-left bg-[#252525] rtl:text-righttext-gray-400">
                    <thead className="text-xs uppercase text-gray-400">
                      <tr>
                        <th className="px-6 py-3">Номын нэр</th>
                        <th className=" px-6 py-3">Төлөв</th>
                        <th className="px-6 py-3">Огноо</th>
                        <th className="px-6 py-3">Үйлдэл</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myRequests.map((request) => (
                        <tr
                          key={request.id}
                          className=" border-b border-gray-700 hover:bg-gray-600"
                        >
                          <td className="px-6 py-4">
                            {/* Номын нэрийг fetchBookTitle функцээр татах */}
                            <BookTitleCell bookId={request.bookId} />
                          </td>
                          <td className="px-6">{request.status}</td>
                          <td>
                            {new Date(request.date).toLocaleDateString("mn-MN")}
                          </td>
                          <td className="px-6">
                            <button
                              onClick={() => handleCancelRequest(request.id)} // Цуцлах функц дуудах
                              className="h-10 px-4  bg-[#4d302b] text-white rounded-lg cursor-pointer"
                            >
                              Цуцлах
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-gray-400">Нэвтэрсэн хэрэглэгч алга!</div>
        )}

        {/* 📚 Миний нийтэлсэн номнууд */}
        <h3 className="text-xl font-semibold mb-4">Миний нийтэлсэн номнууд</h3>

        {userBooks.length === 0 ? (
          <p className="text-gray-400">Та одоогоор ном нэмээгүй байна.</p>
        ) : (
          <div className="grid grid-cols-6 gap-6">
            {userBooks.map((book) => (
              <ProfileBookCard
                key={book.id}
                id={parseInt(book.id, 10)}
                title={book.title}
                author={book.author}
                price={book.price}
                imageUrl={book.imageUrl || "/images/book.png"}
                onEdit={() => handleEditBook(book.id)}
                onDelete={() => handleDeleteBook(book.id, book.imageUrl || "")}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
