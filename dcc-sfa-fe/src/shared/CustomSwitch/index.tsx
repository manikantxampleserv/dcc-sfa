import { Switch } from '@mui/material';
import { styled } from '@mui/material/styles';

const CustomSwitch = styled((props: any) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 44,
  height: 24,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '200ms',
    '&.Mui-checked': {
      transform: 'translateX(20px)',
      color: theme.palette.primary.main,
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.primary.main,
        opacity: 0.2,
        border: `2px solid ${theme.palette.primary.main}`,
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.1,
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: theme.palette.primary.main,
      border: '3px solid #fff',
      boxShadow: '0 0 0 6px rgba(25, 118, 210, 0.16)',
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color: theme.palette.grey[300],
      ...theme.applyStyles('dark', {
        color: theme.palette.grey[600],
      }),
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: 0.3,
      ...theme.applyStyles('dark', {
        opacity: 0.1,
      }),
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 20,
    height: 20,
    backgroundColor: '#fff',
    border: '2px solid #E0E0E0',
    transition: theme.transitions.create(['border-color', 'transform'], {
      duration: 200,
    }),
  },
  '& .MuiSwitch-track': {
    borderRadius: 24 / 2,
    backgroundColor: '#F5F5F5',
    border: '2px solid #E0E0E0',
    opacity: 1,
    transition: theme.transitions.create(['background-color', 'border-color'], {
      duration: 200,
    }),
    ...theme.applyStyles('dark', {
      backgroundColor: '#424242',
      borderColor: '#616161',
    }),
  },
}));

export { CustomSwitch };
