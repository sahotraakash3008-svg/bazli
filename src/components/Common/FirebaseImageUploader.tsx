import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle, Trash2, Link } from 'lucide-react';
import {
  uploadProductImage,
  uploadMenuCardPhoto,
  uploadSellerBanner,
  uploadUserProfileImage,
  uploadKycDocument,
  uploadCmsAsset
} from '../../lib/storageService';

export interface FirebaseImageUploaderProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  uploadType: 'product' | 'menu_photo' | 'seller_banner' | 'user_avatar' | 'cms_asset' | 'kyc_document';
  targetId?: string;
  compact?: boolean;
  placeholder?: string;
  helperText?: string;
  aspectRatio?: 'square' | 'wide' | 'banner' | 'auto';
  className?: string;
}

export const FirebaseImageUploader: React.FC<FirebaseImageUploaderProps> = ({
  label,
  value,
  onChange,
  uploadType,
  targetId = 'general',
  compact = false,
  placeholder = 'https://images.unsplash.com/... or upload from device',
  helperText,
  aspectRatio = 'square',
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be chosen again if needed
    e.target.value = '';

    // Validate size (15MB)
    if (file.size > 15 * 1024 * 1024) {
      setUploadError('File exceeds 15MB limit. Please choose a smaller image.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      let downloadUrl = '';
      const onProgress = (percent: number) => {
        setUploadProgress(percent);
      };

      switch (uploadType) {
        case 'product':
          downloadUrl = await uploadProductImage(file, targetId, onProgress);
          break;
        case 'menu_photo':
          downloadUrl = await uploadMenuCardPhoto(file, targetId, onProgress);
          break;
        case 'seller_banner':
          downloadUrl = await uploadSellerBanner(file, targetId, onProgress);
          break;
        case 'user_avatar':
          downloadUrl = await uploadUserProfileImage(file, targetId, onProgress);
          break;
        case 'kyc_document':
          downloadUrl = await uploadKycDocument(file, targetId, 'doc', onProgress);
          break;
        case 'cms_asset':
        default:
          downloadUrl = await uploadCmsAsset(file, 'general', onProgress);
          break;
      }

      if (downloadUrl) {
        onChange(downloadUrl);
      }
    } catch (err: any) {
      console.error('Firebase Storage upload failed:', err);
      // If offline or storage error, offer fallback
      setUploadError(err.message || 'Upload failed. Please try again or use direct URL.');
    } finally {
      setIsUploading(false);
    }
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'wide':
        return 'h-32 w-full';
      case 'banner':
        return 'h-40 w-full';
      case 'square':
        return 'h-24 w-24';
      default:
        return 'h-24 w-24';
    }
  };

  if (compact) {
    return (
      <div className={`space-y-1.5 ${className}`}>
        {label && <label className="block text-[11px] font-bold text-slate-700">{label}</label>}
        <div className="flex items-center gap-2">
          <div className="relative shrink-0">
            {value ? (
              <img
                src={value}
                alt="Uploaded"
                className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80';
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                <ImageIcon className="w-4 h-4" />
              </div>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-lg text-[10px] font-bold cursor-pointer transition-colors disabled:opacity-50"
              >
                <UploadCloud className="w-3 h-3 text-amber-600" />
                <span>{isUploading ? `${uploadProgress}%` : 'Upload File'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-semibold cursor-pointer"
              >
                <Link className="w-2.5 h-2.5 inline mr-0.5" /> URL
              </button>
              {value && (
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                  title="Remove Image"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>

            {showUrlInput && (
              <input
                type="url"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full mt-1.5 px-2 py-1 text-[11px] bg-white border border-slate-200 rounded-md outline-none focus:border-amber-500 font-mono text-slate-700"
              />
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        {uploadError && <p className="text-[10px] text-red-600 font-medium">{uploadError}</p>}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-800">{label}</label>
          <span className="text-[10px] font-bold text-slate-400">Firebase Storage Synced</span>
        </div>
      )}

      {/* Main Preview & Drop Zone */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
        <div className={`relative shrink-0 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 ${getAspectClass()}`}>
          {value ? (
            <img
              src={value}
              alt="Asset Preview"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center">
              <ImageIcon className="w-6 h-6 mb-1 text-slate-400" />
              <span className="text-[9px] font-bold text-slate-500">No Image Selected</span>
            </div>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white p-2">
              <Loader2 className="w-5 h-5 animate-spin mb-1 text-amber-400" />
              <span className="text-[10px] font-black">{uploadProgress}%</span>
            </div>
          )}
        </div>

        <div className="flex-1 w-full space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading {uploadProgress}%</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload Image</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Link className="w-3 h-3 text-slate-500" />
              <span>{showUrlInput ? 'Hide URL' : 'Use Direct URL'}</span>
            </button>

            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="px-2.5 py-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          {/* Direct URL Input toggle */}
          {showUrlInput && (
            <div className="space-y-1">
              <input
                type="url"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-slate-800"
              />
              <span className="text-[10px] text-slate-400 block">
                Paste any external image link or Unsplash CDN URL
              </span>
            </div>
          )}

          {helperText && !uploadError && (
            <p className="text-[11px] text-slate-500 font-medium">{helperText}</p>
          )}

          {uploadError && (
            <div className="flex items-center gap-1.5 text-[11px] text-red-600 font-semibold bg-red-50 p-2 rounded-xl border border-red-200">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};
