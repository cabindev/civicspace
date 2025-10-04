// app/components/NavMenu.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu } from "lucide-react";
import { useSession, signOut } from 'next-auth/react';

export function NavMenu() {
 const [isMenuOpen, setIsMenuOpen] = useState(false);
 const { data: session } = useSession();

 return (
   <div className="relative">
     <button
       onClick={() => setIsMenuOpen(!isMenuOpen)}
       className="text-white focus:outline-none transition-colors duration-200 hover:text-green-100"
       aria-label="Toggle menu"
     >
       <Menu size={24} />
     </button>

     {isMenuOpen && (
       <nav className="absolute right-0 mt-12 w-48 bg-white rounded-md shadow-xl z-20">
         {session ? (
           <>
             {(session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN') && (
               <Link 
                 href="/dashboard" 
                 className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
               >
                 Dashboard
               </Link>
             )}
             {session.user.role === 'SUPER_ADMIN' && (
               <Link 
                 href="/dashboard/users" 
                 className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
               >
                 User Management
               </Link>
             )}
             <button
               onClick={() => signOut()}
               className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
             >
               Sign Out
             </button>
           </>
         ) : (
           <>
             <Link 
               href="/auth/form_signup" 
               className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
             >
               Sign Up
             </Link>
             <Link 
               href="/auth/signin" 
               className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
             >
               Sign In
             </Link>
           </>
         )}
       </nav>
     )}
   </div>
 );
}