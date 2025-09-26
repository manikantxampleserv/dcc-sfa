import {
  Add,
  Close as CloseIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { Box, IconButton, MenuItem, Typography } from '@mui/material';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';

const ManageUsers: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const initialValues = {
    firstName: '',
    userName: '',
    email: '',
    role: '',
    phone1: '',
    phone2: '',
    password: '',
    repeatPassword: '',
    location: '',
  };

  const formik = useFormik({
    initialValues,
    onSubmit: values => {
      const formData = new FormData();
      formData.append('firstName', values.firstName);
      formData.append('userName', values.userName);
      formData.append('email', values.email);
      formData.append('role', values.role);
      formData.append('phone1', values.phone1);
      formData.append('phone2', values.phone2);
      formData.append('password', values.password);
      formData.append('repeatPassword', values.repeatPassword);
      formData.append('location', values.location);
      formData.append('file', uploadedFile!);
      console.log(formData);
    },
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    formik.handleSubmit();
    setDrawerOpen(false);
    setUploadedFile(null);
  };

  const handleCancel = () => {
    setDrawerOpen(false);
    formik.resetForm();
    setUploadedFile(null);
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
  };

  return (
    <div>
      <Button
        variant="contained"
        className="!capitalize"
        disableElevation
        startIcon={<Add />}
        onClick={() => setDrawerOpen(true)}
      >
        Create
      </Button>

      <CustomDrawer
        open={drawerOpen}
        setOpen={setDrawerOpen}
        title="Add New User"
        size="large"
      >
        <Box component="form" onSubmit={handleSubmit} className="p-6">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4 cursor-pointer flex flex-col items-center gap-2 hover:bg-gray-50"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            {uploadedFile ? (
              <div className="flex items-center gap-2">
                <Typography variant="body2">{uploadedFile.name}</Typography>
                <IconButton size="small" onClick={removeUploadedFile}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </div>
            ) : (
              <>
                <UploadIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                <Button variant="contained" sx={{ mb: 1 }}>
                  Upload file
                </Button>
                <Typography variant="body2" color="text.secondary">
                  JPG, GIF or PNG. Max size of 800K
                </Typography>
              </>
            )}
          </div>

          <div className="flex mb-4 sm:flex-row flex-col sm:gap-4 gap-2">
            <Input name="firstName" formik={formik} label="First Name" />
            <Input name="userName" formik={formik} label="User Name" />
          </div>

          <div className="flex mb-4 sm:flex-row flex-col sm:gap-4 gap-2">
            <Input name="email" formik={formik} label="Email" />
            <Select name="role" formik={formik} label="Role">
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="installer">Installer</MenuItem>
              <MenuItem value="technician">Technician</MenuItem>
              <MenuItem value="engineer">Test Engineer</MenuItem>
              <MenuItem value="designer">UI/UX Designer</MenuItem>
            </Select>
          </div>

          <div className="flex mb-4 sm:flex-row flex-col sm:gap-4 gap-2">
            <Input name="phone1" formik={formik} label="Phone 1" />
            <Input name="phone2" formik={formik} label="Phone 2" />
          </div>

          <div className="flex mb-4 sm:flex-row flex-col sm:gap-4 gap-2">
            <Input
              name="password"
              type="password"
              formik={formik}
              label="Password"
            />
            <Input
              name="repeatPassword"
              type="password"
              formik={formik}
              label="Repeat Password"
            />
          </div>

          <Select name="location" label="Location" formik={formik}>
            <MenuItem value="">Select</MenuItem>
            <MenuItem value="office1">Office 1</MenuItem>
            <MenuItem value="office2">Office 2</MenuItem>
            <MenuItem value="remote">Remote</MenuItem>
            <MenuItem value="warehouse">Warehouse</MenuItem>
          </Select>

          <div className="flex gap-4 justify-end pt-4">
            <Button variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Create
            </Button>
          </div>
        </Box>
      </CustomDrawer>
    </div>
  );
};

export default ManageUsers;
