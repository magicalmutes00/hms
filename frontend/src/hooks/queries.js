import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { endpoints } from '../api/client.js';

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
  return useMutation({
    mutationFn: endpoints.book,
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
