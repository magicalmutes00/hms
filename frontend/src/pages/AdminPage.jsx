import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { endpoints } from '../api/client.js';
import { useRoomTypes } from '../hooks/queries.js';
import FileUploader from '../components/FileUploader.jsx';

// Staff admin console: room types (+ photo upload to Neon storage), rooms, user roles.
export default function AdminPage() {
  const qc = useQueryClient();
  const { data: types = [] } = useRoomTypes();
  const { data: users = [] } = useQuery({ queryKey: ['admin-users'], queryFn: endpoints.adminUsers });
  const [form, setForm] = useState({ title: '', basePrice: '', capacity: 2, description: '', amenities: '', images: [] });
  const [roomForm, setRoomForm] = useState({ roomNumber: '', roomTypeId: '', floor: 1 });
  const [msg, setMsg] = useState('');

  const createType = useMutation({
    mutationFn: () => endpoints.createRoomType({
      title: form.title, basePrice: Number(form.basePrice), capacity: Number(form.capacity),
      description: form.description,
      amenities: form.amenities.split(',').map((s) => s.trim()).filter(Boolean),
      imageUrls: form.images,
    }),
    onSuccess: () => { setMsg('Room type created'); setForm({ title: '', basePrice: '', capacity: 2, description: '', amenities: '', images: [] }); qc.invalidateQueries({ queryKey: ['room-types'] }); },
    onError: (e) => setMsg(e.message),
  });

  const createRoom = useMutation({
    mutationFn: () => endpoints.createRoom({ ...roomForm, floor: Number(roomForm.floor), roomTypeId: roomForm.roomTypeId }),
    onSuccess: () => { setMsg('Room created'); qc.invalidateQueries({ queryKey: ['rooms'] }); },
    onError: (e) => setMsg(e.message),
  });

  const setRole = async (id, role) => {
    try { await endpoints.setUserRole(id, role); qc.invalidateQueries({ queryKey: ['admin-users'] }); }
    catch (e) { setMsg(e.message); }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Admin</h1>
      {msg && <p className="text-sm text-slate-700">{msg}</p>}

      <section>
        <h2 className="font-bold mb-2">New room type</h2>
        <div className="grid md:grid-cols-2 gap-2 max-w-2xl">
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="border rounded px-2 py-1" />
          <input placeholder="Base price" type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} className="border rounded px-2 py-1" />
          <input placeholder="Capacity" type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className="border rounded px-2 py-1" />
          <input placeholder="Amenities (comma separated)" value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} className="border rounded px-2 py-1" />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border rounded px-2 py-1 md:col-span-2" />
          <div className="md:col-span-2 flex items-center gap-2">
            <FileUploader onUploaded={(url) => setForm({ ...form, images: [...form.images, url] })} />
            <span className="text-xs text-slate-500">{form.images.length} photo(s)</span>
          </div>
        </div>
        <button onClick={() => createType.mutate()} className="mt-2 bg-blue-600 text-white px-4 py-1 rounded">Create type</button>
      </section>

      <section>
        <h2 className="font-bold mb-2">New room</h2>
        <div className="flex gap-2 flex-wrap">
          <input placeholder="Number" value={roomForm.roomNumber} onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })} className="border rounded px-2 py-1" />
          <select value={roomForm.roomTypeId} onChange={(e) => setRoomForm({ ...roomForm, roomTypeId: e.target.value })} className="border rounded px-2 py-1">
            <option value="">Select type</option>
            {types.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
          <input placeholder="Floor" type="number" value={roomForm.floor} onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })} className="border rounded px-2 py-1 w-24" />
          <button onClick={() => createRoom.mutate()} className="bg-blue-600 text-white px-4 py-1 rounded">Create room</button>
        </div>
      </section>

      <section>
        <h2 className="font-bold mb-2">Users & roles</h2>
        <div className="space-y-1">
          {users.map((u) => (
            <div key={u.id} className="border rounded p-2 flex items-center gap-3 text-sm">
              <span className="flex-1">{u.email} — {u.fullName}</span>
              <select value={u.role} onChange={(e) => setRole(u.id, e.target.value)} className="border rounded px-2 py-1">
                {['ADMIN', 'RECEPTIONIST', 'HOUSEKEEPER', 'GUEST'].map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
