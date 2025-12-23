import { Dialog } from '@mui/material';
import React from 'react';

interface ManageSerialProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedEntry: any;
}

const ManageSerial: React.FC<ManageSerialProps> = ({
  isOpen,
  setIsOpen,
  selectedEntry,
}) => {
  const handleClose = () => {
    setIsOpen(false);
  };
  return (
    <>
      <Dialog open={isOpen} onClose={handleClose}>
        ManageSerial
      </Dialog>
    </>
  );
};

export default ManageSerial;
