import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackButton = ({ to = '/admin', className = '' }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      className={`flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors ${className}`}
    >
      <ArrowLeft className="w-5 h-5" />
      <span>Quay lại</span>
    </button>
  );
};

export default BackButton; 