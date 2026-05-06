'use client';

import * as React from 'react';
import { ThemeProvider, createTheme, CssBaseline, AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import Link from 'next/link';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f7fb',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        },
      },
    },
  },
});

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0', backgroundColor: '#fff', color: '#333' }}>
        <Toolbar>
          <NotificationsActiveIcon sx={{ mr: 2, color: '#1976d2' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Campus Notify
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link href="/" passHref style={{ textDecoration: 'none' }}>
              <Button color="inherit" sx={{ fontWeight: 600 }}>All Notifications</Button>
            </Link>
            <Link href="/priority" passHref style={{ textDecoration: 'none' }}>
              <Button variant="outlined" color="primary" startIcon={<PriorityHighIcon />} sx={{ fontWeight: 600, borderRadius: 20 }}>
                Priority
              </Button>
            </Link>
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ p: 4, maxWidth: 1200, margin: '0 auto' }}>
        {children}
      </Box>
    </ThemeProvider>
  );
}
