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
  getDocs,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { getAuth } from "firebase/auth"; // Firebase Authentication-оос auth авах

// 📌 Мессежийн өгөгдлийн интерфэйс
interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: Date | null;
}

// 📌 Хэрэглэгчийн өгөгдлийн интерфэйс
interface User {
  id: string;
  name: string;
}

const AdminChats = () => {
  const [users, setUsers] = useState<User[]>([]); // Хэрэглэгчдийн жагсаалт
  const [searchTerm, setSearchTerm] = useState(""); // Хэрэглэгч хайх
  const [selectedUser, setSelectedUser] = useState<User | null>(null); // Сонгосон хэрэглэгч
  const [messages, setMessages] = useState<Message[]>([]); // Мессежүүд
  const [newMessage, setNewMessage] = useState(""); // Шинэ мессеж
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const auth = getAuth(); // Firebase Authentication
  const currentUserId = auth.currentUser?.uid; // Одоогийн хэрэглэгчийн ID

  // 📌 Firebase-ээс хэрэглэгчдийн жагсаалтыг татах
  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const loadedUsers: User[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setUsers(loadedUsers);
    };

    fetchUsers();
  }, []);

  // 📌 Сонгосон хэрэглэгчийн мессежийг татах
  useEffect(() => {
    if (!selectedUser || !currentUserId) return;

    const q = query(
      collection(db, "messages"),
      where("senderId", "in", [currentUserId, selectedUser.id]),
      where("receiverId", "in", [currentUserId, selectedUser.id]),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages: Message[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        senderId: doc.data().senderId,
        receiverId: doc.data().receiverId,
        message: doc.data().message,
        createdAt: doc.data().createdAt?.toDate() || null,
      }));
      setMessages(loadedMessages);
    });

    return () => unsubscribe();
  }, [selectedUser, currentUserId]);

  // 📌 Мессежний доош гүйлгэх
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // 📌 Мессеж илгээх
  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || !selectedUser || !currentUserId) return;

    try {
      await addDoc(collection(db, "messages"), {
        senderId: currentUserId, // Одоогийн хэрэглэгчийн ID
        receiverId: selectedUser.id,
        message: newMessage,
        createdAt: serverTimestamp(),
      });

      setNewMessage("");
    } catch (error) {
      console.error("Мессеж илгээхэд алдаа гарлаа:", error);
    }
  };

  // 📌 Хэрэглэгч сонгох
  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
  };

  // 📌 Хэрэглэгч хайх
  const filteredUsers = users.filter(
    (user) =>
      user.id !== currentUserId && // Өөрөө өөрийгөө жагсаалтаас хасах
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-[#1a1a1a] text-white p-5 flex">
      {/* Хэрэглэгчийн жагсаалт */}
      <div className="w-1/4 bg-[#252525] p-4 rounded-lg border border-[#2f2f2f] shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Хэрэглэгчид</h2>
        <input
          type="text"
          placeholder="Хэрэглэгч хайх..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 mb-4 border border-[#4a4a4a] rounded bg-[#1a1a1a] text-white focus:outline-none"
        />
        <div className="space-y-3 mt-3">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className={`py-3 px-5 rounded-xl cursor-pointer flex items-center gap-3 ${
                selectedUser?.id === user.id
                  ? "bg-[#323232]"
                  : "bg-[#202020] hover:bg-[#2f2f2f]"
              }`}
              onClick={() => handleUserSelect(user)}
            >
              <div className="h-5 w-5 rounded-full bg-white/50"> </div>
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
              Чат: {selectedUser.name}
            </h2>

            {/* Мессеж харуулах хэсэг */}
            <div className="h-[60vh] overflow-y-auto bg-[#333333] p-3 rounded-lg space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg ${
                    msg.senderId === currentUserId
                      ? "bg-[#1e394c] text-white"
                      : "bg-[#2f2f2f] text-gray-300"
                  }`}
                >
                  <p className="text-sm">
                    <strong>
                      {msg.senderId === currentUserId
                        ? "Та"
                        : selectedUser.name}
                    </strong>
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
                className="p-2 bg-[#1e394c] text-white rounded hover:bg-[#1e394c]"
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

export default AdminChats;
