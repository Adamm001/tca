"use client";
import React, { useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  Query,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";

// 📚 Ном хайх функц (Firestore-с хайлт хийх)
const searchBooksInFirestore = async (queryParams: any) => {
  // Шүүлтүүдийг хадгалах массив
  const filters: QueryConstraint[] = [];

  // 📌 Шүүлтүүр нэмэх
  if (queryParams.title) {
    filters.push(
      where("title", ">=", queryParams.title),
      where("title", "<=", queryParams.title + "\uf8ff")
    );
  }

  if (queryParams.author) {
    filters.push(where("author", "==", queryParams.author));
  }

  if (queryParams.category) {
    filters.push(where("category", "==", queryParams.category));
  }

  // Үнэ шүүлтүүр
  if (queryParams.minPrice) {
    filters.push(where("price", ">=", Number(queryParams.minPrice)));
  }
  if (queryParams.maxPrice) {
    filters.push(where("price", "<=", Number(queryParams.maxPrice)));
  }

  // ✅ Зөв query-г үүсгэх
  let q: Query;
  if (filters.length > 0) {
    q = query(collection(db, "books"), ...filters);
  } else {
    q = query(collection(db, "books"));
  }

  try {
    const querySnapshot = await getDocs(q);
    const books = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("Хайлтын үр дүн:", books);
    return books;
  } catch (error) {
    console.error("Хайлт хийхэд алдаа гарлаа:", error);
    return [];
  }
};

const Search = () => {
  const [query, setQuery] = useState({
    title: "",
    author: "",
    category: "",
    minPrice: "",
    maxPrice: "",
  });

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [noResults, setNoResults] = useState(false);

  // 📚 Input утгыг өөрчлөх үед ажиллах функц
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setQuery({ ...query, [e.target.name]: e.target.value });
  };

  // 🔎 Хайлтын үйлдэл хийх үед
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Хайлтын утгууд:", query);

    // Хайлтын үр дүнг авах
    const searchParams: any = {};
    if (query.title) {
      searchParams.title = query.title;
    }
    if (query.author) {
      searchParams.author = query.author;
    }
    if (query.category) {
      searchParams.category = query.category;
    }
    if (query.minPrice) {
      searchParams.minPrice = query.minPrice;
    }
    if (query.maxPrice) {
      searchParams.maxPrice = query.maxPrice;
    }

    // Firestore-оос хайлтын үр дүнг татах
    const results = await searchBooksInFirestore(searchParams);

    // 🔍 Хайлтын үр дүнг шалгах
    if (results.length === 0) {
      setNoResults(true);
      setSearchResults([]);
    } else {
      setNoResults(false);
      setSearchResults(results);
    }
  };

  return (
    <div className="w-full flex flex-col items-center min-h-screen bg-[#1a1a1a] text-white p-4">
      <h1 className="text-3xl font-bold mb-4">Ном хайх</h1>
      <form
        onSubmit={handleSearch}
        className="p-4 rounded-lg border border-[#4a4a4a] w-full max-w-3/5 space-y-4 bg-[#252525]"
      >
        <div className="w-full flex gap-5">
          {/* Номын нэр */}
          <div className="flex-1">
            <label className="block text-gray-300">Номын нэр</label>
            <input
              type="text"
              name="title"
              value={query.title}
              onChange={handleChange}
              placeholder="Номын нэр"
              className="w-full border border-[#4a4a4a] p-2 h-10 rounded-md bg-[#1a1a1a] text-white"
            />
          </div>

          {/* Зохиолчийн нэр */}
          <div className="flex-1">
            <label className="block text-gray-300">Зохиолчийн нэр</label>
            <input
              type="text"
              name="author"
              value={query.author}
              onChange={handleChange}
              placeholder="Зохиолчийн нэр"
              className="w-full border border-[#4a4a4a] p-2 h-10 rounded-md bg-[#1a1a1a] text-white"
            />
          </div>
        </div>

        <div className="w-full flex gap-5 items-end">
          {/* Номын төрөл */}
          <div className="flex-1">
            <label className="block text-gray-300">Номын төрөл</label>
            <select
              name="category"
              value={query.category}
              onChange={handleChange}
              className="w-full p-2 border border-[#4a4a4a] bg-[#1a1a1a] text-white rounded focus:outline-0 h-10"
            >
              <option value="">Сонгох</option>
              <option value="science">Шинжлэх ухаан</option>
              <option value="literature">Уран зохиол</option>
              <option value="technology">Технологи</option>
              <option value="history">Түүх</option>
            </select>
          </div>

          {/* Доод үнэ */}
          <div className="flex-1">
            <label className="block text-gray-300">Доод үнэ (₮)</label>
            <input
              type="number"
              name="minPrice"
              value={query.minPrice}
              onChange={handleChange}
              placeholder="Хамгийн бага үнэ"
              className="w-full p-2 border border-[#4a4a4a] bg-[#1a1a1a] text-white rounded"
            />
          </div>

          {/* Дээд үнэ */}
          <div className="flex-1">
            <label className="block text-gray-300">Дээд үнэ (₮)</label>
            <input
              type="number"
              name="maxPrice"
              value={query.maxPrice}
              onChange={handleChange}
              placeholder="Хамгийн их үнэ"
              className="w-full p-2 border border-[#4a4a4a] bg-[#1a1a1a] text-white rounded"
            />
          </div>

          <button
            type="submit"
            className="flex-1 h-10 w-full p-2 bg-[#4281db] text-white rounded hover:bg-[#3375cd] active:bg-[#0e69c3]"
          >
            Хайх
          </button>
        </div>
      </form>

      {/* 📚 Хайлтын үр дүнгийн хэсэг */}
      <div className="mt-8 w-full max-w-3/5">
        <h2 className="text-2xl font-bold mb-4">🔍 Хайлтын үр дүн:</h2>
        {noResults ? (
          <div className="bg-[#252525] p-4 rounded-lg border border-[#4a4a4a] text-gray-300">
            Хайлтад тохирох үр дүн олдсонгүй.
          </div>
        ) : (
          <div className="space-y-4">
            {searchResults.map((result) => (
              <div
                key={result.id}
                className="bg-[#252525] p-4 rounded-lg border border-[#4a4a4a] text-white"
              >
                <h3 className="text-xl font-bold">{result.title}</h3>
                <p className="text-gray-400">Зохиолч: {result.author}</p>
                <p className="text-gray-400">
                  Үнэ: {result.price.toLocaleString()}₮
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
