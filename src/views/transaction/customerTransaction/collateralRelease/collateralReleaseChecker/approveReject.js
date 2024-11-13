/* eslint-disable dot-notation */
import moment from 'moment';
import {
  Grid, FormGroup, FormControlLabel,
  DialogContentText, Typography
} from '@mui/material';
import styled from '@emotion/styled';
import List from '@mui/material/List';
import { useForm } from 'react-hook-form';
import ListItem from '@mui/material/ListItem';
import React, { useState, useRef } from 'react';
import { Service } from '../../../../../service';
import { useScreenSize } from '../../../../../customHooks';
import {
  CustomText, CustomDiv, validation, ErrorMessageContainer
} from '../../../helper';
import {
  LoadingButtonPrimary, TextFieldStyled, CheckboxPrimary, CenterContainerStyled,
  LoadingButtonSecondaryPrimary, ButtonPrimary
} from '../../../../../components/styledComponents';
import { DialogBox, ToastMessage, ErrorText } from '../../../../../components';

const ListStyled = styled(List)(({ theme }) => ({
  marginTop: '10px',
  paddingTop: '0px',
  paddingBottom: '0px',
  backgroundColor: theme.input.secondary,
  borderRadius: '5px',
  width: '100%'
}));

const ListItemStyled = styled(ListItem)(() => ({
  paddingTop: '0px',
  paddingBottom: '0px',
  marginTop: '4px',
  marginBottom: '4px',
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between'
}));
const Text = styled(Typography)(() => ({
  padding: '5px 10px',
  fontSize: '17px',
  color: '#502A74',
  fontWeight: 400,
}));
const Atag = styled.a`
  padding: 5px 0px;
  text-decoration: underline;
  color: #502A74!important;
`;

