import React from 'react';
import { useUIStore } from '@/src/store/useUIStore';
import Modal from '@/src/components/ui/Modal';
import { useNavigate } from 'react-router-dom';
import SessionModal from '@/src/components/modals/SessionModal';
import StudentsModal from '@/src/components/modals/StudentsModal';
import ResourceModal from '@/src/components/modals/ResourceModal';
import HelperModal from '@/src/components/modals/HelperModal';
import EditPermissionsModal from '@/src/components/modals/EditPermissionsModal';
import AssignmentModal from '@/src/components/modals/AssignmentModal';
import MoveStudentModal from '@/src/components/modals/MoveStudentModal';
import ConfirmModal from '@/src/components/modals/ConfirmModal';

function parseModalType(modalType: string | null) {
  if (!modalType) return { type: null as string | null, id: null as string | null };
  const [type, ...rest] = modalType.split(':');
  return { type, id: rest.length ? rest.join(':') : null };
}

const ModalHost = () => {
  const { isModalOpen, modalType, closeModal } = useUIStore();
  const { type, id } = parseModalType(modalType);
  const navigate = useNavigate();

  if (!isModalOpen || !type) return null;

  if (type === 'createSession' || type === 'editSession') {
    return <SessionModal mode={type === 'createSession' ? 'create' : 'edit'} sessionId={id} onClose={closeModal} />;
  }

  if (type === 'addStudents') {
    return <StudentsModal onClose={closeModal} />;
  }

  if (type === 'uploadResource') {
    return <ResourceModal onClose={closeModal} />;
  }

  if (type === 'addHelper') {
    return <HelperModal onClose={closeModal} />;
  }

  if (type === 'editPermissions') {
    return <EditPermissionsModal helperId={id} onClose={closeModal} />;
  }

  if (type === 'createAssignment') {
    return <AssignmentModal onClose={closeModal} />;
  }

  if (type === 'grading') {
    return <AssignmentModal onClose={closeModal} assignmentId={id} mode="grade" />;
  }

  if (type === 'moveStudent') {
    return <MoveStudentModal studentId={id} onClose={closeModal} />;
  }

  if (type === 'removeStudent') {
    return (
      <ConfirmModal
        title="Remove student?"
        description="This removes the student from the instructor roster view. This does not delete any backend record."
        confirmLabel="Remove Student"
        tone="danger"
        onClose={closeModal}
        modalId={id}
        actionType="removeStudent"
        afterConfirm={() => navigate('/portal/students')}
      />
    );
  }

  if (type === 'deleteResource') {
    return (
      <ConfirmModal
        title="Delete resource?"
        description="This removes the resource from the library list."
        confirmLabel="Delete Resource"
        tone="danger"
        onClose={closeModal}
        modalId={id}
        actionType="deleteResource"
      />
    );
  }

  return (
    <Modal open title="Action" onClose={closeModal}>
      <div className="rounded-2xl border border-dashed border-blue-200 bg-[#DBEAFE]/20 p-6 text-sm text-slate-600">
        This action is not wired yet.
      </div>
    </Modal>
  );
};

export default ModalHost;
