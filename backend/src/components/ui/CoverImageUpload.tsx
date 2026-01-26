
import React, { useRef, useState } from 'react';
import { Camera, X, Upload, ImageIcon } from 'lucide-react';

interface CoverImageUploadProps {
  imageUrl?: string | null;
  onChange: (url: string | null) => void;
  readOnly?: boolean;
}

export const CoverImageUpload: React.FC<CoverImageUploadProps> = ({ imageUrl, onChange, readOnly }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Max 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (!imageUrl && readOnly) return null;

  return (
    <div 
      className="relative w-full aspect-[16/9] rounded-xl overflow-hidden group mb-8"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {imageUrl ? (
        <>
          <img src={imageUrl} alt="Cover" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          {!readOnly && isHovering && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center gap-4 animate-fadeIn">
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 className="bg-white text-monday-dark px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 flex items-center gap-2 shadow-lg"
               >
                 <Camera size={18} /> Replace Image
               </button>
               <button 
                 onClick={() => onChange(null)}
                 className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 shadow-lg"
               >
                 <X size={20} />
               </button>
            </div>
          )}
        </>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-full bg-[#F6F7FB] border-2 border-dashed border-[#C5C7D0] hover:border-monday-primary hover:bg-blue-50 transition-all flex flex-col items-center justify-center cursor-pointer group/upload"
        >
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400 group-hover/upload:text-monday-primary group-hover/upload:scale-110 transition-all mb-4">
             <Upload size={32} />
          </div>
          <h4 className="text-monday-dark font-bold mb-1">Add Cover Image</h4>
          <p className="text-xs text-gray-500">16:9 aspect ratio recommended (Max 5MB)</p>
        </div>
      )}
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
    </div>
  );
};
