import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import PopupState, { bindTrigger, bindPopover } from 'material-ui-popup-state';
import { styled } from '@mui/material/styles';
import { icons } from '../icons';

const ButtonStyled = styled(Button)(({ theme }) => ({
  color: theme?.button?.primary,
  width: '40px',
  padding: '0',
  minWidth: '0',
  height: '40px',
  borderRadius: '100%',
  backgroundColor: theme?.button?.secondary,
  border: `2px solid  ${theme?.button?.primary}`,
  '&:hover': {
    color: theme?.button?.ternary,
    backgroundColor: theme?.button?.primary,
    border: `2px solid  ${theme?.button?.secondary}`,
  }
}));

const PopoverComponent = ({ children }) => (
  <PopupState variant='popover' popupId='demo-popup-popover'>
    {(popupState) => (
      <div>
        <ButtonStyled variant='contained' {...bindTrigger(popupState)}>
          {
           icons.fileUploadOutlinedIcon
          }
        </ButtonStyled>
        <Popover
          {...bindPopover(popupState)}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'top',
          }}
        >
          { children}
        </Popover>
      </div>
    )}
  </PopupState>
);

export default PopoverComponent;
