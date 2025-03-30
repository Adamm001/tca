"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";

// Хэрэглэгчийн жагсаалт (Dummy data)
const users = [
  { id: 1, name: "Баттулга" },
  { id: 2, name: "Сарангэрэл" },
  { id: 3, name: "Энхболд" },
  { id: 4, name: "Мөнх-Эрдэнэ" },
  { id: 5, name: "Төгсөө" },
];

const Chats = () => {
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Хэрэглэгч сонгох үед мессежийг татах
  useEffect(() => {
    if (selectedUser === null) return;

    const q = query(
      collection(db, "messages"),
      where("userId", "in", [selectedUser, "me"]),
      orderBy("createdAt", "asc")
    );

    // Realtime мессеж татах
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(loadedMessages);
    });

    return () => unsubscribe();
  }, [selectedUser]);

  // Мессежний доош гүйлгэх
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Хэрэглэгч сонгох
  const handleUserSelect = (userId: number) => {
    setSelectedUser(userId);
  };

  // Мессеж илгээх
  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    try {
      await addDoc(collection(db, "messages"), {
        userId: selectedUser,
        sender: "me",
        message: newMessage,
        createdAt: serverTimestamp(),
      });

      setNewMessage("");
    } catch (error) {
      console.error("Мессеж илгээхэд алдаа гарлаа:", error);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#1a1a1a] text-white p-5 flex">
      {/* Хэрэглэгчийн жагсаалт */}
      <div className="w-1/4 bg-[#252525] p-4 rounded-lg border border-[#2f2f2f] shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">💬 Хэрэглэгчид</h2>
        <div className="space-y-3 mt-3">
          {users.map((user) => (
            <div
              key={user.id}
              className={`p-3 rounded cursor-pointer ${
                selectedUser === user.id
                  ? "bg-[#4281db]"
                  : "bg-[#333333] hover:bg-[#2f2f2f]"
              }`}
              onClick={() => handleUserSelect(user.id)}
            >
              {user.name}
            </div>
          ))}
        </div>
      </div>

      {/* Чат хэсэг */}
      <div className="w-3/4 ml-5 bg-[#252525] p-4 rounded-lg border border-[#2f2f2f] shadow-lg flex flex-col justify-between">
        {selectedUser ? (
          <>
            <h2 className="text-2xl font-semibold mb-4">
              📬 Чат: {users.find((user) => user.id === selectedUser)?.name}
            </h2>

            {/* Мессеж харуулах хэсэг */}
            <div className="h-[60vh] overflow-y-auto bg-[#333333] p-3 rounded-lg space-y-3">
              {messages.map((msg: any) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg ${
                    msg.sender === "me"
                      ? "bg-[#4281db] text-white"
                      : "bg-[#2f2f2f] text-gray-300"
                  }`}
                >
                  <p className="text-sm">
                    <strong>{msg.sender}</strong>
                  </p>
                  <p>{msg.message}</p>
                </div>
              ))}
              <div ref={chatEndRef}></div>
            </div>

            {/* Мессеж бичих хэсэг */}
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Мессеж бичих..."
                className="w-full p-2 border border-[#4a4a4a] rounded bg-[#1a1a1a] text-white focus:outline-none"
              />
              <button
                onClick={handleSendMessage}
                className="p-2 bg-[#4281db] text-white rounded hover:bg-[#3375cd]"
              >
                Илгээх
              </button>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-400 text-lg">
            Чатлах хэрэглэгчээ сонгоно уу.
          </div>
        )}
      </div>
    </div>
  );
};

export default Chats;
