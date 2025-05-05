"use client";
import React, { useEffect, useState, useCallback } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";

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

const Store = () => {
  const [purchaseRequests, setPurchaseRequests] = useState<Request[]>([]);
  const [exchangeRequests, setExchangeRequests] = useState<Request[]>([]);
  const [donationRequests, setDonationRequests] = useState<Request[]>([]);
  const [bookTitles, setBookTitles] = useState<Record<string, string>>({});
  const [userNames, setUserNames] = useState<Record<string, string>>({}); // Хэрэглэгчийн ID болон нэрийг хадгалах

  // Firestore-оос номын нэрийг татах
  const fetchBookTitles = useCallback(
    async (bookIds: string[]) => {
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
    },
    [db]
  );

  // Firestore-оос хэрэглэгчийн нэрийг татах
  const fetchUserNames = useCallback(
    async (userIds: string[]) => {
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
    },
    [db]
  );

  // Firestore-оос зөвхөн "баталгаажсан" хүсэлтүүдийг татах
  const getRequestsFromFirestore = useCallback(async () => {
    const querySnapshot = await getDocs(collection(db, "requests"));
    const requests = querySnapshot.docs.map((doc) => ({
      ...(doc.data() as Request),
      id: doc.id,
      status: doc.data().status as
        | "хүлээгдэж байна"
        | "баталгаажсан"
        | "цуцлагдсан",
    })) as Request[];

    // Зөвхөн баталгаажсан хүсэлтүүдийг шүүх
    const approvedRequests = requests.filter(
      (req) => req.status === "баталгаажсан"
    );

    // Хүсэлтүүдийг төрөлөөр нь ялгах
    const purchase = approvedRequests.filter((req) => req.type === "Зарах");
    const exchange = approvedRequests.filter((req) => req.type === "Солилцох");
    const donation = approvedRequests.filter((req) => req.type === "Хандив");

    setPurchaseRequests(purchase);
    setExchangeRequests(exchange);
    setDonationRequests(donation);

    // Номын ID болон хэрэглэгчийн ID-уудыг цуглуулах
    const bookIds = Array.from(
      new Set(approvedRequests.map((req) => req.bookId).filter((id) => id))
    );
    const userIds = Array.from(
      new Set(
        approvedRequests
          .map((req) => [req.buyerId, req.userId])
          .flat()
          .filter((id) => id)
      )
    );

    await fetchBookTitles(bookIds); // Номын нэрийг татах
    await fetchUserNames(userIds); // Хэрэглэгчийн нэрийг татах
  }, [db, fetchBookTitles, fetchUserNames]);

  useEffect(() => {
    getRequestsFromFirestore();
  }, [getRequestsFromFirestore]);

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
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
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
                <td className="p-3 border-b border-[#2f2f2f] text-[#659c75]">
                  Хүргэлтэнд удахгүй гарна
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
      <h1 className="text-3xl font-bold mb-6 text-center">Захиалга</h1>

      <div className="w-full max-w-4xl mx-auto space-y-10">
        {/* Худалдаж авах хүсэлт */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Худалдаж авах номнууд</h2>
          {renderRequestsTable(purchaseRequests, "Зарах")}
        </div>

        {/* Солилцох хүсэлт */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Солилцож авах номнууд</h2>
          {renderRequestsTable(exchangeRequests, "Солилцох")}
        </div>

        {/* Хандивлах хүсэлт */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Хандиваар авах номнууд
          </h2>
          {renderRequestsTable(donationRequests, "Хандив")}
        </div>
      </div>
    </div>
  );
};

export default Store;
