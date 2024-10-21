'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaSearch } from 'react-icons/fa';
import Link from 'next/link';
import { Footer } from './components/Footer';
import { useSession, signOut } from 'next-auth/react';
import { FaBars, FaTimes } from 'react-icons/fa';
interface AutocompleteResult {
  id: string;
  name: string;
  type: 'tradition' | 'publicPolicy' | 'ethnicGroup' | 'creativeActivity';
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AutocompleteResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length > 0) {
        try {
          const response = await fetch(`/api/autocomplete?q=${encodeURIComponent(searchQuery)}&limit=5`);
          if (response.ok) {
            const data = await response.json();
            setSuggestions(data.results);
            setShowSuggestions(true);
          } else {
            console.error('Failed to fetch suggestions');
            setSuggestions([]);
          }
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && suggestions.length > 0) {
      const firstSuggestion = suggestions[0];
      handleSuggestionClick(firstSuggestion);
    }
  };

  const handleSuggestionClick = (suggestion: AutocompleteResult) => {
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
    switch (suggestion.type) {
      case 'tradition':
        router.push(`/components/traditions/${suggestion.id}`);
        break;
      case 'publicPolicy':
        router.push(`/components/public-policy/${suggestion.id}`);
        break;
      case 'ethnicGroup':
        router.push(`/components/ethnic-group/${suggestion.id}`);
        break;
      case 'creativeActivity':
        router.push(`/components/creative-activity/${suggestion.id}`);
        break;
      default:
        console.error('Unknown suggestion type:', suggestion.type);
        router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-400 to-green-600">
     <header className="p-4 flex justify-end relative">
        <button
          onClick={toggleMenu}
          className="text-white focus:outline-none"
        >
          {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
        {isMenuOpen && (
          <div className="absolute right-0 mt-12 w-48 bg-white rounded-md shadow-xl z-20">
            {session ? (
          <>
            {session.user.role === 'ADMIN' && (
              <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Dashboard
              </Link>
            )}
            <button
              onClick={() => signOut()}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link href="/auth/form_signup" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Sign Up
            </Link>
            <Link href="/auth/signin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Sign In
            </Link>
          </>
        )}
          </div>
        )}
      </header>

      <main className="flex-grow flex flex-col mt-8 items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-xl text-center">
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src="/logopower.png"
              alt="Power Logo"
              width={180}
              height={180}
              className="mx-auto drop-shadow-xl"
            />
          </motion.div>

          <motion.h1
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-3 tracking-wide"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            เครือข่ายพลังสังคม
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg md:text-xl text-green-100 mb-8 font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Database of the Social Synergy Network Foundation
          </motion.p>

          <motion.div
            ref={searchRef}
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <form onSubmit={handleSearch} className="flex items-center">
              <input
                type="text"
                placeholder="ค้นหาข้อมูล..."
                className="w-full px-5 py-3 rounded-full border-2 border-green-300 focus:outline-none focus:border-green-500 text-lg shadow-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-600 hover:text-green-800 text-xl"
                disabled={suggestions.length === 0}
              >
                <FaSearch />
              </button>
            </form>
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white bg-opacity-90 mt-1 rounded-md shadow-lg max-h-60 overflow-auto">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-green-100 cursor-pointer"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="font-semibold">{suggestion.name}</div>
                    <div className="text-sm text-gray-600">
                      {suggestion.type}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </div>
      </main>

      <div className="hidden sm:block">
    <Footer />
  </div>
    </div>
  );
}