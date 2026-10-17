import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { endpoints } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export const useMe = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({ queryKey: ['me'], queryFn: endpoints.me, enabled: isAuthenticated });
};

export const useAvailability = (roomId, month) =>
  useQuery({
    queryKey: ['availability', roomId, month],
    queryFn: () => endpoints.availability(roomId, month),
    enabled: !!roomId && !!month,
  });

export const useAdminStats = () =>
  useQuery({ queryKey: ['admin-stats'], queryFn: endpoints.adminStats });

export const useStaff = () =>
  useQuery({ queryKey: ['staff'], queryFn: endpoints.staff });

export const useRooms = (params) =>
  useQuery({ queryKey: ['rooms', params], queryFn: () => endpoints.rooms(params) });

export const useRoomTypes = () =>
  useQuery({ queryKey: ['room-types'], queryFn: endpoints.roomTypes });

export const useMyReservations = (enabled = true) =>
  useQuery({ queryKey: ['my-reservations'], queryFn: endpoints.myReservations, enabled });

export const useAllReservations = () =>
  useQuery({ queryKey: ['reservations'], queryFn: endpoints.allReservations });

export const useBook = () => {
  const qc = useQueryClient();
  const last = useRef(null);
  return useMutation({
    mutationFn: (body) => {
      // Same payload retried (double-click / network retry) reuses one key:
      // the backend replays the first reservation instead of double-booking.
      const sig = JSON.stringify(body);
      if (!last.current || last.current.sig !== sig) {
        last.current = {
          sig,
          key: crypto.randomUUID ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        };
      }
      return endpoints.book(body, last.current.key);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rooms'] }),
  });
};

export const useTasks = (status) =>
  useQuery({ queryKey: ['tasks', status], queryFn: () => endpoints.tasks(status) });

export const useUpdateTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }) => endpoints.updateTask(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
};
