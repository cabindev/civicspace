// app/components/Search.tsx
'use client';

import { useState, useEffect, useRef, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch } from 'react-icons/fa';
import { debounce } from 'lodash';

// Server Actions
import { getAutocompleteResults, type AutocompleteResult } from '@/app/lib/actions/search/autocomplete';

const typeMapping = {
  tradition: 'งานบุญประเพณี',
  publicPolicy: 'นโยบายสาธารณะ',
  ethnicGroup: 'กลุ่มชาติพันธุ์',
  creativeActivity: 'กิจกรรมสร้างสรรค์'
};

export function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AutocompleteResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length === 0) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoading(true);
      startTransition(async () => {
        try {
          const result = await getAutocompleteResults(query, 5);
          if (result.success && result.data) {
            setSuggestions(result.data);
            setShowSuggestions(true);
          } else {
            console.error('Search error:', result.error);
            setSuggestions([]);
          }
        } catch (error) {
          console.error('Search error:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      });
    }, 300),
    []
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchSuggestions(searchQuery);
    return () => fetchSuggestions.cancel();
  }, [searchQuery, fetchSuggestions]);

  const handleSuggestionClick = useCallback((suggestion: AutocompleteResult) => {
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);

    const routes = {
      tradition: '/components/traditions',
      publicPolicy: '/components/public-policy',
      ethnicGroup: '/components/ethnic-group',
      creativeActivity: '/components/creative-activity'
    };

    router.push(`${routes[suggestion.type]}/${suggestion.id}`);
  }, [router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && suggestions.length > 0) {
      handleSuggestionClick(suggestions[0]);
    }
  };

  return (
    <div ref={searchRef} className="relative">
      {/* Search form */}
      <form onSubmit={handleSearch} className="font-seppuri flex items-center">
        <input
          type="text"
          placeholder="ค้นหาข้อมูล..."
          className="w-full px-5 py-3 rounded-full border-2 border-green-300 focus:outline-none focus:border-green-500 text-lg shadow-lg transition-colors duration-200"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          type="submit"
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-600 hover:text-green-800 transition-colors duration-200 text-xl"
          disabled={suggestions.length === 0}
          aria-label="Search"
        >
          <FaSearch />
        </button>
      </form>

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <ul className="font-seppuri absolute z-10 w-full mt-1 bg-white rounded-lg shadow-xl max-h-60 overflow-auto">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.id}
              className="border-b last:border-b-0 transition-colors duration-200 hover:bg-gray-50"
            >
              <button
                className="w-full px-4 py-3 text-left"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="font-medium text-gray-900">{suggestion.name}</div>
                <div className="text-sm text-gray-500">
                  {typeMapping[suggestion.type]}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-14 top-1/2 transform -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}