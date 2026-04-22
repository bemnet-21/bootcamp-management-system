import React from 'react';
import { useNavigate } from 'react-router-dom';
import ResourceModal from '@/src/components/modals/ResourceModal';

const UploadResourcePage = () => {
  const navigate = useNavigate();
  return <ResourceModal onClose={() => navigate('/portal/resources')} />;
};

export default UploadResourcePage;

