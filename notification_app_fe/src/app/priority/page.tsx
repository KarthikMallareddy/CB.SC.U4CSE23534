'use client';

import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Card, CardContent, Chip, CircularProgress, 
  Grid, Button, Select, MenuItem, FormControl, InputLabel 
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface Notification {
  ID: string;
  Type: string;
  Message: string;
  Timestamp: string;
}

export default function PriorityNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState('Placement');
  const [limitFilter, setLimitFilter] = useState(5);
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
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
    const fetchPriority = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/notifications?notification_type=${typeFilter}&limit=${limitFilter}`);
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
        }
      } catch (err) {
        console.error('Failed to fetch priority notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchPriority();
  }, [typeFilter, limitFilter]);

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Priority Notifications
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Focus on what matters most. Filter by type and limit results.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              label="Type"
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <MenuItem value="Placement">Placement</MenuItem>
              <MenuItem value="Event">Event</MenuItem>
              <MenuItem value="Result">Result</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 100 }} size="small">
            <InputLabel>Limit</InputLabel>
            <Select
              value={limitFilter}
              label="Limit"
              onChange={(e) => setLimitFilter(Number(e.target.value))}
            >
              <MenuItem value={5}>Top 5</MenuItem>
              <MenuItem value={8}>Top 8</MenuItem>
              <MenuItem value={10}>Top 10</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress />
        </Box>
      ) : notifications.length === 0 ? (
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 5 }}>
          No priority notifications found for this filter.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {notifications.map((notif) => {
            const isViewed = viewedIds.has(notif.ID);
            return (
              <Grid size={12} key={notif.ID}>
                <Card 
                  sx={{ 
                    backgroundColor: isViewed ? '#ffffff' : '#fff3e0',
                    borderLeft: isViewed ? '4px solid transparent' : '4px solid #ed6c02',
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
                          <Chip label="URGENT" color="warning" size="small" />
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
                        variant="outlined" 
                        color="warning"
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
      )}
    </Box>
  );
}
