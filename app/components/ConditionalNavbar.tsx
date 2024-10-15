'use client'

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  const showNavbar = !pathname?.startsWith('/dashboard');

  if (!showNavbar) return null;
  return <Navbar />;
}