import React from 'react';
import { useNavigate } from 'react-router-dom';
import StudentsModal from '@/src/components/modals/StudentsModal';

const AddStudentsPage = () => {
  const navigate = useNavigate();
  return <StudentsModal onClose={() => navigate('/portal/students')} />;
};

export default AddStudentsPage;

