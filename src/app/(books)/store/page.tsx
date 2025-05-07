"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { getAuth } from "firebase/auth"; // Firebase Authentication ашиглах
import Image from "next/image";
import likeTree from "../../../../public/images/LikeTree.png";

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
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [showModal, setShowModal] = useState(false); // Modal харуулах төлөв

  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid; // Одоогийн хэрэглэгчийн ID

  // Firestore-оос номын нэрийг татах
  const fetchBookTitles = useCallback(async (bookIds: string[]) => {
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
  }, []);

  // Firestore-оос хэрэглэгчийн нэрийг татах
  const fetchUserNames = useCallback(async (userIds: string[]) => {
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
  }, []);

  // Firestore-оос зөвхөн "баталгаажсан" хүсэлтүүдийг татах
  const getRequestsFromFirestore = useCallback(async () => {
    if (!currentUserId) return;

    const querySnapshot = await getDocs(collection(db, "requests"));
    const requests = querySnapshot.docs.map((doc) => ({
      ...(doc.data() as Request),
      id: doc.id,
      status: doc.data().status as
        | "хүлээгдэж байна"
        | "баталгаажсан"
        | "цуцлагдсан",
    })) as Request[];

    // Зөвхөн одоогийн хэрэглэгчийн `buyerId`-тай таарч байгаа хүсэлтүүдийг шүүх
    const userRequests = requests.filter(
      (req) => req.buyerId === currentUserId && req.status === "баталгаажсан"
    );

    // Хүсэлтүүдийг төрөлөөр нь ялгах
    const purchase = userRequests.filter((req) => req.type === "Зарах");
    const exchange = userRequests.filter((req) => req.type === "Солилцох");
    const donation = userRequests.filter((req) => req.type === "Хандив");

    setPurchaseRequests(purchase);
    setExchangeRequests(exchange);
    setDonationRequests(donation);

    // Номын ID болон хэрэглэгчийн ID-уудыг цуглуулах
    const bookIds = Array.from(
      new Set(userRequests.map((req) => req.bookId).filter((id) => id))
    );
    const userIds = Array.from(
      new Set(
        userRequests
          .map((req) => [req.buyerId, req.userId])
          .flat()
          .filter((id) => id)
      )
    );

    await fetchBookTitles(bookIds); // Номын нэрийг татах
    await fetchUserNames(userIds); // Хэрэглэгчийн нэрийг татах
  }, [fetchBookTitles, fetchUserNames, currentUserId]);

  useEffect(() => {
    getRequestsFromFirestore();
  }, [getRequestsFromFirestore]);

  // Хүлээж авсан номыг "receivedBooks" хүснэгтэнд хадгалах ба "requests" хүснэгтээс устгах функц
  const handleMarkAsReceived = async (request: Request) => {
    const requestRef = doc(db, "requests", request.id);

    // "receivedBooks" хүснэгтэнд нэмэх
    await addDoc(collection(db, "receivedBooks"), {
      bookId: request.bookId,
      userId: request.userId,
      buyerId: request.buyerId,
      date: new Date().toISOString(),
      type: request.type,
    });

    // "requests" хүснэгтээс устгах
    await deleteDoc(requestRef);

    // UI-г шинэчлэх
    setPurchaseRequests((prev) => prev.filter((req) => req.id !== request.id));
    setExchangeRequests((prev) => prev.filter((req) => req.id !== request.id));
    setDonationRequests((prev) => prev.filter((req) => req.id !== request.id));

    // Modal харуулах
    setShowModal(true);
  };

  // Хүсэлтийн хүснэгт харуулах функц
  const renderRequestsTable = (requests: Request[], title: string) => (
    <div className="bg-[#252525] p-6 rounded-lg border border-[#2f2f2f] shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
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
                <td className="p-3 border-b border-[#2f2f2f]">
                  <button
                    className="p-2 bg-[#4d90fe] text-white rounded transition cursor-pointer hover:bg-[#357ae8]"
                    onClick={() => handleMarkAsReceived(request)}
                  >
                    Хүлээж авсан
                  </button>
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
        {renderRequestsTable(purchaseRequests, "Худалдаж авах номнууд")}
        {renderRequestsTable(exchangeRequests, "Солилцох хүсэлт")}
        {renderRequestsTable(donationRequests, "Хандивлах хүсэлт")}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-[#252525] p-6 h-120 flex flex-col justify-between items-center w-100 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Баярлалаа!</h2>
            <p className="text-lg">
              Ном солилцсон таньд <br />
              Байгаль <span className="bg-blue-500 p-2 rounded">Like</span>{" "}
              дарлаа!
            </p>
            <Image
              width={1000}
              height={1000}
              src={likeTree}
              alt="zurag"
              className="h-50 w-50"
            />
            <button
              className="mt-4 px-5 py-2 bg-[#6d7f38] text-white rounded "
              onClick={() => setShowModal(false)}
            >
              Хаах
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Store;
