import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, Video, Loader } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'https://edusync.up.railway.app';

const MediaUploader = ({ onMediaAdd, uploadedMedia = [] }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [previews, setPreviews] = useState({});

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mediaType', file.type.startsWith('video') ? 'video' : 'image');

      const token = localStorage.getItem('token');
      const response = await axios.post(`${API}/api/announcements/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      // Create preview
      if (file.type.startsWith('image')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviews(prev => ({
            ...prev,
            [response.data.url]: e.target.result
          }));
        };
        reader.readAsDataURL(file);
      }

      // Call parent callback with URL
      onMediaAdd({
        url: response.data.url,
        type: response.data.type,
        size: response.data.size,
        filename: file.name
      });

      setUploading(false);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
      setUploading(false);
    }
  };

  const handleRemoveMedia = (url) => {
    // Remove from uploaded list via parent component
    onMediaAdd(null); // Signal removal
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <label className="block">
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileUpload}
          disabled={uploading}
          className="hidden"
          id="media-upload"
        />
        <label htmlFor="media-upload" className={`flex items-center justify-center gap-2 border-2 border-dashed ${error ? 'border-red-400 bg-red-50' : 'border-blue-300 bg-blue-50 hover:bg-blue-100'} rounded-xl px-4 py-4 cursor-pointer transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {uploading ? (
            <>
              <Loader size={18} className="text-blue-600 animate-spin" />
              <span className="text-sm font-bold text-blue-600">Uploading...</span>
            </>
          ) : (
            <>
              <Upload size={18} className="text-blue-600" />
              <div className="text-left">
                <p className="text-sm font-bold text-slate-900">Click to upload</p>
                <p className="text-xs text-slate-500">Images or Videos (Max 100MB)</p>
              </div>
            </>
          )}
        </label>
      </label>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
          <span className="text-red-500 font-bold mt-0.5">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Uploaded Media Display */}
      {uploadedMedia && uploadedMedia.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Attached Media</p>
          <div className="grid grid-cols-1 gap-3">
            {uploadedMedia.map((media, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {media.type === 'image' ? (
                    <ImageIcon size={18} className="text-blue-600 flex-shrink-0" />
                  ) : (
                    <Video size={18} className="text-purple-600 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 truncate">{media.filename}</p>
                    <p className="text-xs text-slate-500">
                      {media.type === 'image' ? '🖼️ Image' : '🎬 Video'} • {(media.size / 1024 / 1024).toFixed(2)}MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveMedia(media.url)}
                  className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors flex-shrink-0"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Images */}
      {previews && Object.entries(previews).length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Preview</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(previews).map(([url, preview]) => (
              <img key={url} src={preview} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-slate-200" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
