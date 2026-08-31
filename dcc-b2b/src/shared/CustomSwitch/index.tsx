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
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: '#1D4ED8',
        opacity: 1,
        border: 'none',
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5,
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: '#1D4ED8',
      border: '3px solid #fff',
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color: '#F3F4F6',
      ...theme.applyStyles('dark', {
        color: '#4B5563',
      }),
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: 0.7,
      ...theme.applyStyles('dark', {
        opacity: 0.3,
      }),
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 20,
    height: 20,
    backgroundColor: '#fff',
    transition: theme.transitions.create(['border-color', 'transform'], {
      duration: 200,
    }),
  },
  '& .MuiSwitch-track': {
    borderRadius: 24 / 2,
    backgroundColor: '#DBEAFE',
    opacity: 1,
    transition: theme.transitions.create(['background-color', 'border-color'], {
      duration: 200,
    }),
    ...theme.applyStyles('dark', {
      backgroundColor: '#1E3A8A',
    }),
  },
}));

export default CustomSwitch;
