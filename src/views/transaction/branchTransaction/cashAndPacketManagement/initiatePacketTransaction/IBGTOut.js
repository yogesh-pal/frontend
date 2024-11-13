/* eslint-disable max-len */
/* eslint-disable react/jsx-curly-brace-presence */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { useForm } from 'react-hook-form';
import {
  CircularProgress, FormControlLabel, FormHelperText, Grid, InputAdornment
} from '@mui/material';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { HeadingMaster2 } from '../../../helper';
import {
  AutoCompleteStyled, CenterContainerStyled, CheckboxPrimary, LoadingButtonPrimary, SelectMenuStyle, TextFieldStyled
} from '../../../../../components/styledComponents';
import { ToastMessage } from '../../../../../components';
import {
  MAKER, ACKNOWLEDGER, APPROVER, GOLDVALUER, BRANCHMANAGER, ASSISTANTBRANCHMANAGER,
  REGIONALMANAGER, AREAMANAGER, CASHPACKET, ModesofTransprt, TransferingPersonColumns, GoldPacketColumns, handleError, remarkHeader, getTotalPOS, getCount, isGuardRequired, statuses
} from './constants';
import { Service } from '../../../../../service';
import TransactionTable from '../../../table';
import { REGEX } from '../../../../../constants';
import { useIBGTMaker } from './hooks';

const CustomForm = styled.form`
  padding: 20px 0px;
`;

const InputGrid = styled(Grid)`
`;

