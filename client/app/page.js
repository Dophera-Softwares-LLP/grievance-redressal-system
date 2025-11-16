'use client';
import { useEffect, useState } from 'react';
import { auth } from '../lib/firebase.client';
import { useRouter } from 'next/navigation';
import DashboardSkeleton from '../components/layout/DashboardSkeleton';

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => {
      if (u) router.replace('/dashboard');
      else router.replace('/login');
      setChecking(false);
    });
    return () => unsub();
  }, [router]);
  if (checking) {
    return <DashboardSkeleton />;
  }
  return null;
}