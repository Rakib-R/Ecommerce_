// hooks/useImageManagement.ts
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';

export interface UploadedImage {
  fileId: string;
  file_url: string;
}

interface UseImageManagementProps {
  maxImages?: number;
  formFieldName?: string;
}

export const useImageManagement = ({
  maxImages = 8,
  formFieldName = "images",
}: UseImageManagementProps = {}) => {

  // ─── State ────────────────────────────────────────────────────────────────
  const [images, setImages] = useState<(UploadedImage | null)[]>([null]);
  const [openImageModal, setOpenImageModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  // ✅ Per-slot loading — replaces single pictureUploadLoader boolean
  const [loadingIndexes, setLoadingIndexes] = useState<Set<number>>(new Set());

  // ─── History ──────────────────────────────────────────────────────────────
  const [history, setHistory] = useState<Map<number, string[]>>(new Map());
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState<Map<number, number>>(new Map());

  // ─── Form ─────────────────────────────────────────────────────────────────
  const formContext = useFormContext();
  const setValue = formContext?.setValue;

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const setSlotLoading = (index: number, loading: boolean) => {
    setLoadingIndexes(prev => {
      const next = new Set(prev);
      if (loading) {
        next.add(index);
      } else {
      
      next.delete(index);
      }
    return next;
    });
  };

  const syncToForm = (updatedImages: (UploadedImage | null)[]) => {
    if (setValue) {
      // Only sync real images to the form — strip null placeholders
      const validImages = updatedImages.filter(img => img !== null);
      setValue(formFieldName, validImages, { shouldDirty: true });
    }
  };

  const getTransformationsFromUrl = (url: string): string[] => {
    const urlParts = url.split('?');
    if (!urlParts[1]) return [];
    const params = new URLSearchParams(urlParts[1]);
    if (!params.has('tr')) return [];
    return params.get('tr')!.split(',');
  };

  const buildUrl = (baseUrl: string, transformations: string[]): string => {
    if (transformations.length === 0) return baseUrl;
    return `${baseUrl}?tr=${transformations.join(',')}`;
  };

  // ─── History ──────────────────────────────────────────────────────────────

  const saveToHistory = (imageIndex: number, transformations: string[]) => {
    setHistory(prev => {
      const newHistory = new Map(prev);
      const existingHistory = newHistory.get(imageIndex) || [];
      const existingIndex = currentHistoryIndex.get(imageIndex) ?? -1;

      // Truncate forward history only if not at end
      const truncated = existingIndex < existingHistory.length - 1
        ? existingHistory.slice(0, existingIndex + 1)
        : [...existingHistory];

      truncated.push(transformations.join(','));
      newHistory.set(imageIndex, truncated);
      return newHistory;
    });

    setCurrentHistoryIndex(prev => {
      const newIndex = new Map(prev);
      const current = newIndex.get(imageIndex) ?? -1;
      newIndex.set(imageIndex, current + 1);
      return newIndex;
    });
  };

  // ─── Upload ───────────────────────────────────────────────────────────────

  const handleImageChange = async (file: File | null, index: number) => {
    if (!file) return;

    setSlotLoading(index, true); // ✅ only this slot shows spinner

    try {
      // ✅ Use FormData instead of base64 — no 33% size inflation
      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosInstance.post("/product/api/upload-product-image", 
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const uploadedImage: UploadedImage = {
        fileId: response.data.fileId,
        file_url: response.data.file_url,
      };

      setImages(prevImages => {
        const updated = [...prevImages];
        updated[index] = uploadedImage;

        // Add a new null slot if we just filled the last slot and haven't hit max
        if (index === prevImages.length - 1 && updated.length < maxImages) {
          updated.push(null);
        }

        syncToForm(updated); // ✅ single call, strips nulls before syncing
        return updated;
      });

      // Reset history for this slot when a new image is uploaded
      setHistory(prev => {
        const next = new Map(prev);
        next.set(index, []);
        return next;
      });
      setCurrentHistoryIndex(prev => {
        const next = new Map(prev);
        next.set(index, -1);
        return next;
      });

    } catch (error) {
      console.error("Upload failed!", error);
      toast.error("Failed to upload image.");
    } finally {
      setSlotLoading(index, false); // ✅ ONLY clears this slot
    }
  };

  // ─── Remove ───────────────────────────────────────────────────────────────

  const handleRemoveImage = async (indexToRemove: number) => {
    // Prevent removing a slot that is currently uploading
    if (loadingIndexes.has(indexToRemove)) {
      toast.error("Upload in progress, please wait.");
      return;
    }

    setSlotLoading(indexToRemove, true);

    try {
      const imageToDelete = images[indexToRemove];

      if (imageToDelete?.fileId) {
        try {
          await axiosInstance.delete('/product/api/delete-product-image', {
            data: { fileId: imageToDelete.fileId },
          });
        } catch (deleteError: any) {
          const errorMessage = deleteError?.response?.data?.message || deleteError?.message;
          const alreadyGone =
            errorMessage?.includes('does not exist') ||
            deleteError?.response?.status === 404;

          if (alreadyGone) {
            console.warn('Image already deleted from server, cleaning up locally:', imageToDelete.fileId);
            // Continue — we still want to remove it from local state
          } else {
            throw deleteError;
          }
        }
      }

      setImages(prevImages => {
        const updated = prevImages.filter((_, idx) => idx !== indexToRemove);

        // Always ensure at least one null slot exists (rule 1 — at least one slot visible)
        if (!updated.some(img => img === null)) {
          updated.push(null);
        }

        syncToForm(updated);
        return updated;
      });

      // Re-index history — shift keys above removed index down by 1
      setHistory(prev => {
        const next = new Map<number, string[]>();
        prev.forEach((value, key) => {
          if (key < indexToRemove) next.set(key, value);
          else if (key > indexToRemove) next.set(key - 1, value);
          // key === indexToRemove is dropped
        });
        return next;
      });

      setCurrentHistoryIndex(prev => {
        const next = new Map<number, number>();
        prev.forEach((value, key) => {
          if (key < indexToRemove) next.set(key, value);
          else if (key > indexToRemove) next.set(key - 1, value);
        });
        return next;
      });

      // Handle modal state if the removed image was open
      if (selectedImageIndex === indexToRemove) {
        closeModal();
      } else if (selectedImageIndex !== null && selectedImageIndex > indexToRemove) {
        setSelectedImageIndex(selectedImageIndex - 1);
      }

      toast.success("Image removed");

    } catch (error) {
      console.error('Failed to remove image:', error);
      toast.error("Failed to remove image.");
    } finally {
      setSlotLoading(indexToRemove, false);
    }
  };

  // ─── Modal ────────────────────────────────────────────────────────────────

  // ✅ This is the correct openModal — sets selectedImageIndex so transforms work
  const openModal = (index: number) => {
    const imageUrl = images[index]?.file_url;
    if (!imageUrl) return;

    setSelectedImageIndex(index);
    setSelectedImage(imageUrl);
    setOpenImageModal(true);

    // Seed history for this slot if not already seeded
    if (!history.has(index)) {
      const currentTransformations = getTransformationsFromUrl(imageUrl);
      setHistory(prev => {
        const next = new Map(prev);
        next.set(index, [currentTransformations.join(',')]);
        return next;
      });
      setCurrentHistoryIndex(prev => {
        const next = new Map(prev);
        next.set(index, 0);
        return next;
      });
    }
  };

  const closeModal = () => {
    setOpenImageModal(false);
    setActiveEffect(null);
    setSelectedImageIndex(null);
    setSelectedImage('');
  };

  // ─── Transformations ──────────────────────────────────────────────────────

  const applyTransformation = async (transformation: string) => {
    if (selectedImageIndex === null || !selectedImage || processing) return;

    setProcessing(true);
    setActiveEffect(transformation);

    try {
      const currentImage = images[selectedImageIndex];
      if (!currentImage) return;

      const baseUrl = currentImage.file_url.split('?')[0];
      const currentTransformations = getTransformationsFromUrl(currentImage.file_url);

      // Toggle: remove if already active, add if not
      const newTransformations = currentTransformations.includes(transformation)
        ? currentTransformations.filter(t => t !== transformation)
        : [...currentTransformations, transformation];

      const transformedUrl = buildUrl(baseUrl, newTransformations);

      saveToHistory(selectedImageIndex, newTransformations);

      const updatedImages = [...images];
      updatedImages[selectedImageIndex] = { ...currentImage, file_url: transformedUrl };

      setImages(updatedImages);
      setSelectedImage(transformedUrl);
      syncToForm(updatedImages);

    } catch (error) {
      console.error("Transformation failed:", error);
      toast.error("Failed to apply transformation");
    } finally {
      setProcessing(false);
    }
  };

  const undoTransformation = () => {
    if (selectedImageIndex === null || processing) return;

    const imageHistory = history.get(selectedImageIndex);
    const currentIndex = currentHistoryIndex.get(selectedImageIndex) ?? -1;

    if (!imageHistory || currentIndex <= 0) {
      toast.error("Nothing to undo");
      return;
    }

    const previousState = imageHistory[currentIndex - 1];
    const currentImage = images[selectedImageIndex];
    if (!currentImage) return;

    const baseUrl = currentImage.file_url.split('?')[0];
    const transformations = previousState ? previousState.split(',') : [];
    const previousUrl = buildUrl(baseUrl, transformations);

    const updatedImages = [...images];
    updatedImages[selectedImageIndex] = { ...currentImage, file_url: previousUrl };

    setImages(updatedImages);
    setSelectedImage(previousUrl);
    setCurrentHistoryIndex(prev => {
      const next = new Map(prev);
      next.set(selectedImageIndex, currentIndex - 1);
      return next;
    });
    syncToForm(updatedImages);
    setActiveEffect(transformations[transformations.length - 1] || null);
  };

  const redoTransformation = () => {
    if (selectedImageIndex === null || processing) return;

    const imageHistory = history.get(selectedImageIndex);
    const currentIndex = currentHistoryIndex.get(selectedImageIndex) ?? -1;

    if (!imageHistory || currentIndex >= imageHistory.length - 1) {
      toast.error("Nothing to redo");
      return;
    }

    const nextState = imageHistory[currentIndex + 1];
    const currentImage = images[selectedImageIndex];
    if (!currentImage) return;

    const baseUrl = currentImage.file_url.split('?')[0];
    const transformations = nextState ? nextState.split(',') : [];
    const nextUrl = buildUrl(baseUrl, transformations);

    const updatedImages = [...images];
    updatedImages[selectedImageIndex] = { ...currentImage, file_url: nextUrl };

    setImages(updatedImages);
    setSelectedImage(nextUrl);
    setCurrentHistoryIndex(prev => {
      const next = new Map(prev);
      next.set(selectedImageIndex, currentIndex + 1);
      return next;
    });
    syncToForm(updatedImages);
    setActiveEffect(transformations[transformations.length - 1] || null);
  };

  const resetTransformations = () => {
    if (selectedImageIndex === null || !selectedImage || processing) return;

    try {
      const currentImage = images[selectedImageIndex];
      if (!currentImage) return;

      const baseUrl = currentImage.file_url.split('?')[0];
      saveToHistory(selectedImageIndex, []);

      const updatedImages = [...images];
      updatedImages[selectedImageIndex] = { ...currentImage, file_url: baseUrl };

      setImages(updatedImages);
      setSelectedImage(baseUrl);
      setActiveEffect(null);
      syncToForm(updatedImages);

      toast.success("Reset to original image");
    } catch (error) {
      console.error("Reset failed:", error);
      toast.error("Failed to reset image");
    }
  };

  const isTransformationActive = (transformation: string): boolean => {
    if (selectedImageIndex === null) return false;
    const currentImage = images[selectedImageIndex];
    if (!currentImage) return false;
    return getTransformationsFromUrl(currentImage.file_url).includes(transformation);
  };

  const getActiveTransformations = (): string[] => {
    if (selectedImageIndex === null) return [];
    const currentImage = images[selectedImageIndex];
    if (!currentImage) return [];
    return getTransformationsFromUrl(currentImage.file_url);
  };

  // ─── Return ───────────────────────────────────────────────────────────────

  return {
    // State
    images,
    openImageModal,
    processing,
    activeEffect,
    loadingIndexes,       // ✅ replaces pictureUploadLoader
    selectedImage,
    selectedImageIndex,

    // Actions
    handleImageChange,
    handleRemoveImage,
    openModal,            // ✅ pass this to ImagePlaceholder as onOpenModal
    closeModal,
    applyTransformation,
    undoTransformation,
    redoTransformation,
    resetTransformations,
    isTransformationActive,
    getActiveTransformations,

    // Setters (for modal and selected image)
    setImages,
    setOpenImageModal,
    setSelectedImage,
    setSelectedImageIndex,
  };
};
