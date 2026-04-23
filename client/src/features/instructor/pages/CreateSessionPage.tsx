import React from 'react';
import { useNavigate } from 'react-router-dom';
import SessionModal from '@/src/components/modals/SessionModal';

const CreateSessionPage = () => {
  const navigate = useNavigate();
  return <SessionModal mode="create" sessionId={null} onClose={() => navigate('/portal/sessions')} />;
};

export default CreateSessionPage;