const Maker = (props) => {
  const { isRoleGVorABMorBM, rowData, handleClose } = props;
  const [pageSize, setPageSize] = useState(15);
  const navigate = useNavigate();
  const {
    register, handleSubmit, setValue, getValues, resetField, formState: { errors }, trigger
  } = useForm();

  const amountFormat = Intl.NumberFormat('en-IN');
  const { selectedBranch } = useSelector((state) => state.user.userDetails);

  let userType;
  if (isRoleGVorABMorBM) {
    if (selectedBranch === rowData?.packetToBranch) {
      userType = ACKNOWLEDGER;
    } else {
      userType = MAKER;
    }
  } else {
    // assumption than branch of user is same as packet from branch
    userType = APPROVER;
  }

  const {
    transactionData, transformingPerson,
    goldPackets, handleLandeletion, alertShow, setAlertShow, loading,
    setLoading, branchList, handleEmpaddition,
    handleLANaddition, fetchModes, handleSelectionModelChange, getIBGTStatus, handleEmpdeletion
  } = useIBGTMaker({
    trigger, getValues, resetField, selectedBranch, userType, setValue, rowData
  });

  const onPageChange = (newPageNo) => console.log(newPageNo);

  const showPreviewOnly = () => {
    let isPreviewOnly = false;
    const currentStatus = getIBGTStatus(rowData?.status);
    if ([statuses.ACKNOWLEDGER_APPROVED, statuses.ACKNOWLEDGER_REJECTED, statuses.ACKNOWLEDGER_PARTIAL_APPROVED, statuses.APPROVER_REJECTED].includes(currentStatus)) {
      isPreviewOnly = true;
    } else if ([statuses.APPROVER_APPROVED].includes(currentStatus) && userType !== ACKNOWLEDGER) {
      isPreviewOnly = true;
    }
    // if (userType === MAKER && ([statuses.ACKNOWLEDGER_APPROVED, statuses.ACKNOWLEDGER_REJECTED, statuses.ACKNOWLEDGER_PARTIAL_APPROVED].includes(currentStatus))) {
    //   isPreviewOnly = true;
    // }
    // if (userType === APPROVER && ([statuses.ACKNOWLEDGER_APPROVED, statuses.ACKNOWLEDGER_REJECTED, statuses.ACKNOWLEDGER_PARTIAL_APPROVED].includes(currentStatus))) {
    //   isPreviewOnly = true;
    // }
    // if (userType === APPROVER && ([statuses.APPROVER_APPROVED, statuses.APPROVER_REJECTED].includes(currentStatus))) {
    //   isPreviewOnly = true;
    // }
    // if (userType === ACKNOWLEDGER && ([statuses.ACKNOWLEDGER_APPROVED, statuses.ACKNOWLEDGER_REJECTED, statuses.ACKNOWLEDGER_PARTIAL_APPROVED].includes(currentStatus))) {
    //   isPreviewOnly = true;
    // }
    return isPreviewOnly;
  };
  const isPreviewOnly = showPreviewOnly();

  const handleMakerSubmit = async () => {
    try {
      const totalPOS = getTotalPOS(goldPackets);
      if (totalPOS === 0) {
        setAlertShow({ open: true, msg: 'Please select atleast one packet to transfer', alertType: 'error' });
        return;
      }
      if (totalPOS <= 1000000) {
        const isBMOrABMOrGV = transformingPerson.findIndex((item) => item.funcDesignation === BRANCHMANAGER || item.funcDesignation === ASSISTANTBRANCHMANAGER || item.funcDesignation === GOLDVALUER);
        if (isBMOrABMOrGV === -1) {
          setAlertShow({ open: true, msg: 'BM/ABM/GV is required as Transfering person for amount less than 10L.', alertType: 'error' });
          return;
        }
        if (transformingPerson.length !== 1) {
          setAlertShow({ open: true, msg: 'Only one Transfering person is allowed for amount less than 10L.', alertType: 'error' });
          return;
        }
      } else if (totalPOS <= 2500000) {
        if (transformingPerson.length !== 2) {
          setAlertShow({ open: true, msg: 'Only two Transfering persons are allowed for amount less than 25L.', alertType: 'error' });
          return;
        }
        const AMcount = getCount(transformingPerson, 'funcDesignation', AREAMANAGER);
        const BMcount = getCount(transformingPerson, 'funcDesignation', BRANCHMANAGER);
        const ABMcount = getCount(transformingPerson, 'funcDesignation', ASSISTANTBRANCHMANAGER);
        const GVcount = getCount(transformingPerson, 'funcDesignation', GOLDVALUER);
        if (AMcount > 1 || BMcount > 1 || ABMcount > 1 || GVcount > 1 || (AMcount + BMcount + ABMcount + GVcount !== 2)) {
          setAlertShow({ open: true, msg: 'AM/BM/ABM/GV is allowed as Transfering Person for amount less than 25L. No two persons should have same designation.', alertType: 'error' });
          return;
        }
      } else {
        if (transformingPerson.length !== 2) {
          setAlertShow({ open: true, msg: 'Only two Transfering persons are allowed for amount greater than 25L.', alertType: 'error' });
          return;
        }
        const RMcount = getCount(transformingPerson, 'funcDesignation', REGIONALMANAGER);
        const AMcount = getCount(transformingPerson, 'funcDesignation', AREAMANAGER);
        if ((RMcount < 1 && AMcount < 1) || (RMcount + AMcount > 1)) {
          setAlertShow({ open: true, msg: 'Any one from RM/AM must be present as Tranfering Person for amount greater than 25L', alertType: 'error' });
          return;
        }
        // control is here means there is atleast one RM or AM for sure. I need to check for 1 person from BM/ABM/GV
        const BMcount = getCount(transformingPerson, 'funcDesignation', BRANCHMANAGER);
        const ABMcount = getCount(transformingPerson, 'funcDesignation', ASSISTANTBRANCHMANAGER);
        const GVcount = getCount(transformingPerson, 'funcDesignation', GOLDVALUER);
        // if one person left is neither BM nor ABM nor GV then error
        if (BMcount !== 1 && ABMcount !== 1 && GVcount !== 1) {
          setAlertShow({ open: true, msg: 'Any one from BM/ABM/Gold Valuer must be present as Transfering Person for amount greater than 25L.', alertType: 'error' });
          return;
        }
      }
      setLoading({ loader: true, name: 'submission' });
      const payload = {
        transaction_id: transactionData?.txnNo,
        lans_list: goldPackets.map((item) => ({ [item.lan]: item.token })),
        packet_qty: goldPackets.length,
        amount: totalPOS,
        packet_to_branch: getValues('goldPacketToBranch'),
        transferors: transformingPerson.map((item) => ({ emp_code: item.empID, emp_name: item.empName, func_des: item.funcDesignation })),
        mode: getValues('mode'),
        maker_remarks: getValues('remarks'),
      };
      if (payload.mode !== ModesofTransprt['Public Transport']) {
        payload.vehicle_details = getValues('vehicleRegNum');
      }
      if (totalPOS > 1000000) {
        payload.armed_guard_opt = getValues('armedGuard');
      }
      await Service.post(process.env.REACT_APP_IBGT_MAKER_SUBMIT, payload);
      setAlertShow({ open: true, msg: `IBGT Packet transfer count of Quantity ${goldPackets.length} for Branch ${selectedBranch} has been submitted for Approval` });
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      console.log(err);
      const errorMessage = handleError(err);
      setAlertShow({ open: true, msg: errorMessage, alertType: 'error' });
      setLoading({ loader: false, name: null });
    }
  };

  const renderError = (name) => {
    if (errors?.[name]) {
      return <FormHelperText error>{errors?.[name].message}</FormHelperText>;
    }
  };

  const handleApprover = async (status) => {
    try {
      const validate = await trigger('remarks');
      if (!validate) return;
      setLoading({ loader: true, name: 'submission' });
      const payload = {
        transaction_id: transactionData.txnNo,
        current_checker_remarks: getValues('remarks'),
        status
      };
      await Service.patch(process.env.REACT_APP_IBGT_CHECKER_SUBMIT, payload);
      if (status === statuses.APPROVER_APPROVED) {
        setAlertShow({ open: true, msg: `IBGT Packet transfer count of Quantity ${goldPackets.length} for Branch ${selectedBranch} has been Approved` });
      }
      setTimeout(() => {
        navigate(CASHPACKET);
      }, status === statuses.APPROVER_APPROVED ? 1000 : 0);
    } catch (err) {
      const errorMessage = handleError(err);
      setAlertShow({ open: true, msg: errorMessage, alertType: 'error' });
      setLoading({ loader: false, name: null });
    }
  };

  const handleAcknowledger = async (status) => {
    try {
      const validate = await trigger(['remarks', 'acknowledge']);
      if (!validate) return;
      const isAtleastOneSelected = goldPackets.some((item) => item.selected);
      if (!isAtleastOneSelected && status !== statuses.ACKNOWLEDGER_REJECTED) {
        setAlertShow({ open: true, msg: 'Please select atleast one LAN packet to acknowledge', alertType: 'error' });
        return;
      }
      setLoading({ loader: true, name: 'submission' });
      const isPartialApproval = goldPackets.some((item) => item.selected === false);
      let payload = null;
      if (status !== statuses.ACKNOWLEDGER_REJECTED && isPartialApproval) {
        const selectedPackets = goldPackets.filter((item) => item.selected);
        payload = {
          transaction_id: transactionData?.txnNo,
          current_checker_remarks: getValues('remarks'),
          status: statuses.ACKNOWLEDGER_PARTIAL_APPROVED,
          amount: getTotalPOS(selectedPackets),
          packet_qty: selectedPackets.length,
          lan_acknowledgement_status_list: goldPackets.map((item) => ({ [item.lan]: item.selected })),
        };
      } else {
        payload = {
          transaction_id: transactionData.txnNo,
          current_checker_remarks: getValues('remarks'),
          status
        };
      }
      await Service.patch(process.env.REACT_APP_IBGT_CHECKER_SUBMIT, payload);
      if (status === statuses.ACKNOWLEDGER_REJECTED) {
        setAlertShow({ open: true, msg: `Acknowledgement of the  Packet in transaction of Quantity ${goldPackets.length} for Branch ${transactionData.packetFromBranch} has been rejected` });
      } else {
        setAlertShow({ open: true, msg: `Acknowledgement of the  Packet in transaction of Quantity ${goldPackets.length} for Branch ${transactionData.packetFromBranch} is successful` });
      }
      setTimeout(() => {
        navigate(CASHPACKET);
      }, 1000);
    } catch (err) {
      const errorMessage = handleError(err);
      setAlertShow({ open: true, msg: errorMessage, alertType: 'error' });
      setLoading({ loader: false, name: null });
    }
  };

  const submissionUserMapping = {
    MAKER: {
      accept: {
        name: 'Submit',
        func: handleMakerSubmit
      },
      reject: {
        name: 'Cancel',
        func: () => navigate(CASHPACKET)
      }
    },
    APPROVER: {
      accept: {
        name: 'Approve',
        func: () => handleApprover(statuses.APPROVER_APPROVED)
      },
      reject: {
        name: 'Reject',
        func: () => { handleApprover(statuses.APPROVER_REJECTED); }
      }
    },
    ACKNOWLEDGER: {
      accept: {
        name: 'Acknowledged & Received',
        func: () => handleAcknowledger(statuses.ACKNOWLEDGER_APPROVED)
      },
      reject: {
        name: 'Reject',
        func: () => handleAcknowledger(statuses.ACKNOWLEDGER_REJECTED)
      }
    }
  };

  const readOnlyField = (val) => (
    <TextFieldStyled
      label=''
      multiline
      maxRows={2}
      defaultValue={val}
      disabled
    />
  );

  return (
    <>
      <ToastMessage
        alertShow={alertShow}
        setAlertShow={setAlertShow}
      />
      {
      loading.loader && loading.name === 'onLoad' ? (
        <CenterContainerStyled padding='40px'>
          <CircularProgress color='secondary' />
        </CenterContainerStyled>
      ) : (
        <CustomForm onSubmit={handleSubmit(submissionUserMapping[userType].accept.func)}>
          <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
            <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
              <HeadingMaster2>Transaction Number</HeadingMaster2>
            </Grid>
            <InputGrid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
              {readOnlyField(transactionData?.txnNo)}
            </InputGrid>
          </Grid>
          <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
            <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
              <HeadingMaster2>Type</HeadingMaster2>
            </Grid>
            <InputGrid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
              {readOnlyField(transactionData?.type)}
            </InputGrid>
          </Grid>
          <InputGrid item xs={6} justifyContent='center' padding='10px'>
            <Grid container display='flex' justifyContent='center'>
              <Grid item xs={4}>
                <TextFieldStyled
                  label='Enter LAN'
                  defaultValue=''
                  value={getValues('lan')}
                  disabled={userType !== MAKER || isPreviewOnly}
                  isDisabled={userType !== MAKER || isPreviewOnly}
                  {...register('lan', {
                    onChange: (e) => { setValue('lan', e.target.value, { shouldValidate: true }); },
                    pattern: { value: REGEX.NUMBER, message: 'Please enter valid LAN' },
                    maxLength: { value: 20, message: 'LAN should not be more than 20 digits' },
                    minLength: { value: 1, message: 'Please provide a LAN.' }
                  })}
                />
                {renderError('lan')}
              </Grid>
              <Grid>
                <LoadingButtonPrimary
                  variant='contained'
                  loading={loading.loader && loading.name === 'lanAddition'}
                  disabled={!getValues('lan') || getValues('lan').trim() === '' || userType !== MAKER}
                  onClick={handleLANaddition}
                >
                  Add
                </LoadingButtonPrimary>
              </Grid>

            </Grid>
          </InputGrid>
          <Grid container padding='10px' justifyContent='center'>
            <Grid item xs={12} sm={8}>
              <TransactionTable
                checkboxAllowed={userType === ACKNOWLEDGER || isPreviewOnly}
                onSelectionModelChange={handleSelectionModelChange}
                rows={goldPackets}
                selectedRowIDs={goldPackets.filter((packet) => packet.selected).map((packet) => packet.id)}
                columns={GoldPacketColumns(userType, handleLandeletion, isPreviewOnly)}
                clientPaginationMode
                pageSizeNumber={pageSize}
                onPageChange={onPageChange}
                onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              />
            </Grid>
          </Grid>
          <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
            <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
              <HeadingMaster2>Packet Quantity</HeadingMaster2>
            </Grid>
            <InputGrid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
              {readOnlyField(goldPackets.length)}
            </InputGrid>
          </Grid>
          <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
            <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
              <HeadingMaster2>Amount</HeadingMaster2>
            </Grid>
            <InputGrid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
              <TextFieldStyled
                label=''
                InputProps={{
                  startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>
                }}
                value={amountFormat.format(getTotalPOS(goldPackets))}
                disabled
              />
            </InputGrid>
          </Grid>

          <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
            <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
              <HeadingMaster2>Category</HeadingMaster2>
            </Grid>
            <InputGrid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
              {readOnlyField(transactionData?.category)}
            </InputGrid>
          </Grid>

          <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
            <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
              <HeadingMaster2>Packet To Branch</HeadingMaster2>
            </Grid>
            <InputGrid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
              <AutoCompleteStyled
                {...register('goldPacketToBranch', {
                  required: 'Please select Packet to branch'
                })}
                options={branchList}
                disabled={userType !== MAKER || isPreviewOnly}
                defaultValue={transactionData?.packetToBranch}
                onChange={(event, newValue) => setValue('goldPacketToBranch', newValue?.value, { shouldValidate: true })}
                renderOption={(prop, item) => (
                  <SelectMenuStyle {...prop} value={item.value}>
                    {item.label}
                  </SelectMenuStyle>
                )}
                renderInput={(params) => <TextFieldStyled {...params} label='Packet to Branch*' placeholder='Select' />}
              />
              {renderError('goldPacketToBranch')}
            </InputGrid>
          </Grid>

          <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
            <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
              <HeadingMaster2>Packet From Branch</HeadingMaster2>
            </Grid>
            <InputGrid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
              {readOnlyField(transactionData?.packetFromBranch)}
            </InputGrid>
          </Grid>

          <InputGrid item xs={6} padding='10px'>
            <Grid container display='flex' justifyContent='center'>
              <Grid item xs={4}>
                <TextFieldStyled
                  label='Enter Employee ID'
                  disabled={userType !== MAKER || isPreviewOnly}
                  value={getValues('empID')}
                  isDisabled={userType !== MAKER}
                  {...register('empID', {
                    onChange: (e) => {
                      setValue('empID', e.target.value.trim(), { shouldValidate: true });
                    },
                    pattern: { value: REGEX.ALPHANUMERIC, message: 'Please enter valid Employee ID' },
                  })}
                />
                {renderError('empID')}
              </Grid>
              <Grid item>
                <LoadingButtonPrimary
                  variant='contained'
                  loading={loading.loader && loading.name === 'empAddition'}
                  disabled={!getValues('empID') || getValues('empID').trim() === '' || userType !== MAKER}
                  onClick={handleEmpaddition}
                >
                  Add
                </LoadingButtonPrimary>
              </Grid>

            </Grid>

          </InputGrid>
          <Grid container padding='10px' justifyContent='center'>
            <Grid item xs={12} sm={8}>
              <TransactionTable
                rows={transformingPerson}
                columns={TransferingPersonColumns(userType, handleEmpdeletion, isPreviewOnly)}
                clientPaginationMode
                hideFooter
              />
            </Grid>
          </Grid>
          <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
            <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
              <HeadingMaster2>Mode</HeadingMaster2>
            </Grid>
            <InputGrid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
              <TextFieldStyled
                label='Mode*'
                select
                disabled={userType !== MAKER || isPreviewOnly}
                value={transactionData?.mode || getValues('mode')}
                defaultValue={transactionData?.mode}
                {...register('mode', {
                  onChange: (e) => setValue('mode', e.target.value, { shouldValidate: true }),
                  required: 'Please select mode.'
                })}
              >
                {
                  fetchModes().map((item) => (
                    <SelectMenuStyle key={item.value} value={item.value}>
                      {item.label}
                    </SelectMenuStyle>
                  ))
                }
              </TextFieldStyled>
              {renderError('mode')}
            </InputGrid>
          </Grid>
          { isGuardRequired(goldPackets)
            ? (
              <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
                <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                  <HeadingMaster2>Armed Guard</HeadingMaster2>
                </Grid>
                <InputGrid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                  <TextFieldStyled
                    label='Armed Guard*'
                    select
                    disabled={userType !== MAKER || isPreviewOnly}
                    isDisabled={userType !== MAKER || isPreviewOnly}
                    defaultValue={transactionData?.armedGuard}
                    {...register('armedGuard', {
                      onChange: (e) => setValue('armedGuard', e.target.value, { shouldValidate: true }),
                      required: 'Please select Armed Guard.'
                    })}
                  >
                    {
                  [{ label: 'YES', value: 'YES' }, { label: 'NO', value: 'NO' }].map((item) => (
                    <SelectMenuStyle key={item.value} value={item.value}>
                      {item.label}
                    </SelectMenuStyle>
                  ))
                }
                  </TextFieldStyled>
                  {renderError('armedGuard')}
                </InputGrid>
              </Grid>
            ) : null}
          {
              [ModesofTransprt['Hired Vehicle'], ModesofTransprt['Own Car'], ModesofTransprt['Two-Wheeler']].includes(getValues('mode'))
                ? (
                  <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
                    <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                      <HeadingMaster2>Vehicle Registration Number</HeadingMaster2>
                    </Grid>
                    <InputGrid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                      <TextFieldStyled
                // label='*Remarks'
                        placeholder='Vehicle Registration Number*'
                        maxRows={3}
                        disabled={userType !== MAKER || isPreviewOnly}
                        defaultValue={transactionData?.vehicleRegNum}
                        multiline
                        {...register('vehicleRegNum', {
                          onChange: (e) => {
                            if (e.target.value.trim().length) {
                              setValue('vehicleRegNum', e.target.value, { shouldValidate: true });
                            } else {
                              setValue('vehicleRegNum', null, { shouldValidate: true });
                            }
                          },
                          required: 'Please enter Vehicle Registration Number',
                        })}
                      />
                      {renderError('vehicleRegNum')}
                    </InputGrid>
                  </Grid>
                ) : null
}
          {(userType !== MAKER || isPreviewOnly) ? (
            <>
              <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
                <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                  <HeadingMaster2>Maker Name</HeadingMaster2>
                </Grid>
                <InputGrid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>

                  {readOnlyField(transactionData?.makerName)}
                </InputGrid>
              </Grid>
              <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
                <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                  <HeadingMaster2>Maker Remarks</HeadingMaster2>
                </Grid>
                <InputGrid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>

                  {readOnlyField(transactionData?.makerRemarks)}
                </InputGrid>
              </Grid>
            </>
          ) : null}
          {(rowData?.status && [statuses.ACKNOWLEDGER_APPROVED, statuses.ACKNOWLEDGER_REJECTED, statuses.ACKNOWLEDGER_PARTIAL_APPROVED, statuses.APPROVER_APPROVED, statuses.APPROVER_REJECTED].includes(getIBGTStatus(rowData.status)))
            ? (
              <>
                <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
                  <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                    <HeadingMaster2>Approver Name</HeadingMaster2>
                  </Grid>
                  <InputGrid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>

                    {readOnlyField(transactionData?.approverName)}
                  </InputGrid>
                </Grid>
                <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
                  <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                    <HeadingMaster2>Approver Remarks</HeadingMaster2>
                  </Grid>
                  <InputGrid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>

                    {readOnlyField(transactionData?.approverRemarks)}
                  </InputGrid>
                </Grid>
              </>
            ) : null}
          {(rowData?.status && [statuses.ACKNOWLEDGER_APPROVED, statuses.ACKNOWLEDGER_REJECTED, statuses.ACKNOWLEDGER_PARTIAL_APPROVED].includes(getIBGTStatus(rowData.status)))
            ? (
              <>
                <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
                  <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                    <HeadingMaster2>Acknowledger Name</HeadingMaster2>
                  </Grid>
                  <InputGrid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>

                    {readOnlyField(transactionData?.acknowledgerName)}
                  </InputGrid>
                </Grid>
                <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
                  <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                    <HeadingMaster2>Acknowledger Remarks</HeadingMaster2>
                  </Grid>
                  <InputGrid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>

                    {readOnlyField(transactionData?.acknowledgerRemarks)}
                  </InputGrid>
                </Grid>
              </>
            ) : null}
          {
              (!rowData?.status
              || !isPreviewOnly)
                ? (
                  <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
                    <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                      <HeadingMaster2>{remarkHeader[userType]}</HeadingMaster2>
                    </Grid>
                    <InputGrid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                      <TextFieldStyled
                        placeholder='Remarks*'
                        defaultValue={transactionData?.remarks}
                        maxRows={3}
                        multiline
                        {...register('remarks', {
                          onChange: (e) => {
                            if (e.target.value.trim().length) {
                              setValue('remarks', e.target.value, { shouldValidate: true });
                            } else {
                              setValue('remarks', null, { shouldValidate: true });
                            }
                          },
                          required: 'Please enter remarks',
                          maxLength: { value: 30, message: 'Maximum 30 characters allowed' }
                        })}
                      />
                      {renderError('remarks')}
                    </InputGrid>
                  </Grid>
                ) : null
}
          {
            (userType === ACKNOWLEDGER || isPreviewOnly)
              ? (
                <Grid container justifyContent='center' padding='0 10px'>
                  <Grid item xs={10} padding='0 10px' display='flex' flexDirection='column' alignItems='baseline'>
                    <FormControlLabel
                      control={(
                        <CheckboxPrimary
                          sx={{ '& .MuiSvgIcon-root': { fontSize: 36 } }}
                          disableRipple
                          {...register('acknowledge', {
                            required: 'Please acknowledge the details',
                            onChange: (e) => {
                              setValue('acknowledge', e.target.checked, {
                                shouldValidate: true
                              });
                            }
                          })}
                          color='primary'
                          disabled={isPreviewOnly}
                          checked={isPreviewOnly ? true : getValues('acknowledge')}
                        />
                )}
                      label={(
                        <HeadingMaster2>
                          I do hereby argue that I have received all the packets in sealed packet condition. There is no tampering/cuts at my attempt to open the packets.
                        </HeadingMaster2>
                )}
                    />
                    <Grid item style={{ paddingLeft: '13px' }}>
                      {renderError('acknowledge')}
                    </Grid>
                  </Grid>
                </Grid>
              ) : null
}
          <InputGrid container display='flex' alignItems='center' justifyContent='center'>
            <LoadingButtonPrimary
              variant='contained'
              loading={loading.loader && loading.name === 'submission'}
              type='submit'
              disabled={isPreviewOnly}
            >
              {submissionUserMapping[userType].accept.name}
            </LoadingButtonPrimary>

            <LoadingButtonPrimary
              loading={loading.loader && loading.name === 'submission'}
              onClick={submissionUserMapping[userType].reject.func}
              disabled={isPreviewOnly}
            >
              {submissionUserMapping[userType].reject.name}
            </LoadingButtonPrimary>
          </InputGrid>
        </CustomForm>
      )
    }
    </>
  );
};

export default Maker;
