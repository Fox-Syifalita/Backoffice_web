import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ 
  title, 
  isOpen, 
  onClose, 
  children, 
  size = 'md',
  showDefaultButtons = false,
  customButtons = null,
  footerContent = null
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg shadow-xl w-full mx-4 ${sizeClasses[size]}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {children}
        </div>

        {/* Footer */}
        {(customButtons || footerContent || showDefaultButtons) && (
          <div className="px-4 py-3 bg-gray-50 border-t rounded-b-lg">
            {customButtons && (
              <div className="flex justify-end space-x-3">
                {customButtons}
              </div>
            )}
            
            {footerContent && footerContent}
            
            {showDefaultButtons && !customButtons && !footerContent && (
              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Simpan
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;