// hooks/useImageManagement.ts
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import axiosInstance from '../utils/axiosInstance';
import { convertFileToBase64 } from '../utils/convertFile2Base64';
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
  formFieldName = "images" 
}: UseImageManagementProps = {}) => {

  // State
  const [images, setImages] = useState<(UploadedImage | null)[]>([null]);
  const [openImageModal, setOpenImageModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [pictureUploadLoader, setPictureUploadLoader] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  
  // History state for undo/redo
  const [history, setHistory] = useState<Map<number, string[]>>(new Map());
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState<Map<number, number>>(new Map());
  
  const formContext = useFormContext();
  const setValue = formContext?.setValue;

  // Save current transformation state to history
  const saveToHistory = (imageIndex: number, transformations: string[]) => {
    setHistory(prev => {
      const newHistory = new Map(prev);
      const existingHistory = newHistory.get(imageIndex) || [];
      const existingIndex = currentHistoryIndex.get(imageIndex) || -1;
      
       let truncatedHistory;
    
    // ✅ ONLY truncate if we're NOT at the end
    if (existingIndex < existingHistory.length - 1) {
      truncatedHistory = existingHistory.slice(0, existingIndex + 1);
    } else {
      // We're at the end - just use existing history
      truncatedHistory = [...existingHistory];
    }
    
    truncatedHistory.push(transformations.join(','));
    newHistory.set(imageIndex, truncatedHistory);
    
    return newHistory;
  });
    
    setCurrentHistoryIndex(prev => {
      const newIndex = new Map(prev);
      const currentIndex = newIndex.get(imageIndex) || -1;
      newIndex.set(imageIndex, currentIndex + 1);
      return newIndex;
    });
  };

  // Handle image upload
  const handleImageChange = async (file: File | null, index: number) => {
    if (!file) return;
    setPictureUploadLoader(true);
    
    try {
      const fileName = await convertFileToBase64(file);    
      const response = await axiosInstance.post("/product/api/upload-product-image", { fileName });    
             
      const uploadedImage: UploadedImage = {
        fileId: response.data.fileId,
        file_url: response.data.file_url
      };

      setImages((prevImages) => {
        const updated = [...prevImages];
        updated[index] = uploadedImage;
        
        if (index === prevImages.length - 1 && updated.length < maxImages) {
          updated.push(null);
        }
        
        if (setValue) {
          setValue(formFieldName, updated, { shouldDirty: true });
        }
        return updated;
      });
      
      // Reset history for this image when new image is uploaded
      setHistory(prev => {
        const newHistory = new Map(prev);
        newHistory.set(index, []);
        return newHistory;
      });
      
      setCurrentHistoryIndex(prev => {
        const newIndex = new Map(prev);
        newIndex.set(index, -1);
        return newIndex;
      });

    } catch (error) {
      console.error("Upload failed!", error);
      toast.error("Failed to upload image.");
    } finally {
      setPictureUploadLoader(false);
    }
  };

// Handle image removal
const handleRemoveImage = async (indexToRemove: number) => {
  // Prevent multiple rapid deletions
  if (pictureUploadLoader) {
    console.log("Delete already in progress, skipping...");
    return;
  }
  
  setPictureUploadLoader(true);
  
  try {
    const imageToDelete = images[indexToRemove];

    if (imageToDelete?.fileId) {
      try {
        await axiosInstance.delete('/product/api/delete-product-image', {
          data: { fileId: imageToDelete.fileId }
        });
      } catch (deleteError: any) {
        // ✅ Gracefully handle "file does not exist" errors
        const errorMessage = deleteError?.response?.data?.message || deleteError?.message;
        if (errorMessage?.includes('does not exist') || deleteError?.response?.status === 404) {
          console.warn('Image already deleted from server, continuing with cleanup:', imageToDelete.fileId);
          // Don't throw - just continue with local cleanup
        } else {
          // Re-throw other errors
          throw deleteError;
        }
      }
    }

    setImages((prevImages) => {
      const updatedImages = prevImages.filter((_, idx) => idx !== indexToRemove);

      if (updatedImages.length === 0 || !updatedImages.some(img => img === null)) {
        updatedImages.push(null);
      }

      while (updatedImages.length > maxImages) {
        updatedImages.pop();
      }

      if (setValue) {
        setValue(formFieldName, updatedImages, { shouldDirty: true });
      }

      return updatedImages;
    });

    //  Re-index history after removal
    setHistory(prev => {
      const newHistory = new Map<number, string[]>();

      prev.forEach((value, key) => {
        if (key < indexToRemove) {
          newHistory.set(key, value);           // below removed index → unchanged
        } else if (key > indexToRemove) {
          newHistory.set(key - 1, value);       // above removed index → shift down by 1
        }
        // key === indexToRemove → dropped entirely
      });

      return newHistory;
    });

    // ✅ Re-index currentHistoryIndex after removal
    setCurrentHistoryIndex(prev => {
      const newIndex = new Map<number, number>();

      prev.forEach((value, key) => {
        if (key < indexToRemove) {
          newIndex.set(key, value);             // below removed index → unchanged
        } else if (key > indexToRemove) {
          newIndex.set(key - 1, value);         // above removed index → shift down by 1
        }
        // key === indexToRemove → dropped entirely
      });

      return newIndex;
    });

    // ✅ If the removed image was selected, close the modal
    if (selectedImageIndex === indexToRemove) {
      closeModal();
    } else if (selectedImageIndex !== null && selectedImageIndex > indexToRemove) {
      // ✅ Shift selectedImageIndex down if it was above the removed one
      setSelectedImageIndex(selectedImageIndex - 1);
    }

    toast.success("Image removed");

  } catch (error) {
    console.error('Failed to remove image:', error);
    toast.error("Failed to remove image.");
  } finally {
    setPictureUploadLoader(false);
  }
};

  // Open modal for a specific image
  const openModal = (index: number) => {
    const imageUrl = images[index]?.file_url;
    if (imageUrl) {
      setSelectedImageIndex(index);
      setSelectedImage(imageUrl);
      setOpenImageModal(true);
      
      // Initialize history if needed
      if (!history.has(index)) {
        const currentTransformations = getTransformationsFromUrl(imageUrl);
        setHistory(prev => {
          const newHistory = new Map(prev);
          newHistory.set(index, [currentTransformations.join(',')]);
          return newHistory;
        });
        setCurrentHistoryIndex(prev => {
          const newIndex = new Map(prev);
          newIndex.set(index, 0);
          return newIndex;
        });
      }
    }
  };

  // Close modal
  const closeModal = () => {
    setOpenImageModal(false);
    setActiveEffect(null);
    setSelectedImageIndex(null);
    setSelectedImage('');
  };

  // Helper: Extract transformations from URL
  const getTransformationsFromUrl = (url: string): string[] => {
    const urlParts = url.split('?');
    if (!urlParts[1]) return [];
    
    const params = new URLSearchParams(urlParts[1]);
    if (!params.has('tr')) return [];
    
    return params.get('tr')!.split(',');
  };

  // Helper: Build URL from base and transformations
  const buildUrl = (baseUrl: string, transformations: string[]): string => {
    if (transformations.length === 0) return baseUrl;
    return `${baseUrl}?tr=${transformations.join(',')}`;
  };

  // Apply AI transformation to image
  const applyTransformation = async (transformation: string) => {
    if (selectedImageIndex === null || !selectedImage || processing) return;
      setProcessing(true);
      setActiveEffect(transformation);

    try {
      let source = selectedImage;
      
      if (selectedImage.includes("_next/image")) {
        const urlParams = new URLSearchParams(selectedImage.split('?')[1]);
        source = decodeURIComponent(urlParams.get('url') || "");
      }
      
      const currentImage = images[selectedImageIndex];
      if (!currentImage) return;
      
      const currentUrl = currentImage.file_url;
      const baseUrl = currentUrl.split('?')[0];
      
      // Get current transformations
      const currentTransformations = getTransformationsFromUrl(currentUrl);
      
      // Toggle transformation
      const newTransformations = currentTransformations.includes(transformation)
        ? currentTransformations.filter(t => t !== transformation)
        : [...currentTransformations, transformation];
      
      // Build new URL
      const transformedUrl = buildUrl(baseUrl, newTransformations);
      
      // Save to history BEFORE updating
      saveToHistory(selectedImageIndex, newTransformations);
      
      // Update image
      const updatedImages = [...images];
      updatedImages[selectedImageIndex] = {
        ...currentImage,
        file_url: transformedUrl
      };
      
      setImages(updatedImages);
      setSelectedImage(transformedUrl);
      
      if (setValue) {
        setValue(formFieldName, updatedImages, { shouldDirty: true });
      }
      
    } catch (error) {
      console.error("AI Error:", error);
      toast.error("Failed to apply transformation");
    } finally {
      setProcessing(false);
    }
  };

  // Undo last transformation
  const undoTransformation = () => {
    if (selectedImageIndex === null || processing) return;
    
    const imageHistory = history.get(selectedImageIndex);
    const currentIndex = currentHistoryIndex.get(selectedImageIndex) || -1;
    
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
    
    // Update image
    const updatedImages = [...images];
    updatedImages[selectedImageIndex] = {
      ...currentImage,
      file_url: previousUrl
    };
    
    setImages(updatedImages);
    setSelectedImage(previousUrl);
    
    // Update history index
    setCurrentHistoryIndex(prev => {
      const newIndex = new Map(prev);
      newIndex.set(selectedImageIndex, currentIndex - 1);
      return newIndex;
    });
    
    if (setValue) {
      setValue(formFieldName, updatedImages, { shouldDirty: true });
    }
    
    // Update active effect
    const activeTransformation = transformations[transformations.length - 1];
    setActiveEffect(activeTransformation || null);
  };

  // Redo last transformation
  const redoTransformation = () => {
    if (selectedImageIndex === null || processing) return;
    
    const imageHistory = history.get(selectedImageIndex);
    const currentIndex = currentHistoryIndex.get(selectedImageIndex) || -1;
    
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
    
    // Update image
    const updatedImages = [...images];
    updatedImages[selectedImageIndex] = {
      ...currentImage,
      file_url: nextUrl
    };
    
    setImages(updatedImages);
    setSelectedImage(nextUrl);
    
    // Update history index
    setCurrentHistoryIndex(prev => {
      const newIndex = new Map(prev);
      newIndex.set(selectedImageIndex, currentIndex + 1);
      return newIndex;
    });
    
    if (setValue) {
      setValue(formFieldName, updatedImages, { shouldDirty: true });
    }
    
    // Update active effect
    const activeTransformation = transformations[transformations.length - 1];
    setActiveEffect(activeTransformation || null);
  };

  // Reset all transformations for current image
  const resetTransformations = () => {
    if (selectedImageIndex === null || !selectedImage || processing) return;
    
    try {
      const currentImage = images[selectedImageIndex];
      if (!currentImage) return;
      
      const baseUrl = currentImage.file_url.split('?')[0];
      
      // Save to history
      saveToHistory(selectedImageIndex, []);
      
      const updatedImages = [...images];
      updatedImages[selectedImageIndex] = {
        ...currentImage,
        file_url: baseUrl
      };
      
      setImages(updatedImages);
      setSelectedImage(baseUrl);
      setActiveEffect(null);
      
      if (setValue) {
        setValue(formFieldName, updatedImages, { shouldDirty: true });
      }
      
      toast.success("Reset to original image");
      
    } catch (error) {
      console.error("Reset failed:", error);
      toast.error("Failed to reset image");
    }
  };

  // Check if a transformation is active on current image
  const isTransformationActive = (transformation: string): boolean => {
    if (selectedImageIndex === null) return false;
    const currentImage = images[selectedImageIndex];
    if (!currentImage) return false;
    
    const transformations = getTransformationsFromUrl(currentImage.file_url);
    return transformations.includes(transformation);
  };

  // Get active transformations for current image
  const getActiveTransformations = (): string[] => {
    if (selectedImageIndex === null) return [];
    const currentImage = images[selectedImageIndex];
    if (!currentImage) return [];
    
    return getTransformationsFromUrl(currentImage.file_url);
  };

  return {
    // State
    images,
    openImageModal,
    processing,
    activeEffect,
    pictureUploadLoader,
    selectedImage,
    selectedImageIndex,
    
    // Actions
    handleImageChange,
    handleRemoveImage,
    openModal,
    closeModal,
    applyTransformation,
    undoTransformation,      // ← Add this
    redoTransformation,      // ← Add this (optional)
    resetTransformations,    // ← Add this
    isTransformationActive,
    getActiveTransformations,
    
    // Setters
    setImages,
    setOpenImageModal,
    setSelectedImage,
    setSelectedImageIndex,
  };
};