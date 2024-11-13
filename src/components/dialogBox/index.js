import React, { forwardRef } from 'react';
import {
  Slide
} from '@mui/material';
import {
  ButtonTernary,
  ButtonSecondary,
  DialogTitleStyled,
  DialogActionsStyled,
  DialogStyled,
  DialogClose,
  DialogContentStyled,
} from '../styledComponents';

const Transition = forwardRef((props, ref) => <Slide direction='up' ref={ref} {...props} />);

const FormDialog = (props) => {
  const {
    children,
    handleClose,
    isOpen,
    isFooter = false,
    title, fullScreen,
    modalSubmitHandler,
    cancelBtn,
    submitBtn,
    width,
    height,
    customeFooter,
    padding
  } = props;
  return (
    <DialogStyled
      open={isOpen}
      onClose={handleClose}
      TransitionComponent={Transition}
      fullScreen={fullScreen}
      width={width}
    >
      {title && (
        <DialogTitleStyled>
          <span>{title}</span>
          {
            handleClose && (
              <DialogClose
                onClick={handleClose}
              >
                x
              </DialogClose>
            )
          }
        </DialogTitleStyled>
      )}
      <DialogContentStyled height={height} padding={padding}>
        { children }
      </DialogContentStyled>
      {isFooter
        && (
        <DialogActionsStyled>
          {
            customeFooter ? (
              <>
                {
                customeFooter()
                }
              </>
            )
              : (
                <>
                  {handleClose && <ButtonSecondary onClick={handleClose}>{cancelBtn ?? 'Cancel'}</ButtonSecondary>}
                  {modalSubmitHandler && <ButtonTernary onClick={modalSubmitHandler}>{submitBtn ?? 'Submit'}</ButtonTernary>}
                </>
              )
          }
        </DialogActionsStyled>
        )}
    </DialogStyled>
  );
};

export default React.memo(FormDialog);