const CollateralReleaseCheckerApproveReject = ({ rowData, closeOnSuccess }) => {
  const [status, setStatus] = useState('');
  const [isLoading, setLoading] = useState({ loader: false, name: null });
  const [alertApvRejShow, setAlertApvRejShow] = useState({ open: false, msg: '' });
  const [isConfirmationOpen, setIsConfirmationOpen] = useState({
    onSubmit: false, onCancel: false
  });
  const [checkboxOption,] = useState([
    {
      name: 'All Documents Checked, Legal Velted',
      status: false,
      id: 'checkbox1'
    },
    {
      name: 'Customer Nominee, Unavailability Checked',
      status: false,
      id: 'checkbox2'
    },
    {
      name: 'Third Party Identity Checked',
      status: false,
      id: 'checkbox3'
    },
    {
      name: 'Due Diligence Completed',
      status: false,
      id: 'checkbox4'
    },
  ]);
  const [checkboxValues, setCheckboxValues] = useState({
    checkbox1: false,
    checkbox2: false,
    checkbox3: false,
    checkbox4: false
  });
  const {
    register, getValues, setValue, formState: { errors }
  } = useForm();
  const loaderRef = useRef();
  const screen = useScreenSize();

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setCheckboxValues({ ...checkboxValues, [name]: checked });
  };

  const isAllChecked = Object.values(checkboxValues).every((value) => value === true);

  const handleConfirmationClose = (event, reason) => {
    if (reason && reason === 'backdropClick') {
      return;
    }
    setIsConfirmationOpen(false);
  };

  const handleApproveRejectConfirmation = (event) => {
    const { value } = event.target;
    setStatus(value);
    if (value === 'APV') {
      setIsConfirmationOpen({ onSubmit: true, onCancel: false });
    } else {
      setIsConfirmationOpen({ onSubmit: false, onCancel: true });
    }
  };
  const handleApproveReject = async () => {
    setIsConfirmationOpen(false);
    try {
      loaderRef.current = true;
      setLoading({ loader: true, name: status === 'APV' ? 'onApprove' : 'onReject' });
      const url = `${process.env.REACT_APP_COLLATERAL_SERVICE}/third-party/checker`;
      const requestBody = {
        loan_account_no: rowData.loanAccountNo,
        checker_remarks: getValues('checker_remarks'),
        status
      };
      const { data } = await Service.post(url, requestBody);
      if (data?.success && data.success) {
        closeOnSuccess({ open: true, msg: data?.message, alertType: 'success' });
      } else {
        console.log('hello');
      }
    } catch (err) {
      if (err?.response?.status === 403) {
        setAlertApvRejShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else if (err?.response?.data?.errors && err.response.data.errors.length) {
        setAlertApvRejShow({ open: true, msg: err.response.data.errors?.[0] ?? 'Something went wrong', alertType: 'error' });
      } else if (err.response.data.message.hasOwnProperty('checker_remarks')) {
        setAlertApvRejShow({ open: true, msg: 'Remarks may not be empty', alertType: 'error' });
      } else if (err.response.data.message.hasOwnProperty('third_party_details')) {
        setAlertApvRejShow({ open: true, msg: err.response.data.message.third_party_details?.[0] ?? 'Something went wrong', alertType: 'error' });
      } else {
        setAlertApvRejShow({ open: true, msg: 'Something went wrong, Please try again.', alertType: 'error' });
      }
    } finally {
      loaderRef.current = false;
      setLoading({ loader: false, name: null });
    }
  };
  const thiryPartyDOB = moment(rowData?.third_party_dob, 'DD/MM/YYYY').format('DD/MM/YYYY');

  const approverRemarks = getValues('checker_remarks');
  return (
    <div>
      <Grid container display='flex' padding='10px 0px'>
        <CustomDiv>
          <CustomText>Release to Third Party : Checker</CustomText>
        </CustomDiv>
        <ToastMessage
          alertShow={alertApvRejShow}
          setAlertShow={setAlertApvRejShow}
        />
        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
          <TextFieldStyled
            id='applicationNo'
            label='LAN'
            defaultValue={rowData?.lan ?? 'NA'}
            disabled
          />
        </Grid>
        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
          <TextFieldStyled
            id='branchId'
            label='Branch Name'
            defaultValue={rowData?.branch_name ?? 'NA'}
            disabled
          />
        </Grid>
        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
          <TextFieldStyled
            id='custmer_name'
            label='Customer Name'
            defaultValue={rowData?.customer_name ?? 'NA'}
            disabled
          />
        </Grid>
        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
          <TextFieldStyled
            id={rowData?.third_party_relationship === 'OTHERS' ? 'others' : 'thrid_party'}
            label='Third Party Relation'
            defaultValue={rowData?.third_party_relationship === 'OTHERS' ? rowData?.third_party_other_relation ?? 'NA' : rowData?.third_party_relationship ?? 'NA'}
            disabled
          />
        </Grid>
      </Grid>
      <Grid container display='flex' padding='10px 0px'>
        <CustomDiv>
          <CustomText>Third Party Detail</CustomText>
        </CustomDiv>
        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
          <TextFieldStyled
            id='name'
            label='Name'
            defaultValue={rowData?.third_party_name ?? 'NA'}
            disabled
          />
        </Grid>
        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
          <TextFieldStyled
            id='dob'
            label='DOB'
            defaultValue={thiryPartyDOB}
            disabled
          />
        </Grid>
        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
          <TextFieldStyled
            id='mobile'
            label='Mobile'
            defaultValue={rowData?.third_party_mobile ?? 'NA'}
            disabled
          />
        </Grid>
        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
          <TextFieldStyled
            id='id_proof'
            label='ID Proof'
            defaultValue={rowData?.third_party_id_type ?? 'NA'}
            disabled
          />
        </Grid>
        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
          <TextFieldStyled
            id='Id Number'
            label='ID Number'
            defaultValue={rowData?.third_party_id_number ?? 'NA'}
            disabled
          />
        </Grid>
        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
          <TextFieldStyled
            id='osv'
            label='OSV Done'
            defaultValue={rowData?.nominee_osv_done ?? false ? 'Yes' : 'No'}
            disabled
          />
        </Grid>
        <Grid
          item
          display='flex'
          flexDirection='column'
          width={['xs', 'sm'].includes(screen) ? '100%' : '50%'}
          alignItems='start'
          padding='10px 20px 10px 20px'
        >
          <CustomText>Third Party Live Photo</CustomText>
          <ListStyled dense={false}>
            <ListItemStyled>
              <Text>
                {`Document
                  ${1}
                  `}
              </Text>
              <Atag href={`/file-preview?path=${rowData?.third_party_live_pic}&isPreSignedUrlRequired=true`} target='_blank'>
                View
              </Atag>
            </ListItemStyled>
          </ListStyled>
        </Grid>
        <Grid
          item
          display='flex'
          flexDirection='column'
          width={['xs', 'sm'].includes(screen) ? '100%' : '50%'}
          alignItems='start'
          padding='10px 20px 10px 20px'
        >
          <CustomText>Multiple Document Live Photo</CustomText>
          <ListStyled dense={false}>
            {rowData?.third_party_doc_live_pic?.split(',').map((item, idx) => (
              <ListItemStyled>
                <Text>
                  {`Document
                  ${idx + 1}
                  `}
                </Text>
                <Atag href={`/file-preview?path=${item}&isPreSignedUrlRequired=true`} target='_blank'>
                  View
                </Atag>
              </ListItemStyled>
            ))}
          </ListStyled>
        </Grid>
        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
          <TextFieldStyled
            id='remarks'
            label='Remarks'
            defaultValue={rowData?.maker_remarks ?? 'NA'}
            disabled
          />
        </Grid>
        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
          <TextFieldStyled
            id='checker_remarks'
            label='Approver Remarks'
            {...register('checker_remarks', {
              onChange: (e) => {
                if (e.target.value.trim().length) {
                  setValue('checker_remarks', e.target.value, { shouldValidate: true });
                } else {
                  setValue('checker_remarks', null, { shouldValidate: true });
                }
              },
              required: 'Please enter remarks',
              maxLength: { value: 30, message: 'Maximum 30 characters allowed' }
            })}
          />
          <ErrorMessageContainer>
            <ErrorText input={validation['checker_remarks']} errors={errors} />
          </ErrorMessageContainer>
        </Grid>
        <Grid continer display='flex' justifyContent='center' alignItems='center' padding='20px' width='100%'>
          <FormGroup>
            {checkboxOption?.map((option) => (
              <FormControlLabel
                key={option?.name}
                value={option?.name}
                control={(
                  <CheckboxPrimary
                    defaultChecked={option?.status}
                    name={option.id}
                    onChange={handleCheckboxChange}
                  />
                  )}
                label={option?.name}
              />
            ))}
          </FormGroup>
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} padding='10px 0px' display='flex' alignItems='center' justifyContent='center'>
          <LoadingButtonPrimary onClick={handleApproveRejectConfirmation} value='APV' disabled={!isAllChecked || getValues('checker_remarks') === '' || getValues('checker_remarks') === null || getValues('checker_remarks') === undefined || (approverRemarks?.length ?? 0) > 30} loading={isLoading.loader && isLoading.name === 'onApprove'} type='submit' minWidth='110px'>
            Approve
          </LoadingButtonPrimary>
          <LoadingButtonPrimary onClick={handleApproveRejectConfirmation} value='REJ' disabled={getValues('checker_remarks') === '' || getValues('checker_remarks') === null || getValues('checker_remarks') === undefined || (approverRemarks?.length ?? 0) > 30} minWidth='110px' loading={isLoading.loader && isLoading.name === 'onReject'}>
            Reject
          </LoadingButtonPrimary>
        </Grid>
        <DialogBox
          isOpen={isConfirmationOpen.onSubmit || isConfirmationOpen.onCancel}
          title=''
          handleClose={handleConfirmationClose}
          width='auto'
          padding='40px'
        >
          <DialogContentText>
            {
                isConfirmationOpen.onSubmit ? 'Are you sure you want to approve the request ?'
                  : 'Are you sure you want to reject the request ?'
            }
          </DialogContentText>
          <CenterContainerStyled flexDirection='row' padding='20px 0 0 0'>
            <LoadingButtonSecondaryPrimary
              onClick={handleApproveReject}
              variant='contained'
              loading={false}
            >
              Yes
            </LoadingButtonSecondaryPrimary>
            <ButtonPrimary onClick={handleConfirmationClose}>No</ButtonPrimary>
          </CenterContainerStyled>
        </DialogBox>
      </Grid>
    </div>
  );
};
export default React.memo(CollateralReleaseCheckerApproveReject, (prevProps, nextProps) => {
  if (prevProps.rowData !== nextProps.rowData) {
    return false;
  }
  return true;
});
