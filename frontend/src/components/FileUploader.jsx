import { useState } from 'react';
import axios from 'axios';
import { endpoints } from '../api/client.js';
import { Upload } from 'lucide-react';

/** Uploads a file to Neon Object Storage via backend presigned URL. */
export default function FileUploader({ onUploaded, prefix = 'rooms/' }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handle = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setError('');
    try {
      const key = `${prefix}${Date.now()}-${file.name}`.replace(/\s+/g, '-');
      const { url, publicUrl } = await endpoints.presignUpload({ key, contentType: file.type });
      await axios.put(url, file, { headers: { 'Content-Type': file.type } });
      onUploaded?.(publicUrl || key);
    } catch (err) {
      setError(err.message);
    } finally { setBusy(false); }
  };

  return (
    <label className="flex items-center gap-2 border rounded px-3 py-2 cursor-pointer text-sm">
      <Upload size={16} /> {busy ? 'Uploading…' : 'Upload photo'}
      <input type="file" className="hidden" accept="image/*" onChange={handle} disabled={busy} />
      {error && <span className="text-red-600">{error}</span>}
    </label>
  );
}
