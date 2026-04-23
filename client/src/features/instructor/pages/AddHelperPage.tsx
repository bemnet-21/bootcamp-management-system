import React from 'react';
import { useNavigate } from 'react-router-dom';
import HelperModal from '@/src/components/modals/HelperModal';

const AddHelperPage = () => {
  const navigate = useNavigate();
  return <HelperModal onClose={() => navigate('/portal/team')} />;
};

export default AddHelperPage;

