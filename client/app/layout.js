'use client';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from '../theme/mui-theme';
import AppHeader from '../components/layout/AppHeader';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AppHeader />
          <main style={{ padding: 24 }}>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}