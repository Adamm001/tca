"use client";
import React, { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebaseConfig";

// Хүсэлтийн төрлийн interface
interface Request {
  id: string;
  type: "purchase" | "exchange" | "donation"; // Added donation type
  bookId: string; // bookTitle-ийг bookId болгосон
  buyerId: string; // Buyer ID нэмсэн
  requester: string;
  status: "хүлээгдэж байна" | "баталгаажсан" | "цуцлагдсан";
  date: string;
}

const Requests = () => {
  const [purchaseRequests, setPurchaseRequests] = useState<Request[]>([]);
  const [exchangeRequests, setExchangeRequests] = useState<Request[]>([]);
  const [donationRequests, setDonationRequests] = useState<Request[]>([]); // State for donation requests

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
    const purchase = requests.filter((req) => req.type === "purchase");
    const exchange = requests.filter((req) => req.type === "exchange");
    const donation = requests.filter((req) => req.type === "donation"); // Added donation filter

    setPurchaseRequests(purchase);
    setExchangeRequests(exchange);
    setDonationRequests(donation); // Store donation requests
  };

  // Захиалгын төлөв өөрчлөх функц
  const handleUpdateStatus = async (
    id: string,
    newStatus: "хүлээгдэж байна" | "баталгаажсан" | "цуцлагдсан",
    type: "purchase" | "exchange" | "donation" // Include donation type
  ) => {
    const requestRef = doc(db, "requests", id);
    await updateDoc(requestRef, { status: newStatus });

    if (type === "purchase") {
      const updatedRequests = purchaseRequests.map((req) =>
        req.id === id ? { ...req, status: newStatus } : req
      );
      setPurchaseRequests(updatedRequests);
    } else if (type === "exchange") {
      const updatedRequests = exchangeRequests.map((req) =>
        req.id === id ? { ...req, status: newStatus } : req
      );
      setExchangeRequests(updatedRequests);
    } else if (type === "donation") {
      const updatedRequests = donationRequests.map((req) =>
        req.id === id ? { ...req, status: newStatus } : req
      );
      setDonationRequests(updatedRequests); // Update donation requests
    }
  };

  useEffect(() => {
    getRequestsFromFirestore();
  }, []);

  // Хүсэлтийн хүснэгт харуулах функц
  const renderRequestsTable = (
    requests: Request[],
    type: "purchase" | "exchange" | "donation" // Handle donation type
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
              <th className="p-3">Номын ID</th>
              <th className="p-3">Захиалагч</th>
              <th className="p-3">Худалдан авагч ID</th>
              <th className="p-3">Огноо</th>
              <th className="p-3">Төлөв</th>
              <th className="p-3">Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr
                key={request.id}
                className="hover:bg-[#2f2f2f] transition-colors"
              >
                <td className="p-3 border-b border-[#2f2f2f]">
                  {request.bookId}
                </td>
                <td className="p-3 border-b border-[#2f2f2f]">
                  {request.requester}
                </td>
                <td className="p-3 border-b border-[#2f2f2f]">
                  {request.buyerId}
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
                          handleUpdateStatus(request.id, "баталгаажсан", type)
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
            ))}
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
          {renderRequestsTable(purchaseRequests, "purchase")}
        </div>

        {/* Солилцох хүсэлт */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Солилцох хүсэлт</h2>
          {renderRequestsTable(exchangeRequests, "exchange")}
        </div>

        {/* Хандивлах хүсэлт */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Хандивлах хүсэлт</h2>
          {renderRequestsTable(donationRequests, "donation")}{" "}
          {/* Render donation requests */}
        </div>
      </div>
    </div>
  );
};

export default Requests;
