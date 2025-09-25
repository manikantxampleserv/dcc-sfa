import {
  Add,
  Close as CloseIcon,
  Upload as UploadIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  styled,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import CustomDrawer from 'shared/Drawer';

// Styled Components
const FormRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
}));

const UploadArea = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(3),
  textAlign: 'center',
  marginBottom: theme.spacing(2),
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(1),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const PhoneInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '& .MuiInputAdornment-root': {
      marginRight: theme.spacing(1),
    },
  },
}));

const ButtonRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  justifyContent: 'flex-end',
  marginTop: theme.spacing(3),
  paddingTop: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const ManageUsers: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    userName: '',
    email: '',
    role: '',
    phone1: '',
    phone2: '',
    password: '',
    repeatPassword: '',
    location: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Form handlers
  const handleInputChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleSelectChange = (field: string) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Creating user with data:', { ...formData, uploadedFile });
    // Add your API call or user creation logic here
    setDrawerOpen(false);
    // Reset form
    setFormData({
      firstName: '',
      userName: '',
      email: '',
      role: '',
      phone1: '',
      phone2: '',
      password: '',
      repeatPassword: '',
      location: '',
    });
    setUploadedFile(null);
  };

  const handleCancel = () => {
    setDrawerOpen(false);
    // Reset form
    setFormData({
      firstName: '',
      userName: '',
      email: '',
      role: '',
      phone1: '',
      phone2: '',
      password: '',
      repeatPassword: '',
      location: '',
    });
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
        <Box component="form" onSubmit={handleSubmit}>
          {/* File Upload */}
          <UploadArea
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">{uploadedFile.name}</Typography>
                <IconButton size="small" onClick={removeUploadedFile}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              <>
                <UploadIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                <Button variant="contained" color="error" sx={{ mb: 1 }}>
                  Upload file
                </Button>
                <Typography variant="body2" color="text.secondary">
                  JPG, GIF or PNG. Max size of 800K
                </Typography>
              </>
            )}
          </UploadArea>

          {/* First Row - First Name and User Name */}
          <FormRow>
            <TextField
              label="First Name"
              variant="outlined"
              size="small"
              fullWidth
              required
              value={formData.firstName}
              onChange={handleInputChange('firstName')}
            />
            <TextField
              label="User Name"
              variant="outlined"
              size="small"
              fullWidth
              required
              value={formData.userName}
              onChange={handleInputChange('userName')}
            />
          </FormRow>

          {/* Second Row - Email and Role */}
          <FormRow>
            <TextField
              label="Email"
              type="email"
              variant="outlined"
              size="small"
              fullWidth
              required
              value={formData.email}
              onChange={handleInputChange('email')}
            />

            <FormControl size="small" fullWidth required>
              <InputLabel size="small">Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                size="small"
                onChange={handleSelectChange('role')}
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="installer">Installer</MenuItem>
                <MenuItem value="technician">Technician</MenuItem>
                <MenuItem value="engineer">Test Engineer</MenuItem>
                <MenuItem value="designer">UI/UX Designer</MenuItem>
              </Select>
            </FormControl>
          </FormRow>

          {/* Third Row - Phone Numbers */}
          <FormRow>
            <PhoneInput
              label="Phone 1"
              variant="outlined"
              size="small"
              fullWidth
              required
              value={formData.phone1}
              onChange={handleInputChange('phone1')}
            />
            <PhoneInput
              label="Phone 2"
              variant="outlined"
              size="small"
              fullWidth
              value={formData.phone2}
              onChange={handleInputChange('phone2')}
            />
          </FormRow>

          {/* Fourth Row - Passwords */}
          <FormRow>
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              size="small"
              fullWidth
              required
              value={formData.password}
              onChange={handleInputChange('password')}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              label="Repeat Password"
              type={showRepeatPassword ? 'text' : 'password'}
              variant="outlined"
              size="small"
              fullWidth
              required
              value={formData.repeatPassword}
              onChange={handleInputChange('repeatPassword')}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowRepeatPassword(!showRepeatPassword)
                        }
                        edge="end"
                      >
                        {showRepeatPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </FormRow>

          {/* Fifth Row - Location */}
          <FormControl size="small" fullWidth required sx={{ mb: 2 }}>
            <InputLabel size="small">Location</InputLabel>
            <Select
              value={formData.location}
              label="Location"
              size="small"
              onChange={handleSelectChange('location')}
            >
              <MenuItem value="">Select</MenuItem>
              <MenuItem value="office1">Office 1</MenuItem>
              <MenuItem value="office2">Office 2</MenuItem>
              <MenuItem value="remote">Remote</MenuItem>
              <MenuItem value="warehouse">Warehouse</MenuItem>
            </Select>
          </FormControl>

          {/* Action Buttons */}
          <ButtonRow>
            <Button variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="error"
              sx={{ backgroundColor: '#d32f2f' }}
            >
              Create
            </Button>
          </ButtonRow>
        </Box>
      </CustomDrawer>
    </div>
  );
};

export default ManageUsers;
