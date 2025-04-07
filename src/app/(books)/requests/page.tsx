"use client";
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "@/firebaseConfig";

// Хүсэлтийн төрлийн interface
interface Request {
  id: string;
  type: "Зарах" | "Солилцох" | "Хандив";
  bookId: string;
  buyerId: string;
  userId: string;
  status: "хүлээгдэж байна" | "баталгаажсан" | "цуцлагдсан";
  date: string;
}

// Номын өгөгдлийн интерфэйс
interface Book {
  id: string;
  title: string;
}

const Requests = () => {
  const [purchaseRequests, setPurchaseRequests] = useState<Request[]>([]);
  const [exchangeRequests, setExchangeRequests] = useState<Request[]>([]);
  const [donationRequests, setDonationRequests] = useState<Request[]>([]);
  const [bookTitles, setBookTitles] = useState<Record<string, string>>({});
  const [userNames, setUserNames] = useState<Record<string, string>>({}); // Хэрэглэгчийн ID болон нэрийг хадгалах

  // Firestore-оос бүх хүсэлтийг татах
  const getRequestsFromFirestore = async () => {
    const querySnapshot = await getDocs(collection(db, "requests"));
    const requests = querySnapshot.docs.map((doc) => ({
      ...(doc.data() as Request),
      id: doc.id,
      status: doc.data().status as
        | "хүлээгдэж байна"
        | "баталгаажсан"
        | "цуцлагдсан",
    })) as Request[];

    // Хүсэлтүүдийг төрөлөөр нь ялгах
    const purchase = requests.filter((req) => req.type === "Зарах");
    const exchange = requests.filter((req) => req.type === "Солилцох");
    const donation = requests.filter((req) => req.type === "Хандив");

    setPurchaseRequests(purchase);
    setExchangeRequests(exchange);
    setDonationRequests(donation);

    // Номын ID болон хэрэглэгчийн ID-уудыг цуглуулах
    const bookIds = Array.from(
      new Set(requests.map((req) => req.bookId).filter((id) => id))
    );
    const userIds = Array.from(
      new Set(
        requests
          .map((req) => [req.buyerId, req.userId])
          .flat()
          .filter((id) => id)
      )
    );

    await fetchBookTitles(bookIds); // Номын нэрийг татах
    await fetchUserNames(userIds); // Хэрэглэгчийн нэрийг татах
  };

  // Firestore-оос номын нэрийг татах
  const fetchBookTitles = async (bookIds: string[]) => {
    const titles: Record<string, string> = {};

    const promises = bookIds.map(async (bookId) => {
      const bookDoc = await getDoc(doc(db, "books", bookId));
      if (bookDoc.exists()) {
        titles[bookId] = bookDoc.data().title;
      } else {
        titles[bookId] = "Нэр олдсонгүй";
      }
    });

    await Promise.all(promises);
    setBookTitles(titles);
  };

  // Firestore-оос хэрэглэгчийн нэрийг татах
  const fetchUserNames = async (userIds: string[]) => {
    const names: Record<string, string> = {};

    const promises = userIds.map(async (userId) => {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        names[userId] = userDoc.data().name;
      } else {
        names[userId] = "Нэр олдсонгүй";
      }
    });

    await Promise.all(promises);
    setUserNames(names);
  };

  const currentUserId = auth.currentUser?.uid;
  // Захиалгын төлөв өөрчлөх функц
  const handleUpdateStatus = async (
    id: string,
    newStatus: "хүлээгдэж байна" | "баталгаажсан" | "цуцлагдсан",
    type: "Зарах" | "Солилцох" | "Хандив"
  ) => {
    const requestRef = doc(db, "requests", id);
    await updateDoc(requestRef, { status: newStatus });

    if (!currentUserId) {
      console.error("Хэрэглэгчийн ID олдсонгүй!");
      return;
    }

    if (type === "Зарах") {
      const updatedRequests = purchaseRequests.map((req) =>
        req.id === id && req.userId === currentUserId
          ? { ...req, status: newStatus }
          : req
      );
      setPurchaseRequests(updatedRequests);
    } else if (type === "Солилцох") {
      const updatedRequests = exchangeRequests.map((req) =>
        req.id === id && req.userId === currentUserId
          ? { ...req, status: newStatus }
          : req
      );
      setExchangeRequests(updatedRequests);
    } else if (type === "Хандив") {
      const updatedRequests = donationRequests.map((req) =>
        req.id === id && req.userId === currentUserId
          ? { ...req, status: newStatus }
          : req
      );
      setDonationRequests(updatedRequests);
    }
  };

  // Цуцлагдсан хүсэлтүүдийг устгах функц
  const deleteCancelledRequests = async () => {
    try {
      const allRequests = [
        ...purchaseRequests,
        ...exchangeRequests,
        ...donationRequests,
      ];
      const cancelledRequests = allRequests.filter(
        (req) => req.status === "цуцлагдсан" && req.userId === currentUserId
      );

      const deletePromises = cancelledRequests.map((req) =>
        deleteDoc(doc(db, "requests", req.id))
      );

      await Promise.all(deletePromises);

      // Цуцлагдсан хүсэлтүүдийг UI-аас хасах
      setPurchaseRequests((prev) =>
        prev.filter((req) => req.status !== "цуцлагдсан")
      );
      setExchangeRequests((prev) =>
        prev.filter((req) => req.status !== "цуцлагдсан")
      );
      setDonationRequests((prev) =>
        prev.filter((req) => req.status !== "цуцлагдсан")
      );

      alert("Цуцлагдсан хүсэлтүүд амжилттай устгагдлаа!");
    } catch (error) {
      console.error("Цуцлагдсан хүсэлтүүдийг устгахад алдаа гарлаа:", error);
    }
  };

  useEffect(() => {
    getRequestsFromFirestore();
  }, []);

  // Хүсэлтийн хүснэгт харуулах функц
  const renderRequestsTable = (
    requests: Request[],
    type: "Зарах" | "Солилцох" | "Хандив"
  ) => (
    <div className="bg-[#252525] p-6 rounded-lg border border-[#2f2f2f] shadow-lg">
      {requests.length === 0 ? (
        <div className="text-center text-gray-400 text-lg">
          Одоогоор хүсэлт байхгүй.
        </div>
      ) : (
        <table className="w-full table-auto text-left text-sm">
          <thead className="bg-[#333333] text-gray-300">
            <tr>
              <th className="p-3">Номын нэр</th>
              <th className="p-3">Номны эзэн</th>
              <th className="p-3">Худалдан авагч</th>
              <th className="p-3">Огноо</th>
              <th className="p-3">Төлөв</th>
              <th className="p-3">Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(
              (request) =>
                request.userId === currentUserId && (
                  <tr
                    key={request.id}
                    className="hover:bg-[#2f2f2f] transition-colors"
                  >
                    <td className="p-3 border-b border-[#2f2f2f]">
                      {bookTitles[request.bookId] || "Ачааллаж байна..."}
                    </td>
                    <td className="p-3 border-b border-[#2f2f2f]">
                      {userNames[request.userId] || "Ачааллаж байна..."}
                    </td>
                    <td className="p-3 border-b border-[#2f2f2f]">
                      {userNames[request.buyerId] || "Ачааллаж байна..."}
                    </td>
                    <td className="p-3 border-b border-[#2f2f2f]">
                      {new Date(request.date).toLocaleDateString("mn-MN")}
                    </td>
                    <td
                      className={`p-3 border-b border-[#2f2f2f] ${
                        request.status === "хүлээгдэж байна"
                          ? "text-[#c29a59]"
                          : request.status === "баталгаажсан"
                          ? "text-[#659c75]"
                          : "text-[#cf5d57]"
                      }`}
                    >
                      {request.status}
                    </td>
                    <td className="p-3 border-b border-[#2f2f2f]">
                      {request.status === "хүлээгдэж байна" && (
                        <div className="flex space-x-2">
                          <button
                            className="p-2 bg-[#2a3c31] text-white rounded transition cursor-pointer"
                            onClick={() =>
                              handleUpdateStatus(
                                request.id,
                                "баталгаажсан",
                                type
                              )
                            }
                          >
                            Баталгаажуулах
                          </button>
                          <button
                            className="p-2 bg-[#4d302b] text-white rounded transition cursor-pointer"
                            onClick={() =>
                              handleUpdateStatus(request.id, "цуцлагдсан", type)
                            }
                          >
                            Цуцлах
                          </button>
                        </div>
                      )}
                      {request.status !== "хүлээгдэж байна" && (
                        <span className="text-gray-400">Дууссан</span>
                      )}
                    </td>
                  </tr>
                )
            )}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="w-full h-screen flex flex-col items-center overflow-y-auto text-white p-5">
      <h1 className="text-3xl font-bold mb-6 text-center">Хүсэлтүүд</h1>

      <div className="w-full max-w-4xl mx-auto space-y-10">
        {/* Худалдаж авах хүсэлт */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Худалдаж авах хүсэлт</h2>
          {renderRequestsTable(purchaseRequests, "Зарах")}
        </div>

        {/* Солилцох хүсэлт */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Солилцох хүсэлт</h2>
          {renderRequestsTable(exchangeRequests, "Солилцох")}
        </div>

        {/* Хандивлах хүсэлт */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Хандивлах хүсэлт</h2>
          {renderRequestsTable(donationRequests, "Хандив")}
        </div>

        {/* Цуцлагдсан хүсэлтүүдийг устгах товч */}
        <div className="mt-10">
          <button
            onClick={deleteCancelledRequests}
            className="px-4 py-2 bg-[#4d302b] cursor-pointer text-white rounded"
          >
            Цуцлагдсан хүсэлтүүдийг устгах
          </button>
        </div>
      </div>
    </div>
  );
};

export default Requests;
