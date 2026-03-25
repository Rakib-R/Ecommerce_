// hooks/useImageManagement.ts
import { useState, useRef } from 'react';
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
      
      // If we're not at the end, truncate the history
      const truncatedHistory = existingHistory.slice(0, existingIndex + 1);
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
  const handleRemoveImage = async (index: number) => {
    try {
      const imageToDelete = images[index];
      
      if (imageToDelete && typeof imageToDelete === 'object') {
        await axiosInstance.delete('/product/api/delete-product-image', {
          data: { fileId: imageToDelete.fileId }
        });
      }
      
      setImages((prevImages) => {
        const updatedImages = [...prevImages];
        
        if (index === 0) {
          updatedImages[0] = null;
        } else {
          updatedImages.splice(index, 1);
        }
        
        if (!updatedImages.includes(null) && updatedImages.length < maxImages) {
          updatedImages.push(null);
        }
        
        if (setValue) {
          setValue(formFieldName, updatedImages, { shouldDirty: true });
        }
        
        return updatedImages;
      });
      
      // Clear history for removed image
      setHistory(prev => {
        const newHistory = new Map(prev);
        newHistory.delete(index);
        return newHistory;
      });
      
      setCurrentHistoryIndex(prev => {
        const newIndex = new Map(prev);
        newIndex.delete(index);
        return newIndex;
      });
      
    } catch (error) {
      console.error('Failed to remove image:', error);
      toast.error("Failed to remove image.");
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