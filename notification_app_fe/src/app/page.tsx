'use client';

import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Card, CardContent, Chip, CircularProgress, 
  Grid, Button, Pagination, Alert 
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface Notification {
  ID: string;
  Type: string;
  Message: string;
  Timestamp: string;
}

export default function AllNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());
  
  // We don't have total count from the API snippet, so we assume fixed pages or just basic pagination
  const limit = 10;

  useEffect(() => {
    // Load viewed state from local storage
    const stored = localStorage.getItem('viewedNotifications');
    if (stored) {
      setViewedIds(new Set(JSON.parse(stored)));
    }
  }, []);

  const markAsViewed = (id: string) => {
    const newSet = new Set(viewedIds);
    newSet.add(id);
    setViewedIds(newSet);
    localStorage.setItem('viewedNotifications', JSON.stringify(Array.from(newSet)));
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/notifications?page=${page}&limit=${limit}`);
        if (!res.ok) throw new Error('Failed to fetch notifications');
        const data = await res.json();
        setNotifications(data.notifications || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [page]);

  const getColorForType = (type: string) => {
    switch(type) {
      case 'Placement': return 'primary';
      case 'Event': return 'secondary';
      case 'Result': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        All Notifications
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Stay up to date with the latest campus updates.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {notifications.map((notif) => {
              const isViewed = viewedIds.has(notif.ID);
              return (
                <Grid size={12} key={notif.ID}>
                  <Card 
                    sx={{ 
                      backgroundColor: isViewed ? '#ffffff' : '#e3f2fd',
                      borderLeft: isViewed ? '4px solid transparent' : '4px solid #1976d2',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Chip 
                            label={notif.Type} 
                            color={getColorForType(notif.Type) as any} 
                            size="small" 
                            sx={{ fontWeight: 'bold' }}
                          />
                          {!isViewed && (
                            <Chip label="NEW" color="error" size="small" />
                          )}
                          <Typography variant="caption" color="text.secondary">
                            {new Date(notif.Timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: isViewed ? 'normal' : 'bold' }}>
                          {notif.Message}
                        </Typography>
                      </Box>
                      {!isViewed && (
                        <Button 
                          variant="contained" 
                          size="small" 
                          startIcon={<CheckCircleIcon />}
                          onClick={() => markAsViewed(notif.ID)}
                          sx={{ borderRadius: 8, textTransform: 'none' }}
                        >
                          Mark as viewed
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <Pagination 
              count={5} // Assuming 5 pages for demo since API doesn't return total
              page={page} 
              onChange={(e, value) => setPage(value)} 
              color="primary" 
            />
          </Box>
        </>
      )}
    </Box>
  );
}
