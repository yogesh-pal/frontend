/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import FormGroup from '@mui/material/FormGroup';
import { FormControlLabel } from '@mui/material';
import {
  ButtonPrimary,
  CenterContainerStyled,
  CheckboxPrimary,
  TextFieldStyled,
  LoadingButtonSecondaryPrimary
} from '../../../../../components/styledComponents';
import {
  TableComponent,
  DialogBox,
  ToastMessage
} from '../../../../../components';
import {
  deviationFieldsStatusColumns
} from '../../helper';
import { Service } from '../../../../../service';
import store from '../../../../../redux/store';

const ApprovalComponent = ({
  searchDetails,
  setIsOpen,
  initalLoanDetailsHandler,
  clickedRow,
  showBtn,
  loading,
  isCertificateViewed,
  openSendBackHandler
}) => {
  const [isEnable, setIsEnabled] = useState(true);
  const [comment, setComment] = useState('');
  const [approvalStatus, setApprovalStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [checkboxOption, setCheckboxOption] = useState([
    {
      name: 'Client Profile, KYC, CUID & OTP verified',
      status: false
    },
    {
      name: 'CIBIL Score (If Applicable) verified',
      status: false
    },
    {
      name: 'Spurious, DPD or any negative tagging verified',
      status: false
    },
    {
      name: 'Last CPV details (If applicable) verified',
      status: false
    },
    {
      name: 'Collateral details & gold valuation verified',
      status: false
    },
    {
      name: 'Scheme verified',
      status: false
    },
    {
      name: 'Disbursement mode, amount & bank account verified',
      status: false
    },
    {
      name: 'Gold Pouch number verified',
      status: false
    },
    {
      name: 'All necessary deviations (If applicable) checked',
      status: false
    },
  ]);
  const state = store.getState();
  const { formData } = state.loanMaker;

  const formDetailsHandler = (type, value, index) => {
    try {
      if (type === 'comment') {
        setComment(value);
        const validStatus = checkboxOption.filter((item) => item.status);
        if (validStatus.length === checkboxOption.length && value?.trim()?.length) {
          setIsEnabled(false);
          return;
        }
        setIsEnabled(true);
      }

      if (type === 'checkbox') {
        const checkboxOptionTemp = checkboxOption;
        checkboxOptionTemp[index].status = value;
        const validStatus = checkboxOptionTemp.filter((item) => item.status);
        if (validStatus.length === checkboxOptionTemp.length && comment.length) {
          setIsEnabled(false);
          return;
        }
        setIsEnabled(true);
        setCheckboxOption(checkboxOptionTemp);
      }
    } catch (e) {
      console.log('Error', e);
    }
  };

  const submitDetailsHandler = async (decision) => {
    try {
      setIsLoading(true);
      const filterApprove = [];
      const { status, data } = await Service.put(`${process.env.REACT_APP_APPLICATION_LOS_CHECKER}/${clickedRow?.application_no}/application_checker`, {
        checker_remarks: comment,
        decision
      });

      if (status === 200) {
        setAlertShow({
          open: true,
          msg: 'Application details updated successfully.',
          alertType: 'success'
        });
        setIsLoading(false);
        setIsOpen({ isCheckerOpen: false, isDeviationOpen: false, isDisbursementOpen: false });
        initalLoanDetailsHandler();
      }
    } catch (e) {
      setIsLoading(false);
      if (e?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else {
        setAlertShow({
          open: true,
          msg: 'Something went wrong while updating application details. Try again',
          alertType: 'error'
        });
      }
      console.log('Error', e);
    }
  };

  const finalSubmitHandler = () => {
    submitDetailsHandler(approvalStatus);
  };

  const handleClose = () => {
    setIsConfirmationOpen(false);
  };

  return (
    <>
      <ToastMessage
        alertShow={alertShow}
        setAlertShow={setAlertShow}
      />
      <DialogBox
        isOpen={isConfirmationOpen}
        title=''
        handleClose={handleClose}
        width='auto'
        padding='40px'
      >
        {
          approvalStatus === 'APPROVE'
            ? 'Are you sure you want to Approve the case?'
            : 'Are you sure you want to Reject the Case?'
        }
        <CenterContainerStyled flexDirection='row' padding='20px 0 0 0'>
          <LoadingButtonSecondaryPrimary
            onClick={finalSubmitHandler}
            variant='contained'
            loading={isLoading}
          >
            Yes
          </LoadingButtonSecondaryPrimary>
          <ButtonPrimary onClick={handleClose}>No</ButtonPrimary>
        </CenterContainerStyled>
      </DialogBox>
      <TableComponent
        rows={searchDetails}
        columns={deviationFieldsStatusColumns}
        checkboxAllowed={false}
        clientPaginationMode={false}
        cursor='pointer'
        display='none'
        hideFooterPagination
        loading={loading?.name === 'TABLE' && loading?.loader}
      />
      {
        showBtn && (
          <>
            <CenterContainerStyled flexDirection='row' padding='20px 0 0 0'>
              <FormGroup>
                {checkboxOption?.map((option, index) => (
                  <FormControlLabel
                    key={option?.name}
                    value={option?.name}
                    control={(
                      <CheckboxPrimary
                        defaultChecked={option?.status}
                        onChange={(e) => {
                          formDetailsHandler('checkbox', e.target.checked, index);
                        }}
                      />
                  )}
                    label={option?.name}
                  />
                ))}
              </FormGroup>
              <FormGroup>
                <TextFieldStyled
                  id='outlined-basic'
                  label='Comment *'
                  variant='outlined'
                  maxRows={4}
                  minRows={3}
                  onChange={(e) => {
                    formDetailsHandler('comment', e.target.value);
                  }}
                  multiline
                />
              </FormGroup>
            </CenterContainerStyled>
            <CenterContainerStyled flexDirection='row' padding='20px 0 0 0'>
              <ButtonPrimary
                disabled={isEnable}
                onClick={() => {
                  if (['BNS', 'AGR'].includes(formData.end_use_loan)) {
                    if (isCertificateViewed) {
                      setApprovalStatus('APPROVE');
                      setIsConfirmationOpen(true);
                    } else {
                      setAlertShow({ open: true, msg: 'Please review Agriculture/Udyam certificates.', alertType: 'error' });
                    }
                  } else {
                    setApprovalStatus('APPROVE');
                    setIsConfirmationOpen(true);
                  }
                }}
              >
                Approve
              </ButtonPrimary>
              <ButtonPrimary
                disabled={isEnable}
                onClick={() => {
                  setApprovalStatus('REJECT');
                  setIsConfirmationOpen(true);
                }}
              >
                Reject
              </ButtonPrimary>
              <ButtonPrimary
                onClick={() => {
                  openSendBackHandler();
                }}
              >
                Send Back
              </ButtonPrimary>
            </CenterContainerStyled>

          </>
        )
              }

    </>
  );
};

export default React.memo(ApprovalComponent);
