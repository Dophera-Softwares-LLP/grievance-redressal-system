'use client';
import { useEffect } from 'react';
import { auth } from '../lib/firebase.client';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => {
      if (u) router.replace('/dashboard');
      else router.replace('/login');
    });
    return () => unsub();
  }, [router]);
  return null;
}
