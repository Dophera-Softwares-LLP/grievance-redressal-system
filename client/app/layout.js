'use client';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from '../theme/mui-theme';
import AppHeader from '../components/layout/AppHeader';
import { usePathname } from 'next/navigation';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const hideHeader = pathname.startsWith('/login') || pathname.startsWith('/register');

  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {!hideHeader && <AppHeader />}
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}