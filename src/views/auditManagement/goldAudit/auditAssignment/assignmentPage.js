/* eslint-disable no-nested-ternary */
/* eslint-disable max-len */
import React, { useEffect, useState } from 'react';
import { CircularProgress, DialogContentText } from '@mui/material';
import moment from 'moment';
import {
  CenterContainerStyled, LoadingButtonSecondaryPrimary,
  ButtonPrimary
} from '../../../../components/styledComponents';
import { FormGenerator, ToastMessage, DialogBox } from '../../../../components';
import { assignmentFormConfig, CustomPaddingDiv } from '../../helper';
import { Service } from '../../../../service';

const AssignmentPage = (props) => {
  const {
    selectedRows,
    tableData,
    closeOnSuccess,
    loading,
    setLoading,
    setIsOpen,
    availableAuditType,
  } = props;
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [formConfiguration, setFormConfiguration] = useState(null);
  const [formValues, setFormValues] = useState(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState({ onAssign: false, onCancel: false });

  const formHandler = async (values) => {
    setFormValues(values);
    setIsConfirmationOpen({ onAssign: true, onCancel: false });
  };

  const onCancelHandler = () => {
    setIsConfirmationOpen({ onAssign: false, onCancel: true });
  };

  const getAuditorList = async () => {
    try {
      const internalAuditorGrouping = {};
      const vendorListArray = [];
      const { data } = await Service.get(`${process.env.REACT_APP_USER_SERVICE}/users/auditor/list`);
      if (data?.results && data.results.length) {
        data.results.sort((a, b) => ((a.emp_name.toLowerCase() > b.emp_name.toLowerCase()) ? 1 : ((b.emp_name.toLowerCase() > a.emp_name.toLowerCase()) ? -1 : 0)));
        data.results.forEach((item) => {
          if (item?.goldloan_status) {
            if (internalAuditorGrouping.hasOwnProperty(item.functional_designation)) {
              internalAuditorGrouping[item.functional_designation] = [...internalAuditorGrouping[item.functional_designation], {
                auditorName: item?.emp_name,
                auditorCode: item?.emp_code
              }];
            } else {
              internalAuditorGrouping[item.functional_designation] = [{
                auditorName: item?.emp_name,
                auditorCode: item?.emp_code
              }];
            }
          }
        });
      }
      const res = await Service.get(`${process.env.REACT_APP_USER_SERVICE}/users/vendor/list`);
      if (res.data?.data && res.data?.data.length) {
        res.data.data.forEach((item) => {
          if (item?.is_active) {
            vendorListArray.push({
              vendorName: item?.vendor_name,
              vendorCode: item?.vendor_code
            });
          }
        });
      }
      const filteredAuditTypes = availableAuditType.filter((item) => item.value !== 'all');
      setFormConfiguration(assignmentFormConfig(
        selectedRows.length,
        tableData[0].branchId,
        internalAuditorGrouping,
        vendorListArray,
        onCancelHandler,
        filteredAuditTypes,
      ));
    } catch (err) {
      console.log('err', err);
    }
  };

  useEffect(() => {
    getAuditorList();
  }, []);

  const finalSubmitHandler = async () => {
    try {
      setIsConfirmationOpen(false);
      if (isConfirmationOpen.onAssign) {
        setLoading({ loader: true, name: 'onAssign' });
        const startDate = moment(formValues.startDate).format('YYYY-MM-DD');
        const endDate = moment(formValues.endDate).format('YYYY-MM-DD');
        const auditorEmpcode = formValues?.auditorType === 'Internal' ? formValues?.internalAuditorName : formValues?.externalAuditorName;
        const requestBody = {
          application_no: selectedRows,
          is_all: false,
          lan_count: formValues?.lanCount,
          branch_code: formValues?.branchId,
          assigned_audit_type: formValues?.auditType,
          auditor_empcode: auditorEmpcode,
          start_date: startDate,
          end_date: endDate,
        };
        const { data } = await Service.put(`${process.env.REACT_APP_AUDIT_SERVICE}/assign`, requestBody);
        if (data?.success) {
          closeOnSuccess(data);
        }
      } else {
        setIsOpen(false);
      }
    } catch (err) {
      console.log('error', err);
      if (err?.response?.data?.errors && err.response.data.errors.length) {
        setAlertShow({ open: true, msg: err.response.data.errors[0], alertType: 'error' });
      } else if (err?.response?.data?.errors?.non_field_errors && err.response.data.errors.non_field_errors.length) {
        setAlertShow({ open: true, msg: err.response.data.errors.non_field_errors[0], alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong, Please try again!', alertType: 'error' });
      }
    } finally {
      setLoading({ loader: false, name: null });
    }
  };

  const handleClose = (event, reason) => {
    if (reason && reason === 'backdropClick') {
      return;
    }
    setIsConfirmationOpen(false);
  };

  return (
    <>
      <ToastMessage
        alertShow={alertShow}
        setAlertShow={setAlertShow}
      />
      {formConfiguration ? (
        <>
          <CustomPaddingDiv>
            <FormGenerator
              formDetails={formConfiguration}
              setFormDetails={setFormConfiguration}
              formHandler={formHandler}
              alertShow={alertShow}
              setAlertShow={setAlertShow}
              isLoading={loading.loader && loading.name === 'onAssign'}
            />
          </CustomPaddingDiv>
          <DialogBox
            isOpen={isConfirmationOpen.onAssign || isConfirmationOpen.onCancel}
            title=''
            handleClose={handleClose}
            width='auto'
            padding='40px'
          >
            <DialogContentText>
              {
                isConfirmationOpen.onAssign ? 'Are you sure you want to assign the selected cases to the selected user?'
                  : 'Are you sure you want to cancel the Assignment of selected cases to the user?'
            }
            </DialogContentText>
            <CenterContainerStyled flexDirection='row' padding='20px 0 0 0'>
              <LoadingButtonSecondaryPrimary
                onClick={finalSubmitHandler}
                variant='contained'
                loading={false}
              >
                Yes
              </LoadingButtonSecondaryPrimary>
              <ButtonPrimary onClick={handleClose}>No</ButtonPrimary>
            </CenterContainerStyled>
          </DialogBox>
        </>
      ) : (
        <CenterContainerStyled padding='40px'>
          <CircularProgress color='secondary' />
        </CenterContainerStyled>
      )}
    </>
  );
};
export default React.memo(AssignmentPage);
