/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable max-len */
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  useEffect, useRef, useState
} from 'react';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import {
  FormHelperText, DialogContentText, Grid, TableRow, TableCell, TableContainer,
  InputAdornment, TableBody
} from '@mui/material';
import {
  ToastMessage, MultiToggleButton, ErrorText, DialogBox
} from '../../../../components';
import {
  CustomContainerStyled, LoadingButtonPrimary,
  ResetButton, ErrorMessageContainer, HeaderContainer, SelectMenuStyle,
  TextFieldStyled, CenterContainerStyled, LoadingButtonSecondaryPrimary, ButtonPrimary
} from '../../../../components/styledComponents';
import {
  receiptMakerValidation, receiptMakerTogglerGroup,
  CustomForm, CustomTableHead, CustomTable, InputWrapper
} from '../../helper';
import TableRows from './tableRows';
import { Service } from '../../../../service';
import RebateCalculation from './rebateCalculation';
import { errorMessageHandler } from '../../../../utils';
import { useScreenSize } from '../../../../customHooks';
import PageLoader from '../../../../components/PageLoader';
import { throttleFunction } from '../../../../utils/throttling';

const amountFormat = Intl.NumberFormat('en-IN');
const moment = require('moment');

const ReceiptMaker = ({ handleReceipt, config }) => {
  const [allData, setAllData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [searchTitle, setSearchTitle] = useState('Customer ID');
  const [paramsValue, setParamsValue] = useState('customer_id');
  const [totalAmount, setTotalAmount] = useState(0);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [loading, setLoading] = useState({ loader: false, name: null });
  const [checkedRows, setCheckedRows] = useState([]);
  const [isSearchDisabled, setIsSearchDisabled] = useState(false);
  const [clickedReceiptData, setClickedReceiptData] = useState(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState({ onSubmit: false, onCancel: false });
  const [rebateData, setRebateData] = useState({});
  const navigate = useNavigate();
  const loaderRef = useRef();
  const throttleRef = useRef();

  const {
    register, handleSubmit, formState: { errors }, reset, setValue, getValues,
    unregister
  } = useForm();

  const {
    handleSubmit: handleSubmit2,
    register: register2,
    setValue: setValue2,
    getValues: getValues2,
    formState: formState2,
    reset: reset2
  } = useForm();

  const screen = useScreenSize();

  const createLoansArray = (filteredLoans, custInfo) => filteredLoans.map((item) => ({
    id: custInfo.customer_id,
    lan: item?.lan,
    name: `${custInfo.first_name ?? ''} ${custInfo.middle_name ?? ''} ${custInfo.last_name ?? ''}`,
    amount: 0,
    dpd: Number(item?.dpd),
    dueAmount: 'NA',
    foreclosureAmount: 'NA',
    principalBalance: 'NA',
    interestTillDate: 'MA',
    additionalInterest: 'NA',
    charges: 'NA',
    rebateInterestAmount: 'NA',
    rebateRate: null,
    interestSettledEndDate: null,
    loanDt: item.dt,
    checked: false,
    error: false,
    pan_no: custInfo?.pan_no,
    disbursed_date: item?.disburshment_date,
    colender: item?.colender,
    scheme_type: item?.scheme_type,
    amount_paid_today: item?.amount_paid_today
  }));

  const searchDetailsHandler = async (params) => {
    try {
      loaderRef.current = true;
      setLoading({ loader: true, name: 'onSearch' });
      reset2();
      setValue2('makerRemarks', null);
      setValue2('utrNumber', null);
      checkedRows.forEach((ele, ind) => unregister(`amount_${ind}`));
      // mobilenumber and customer id response cached
      // if (allData && ((params?.customer_id && Number(params.customer_id) === allData?.customer_id)
      // || (params?.primary_mobile_number && params.primary_mobile_number === allData?.primary_mobile_number))) {
      //   let filteredLoans = [];
      //   if (getValues('colender') === 'SHIVALIK') {
      //     filteredLoans = allData.loan_detail.filter((item) => item.colender === 'SHIVALIK');
      //   } else {
      //     filteredLoans = allData.loan_detail.filter((item) => item.colender !== 'SHIVALIK');
      //   }
      //   const tableDataArray = createLoansArray(filteredLoans, allData);
      //   if (tableDataArray.length) {
      //     setTableData(tableDataArray.sort((a, b) => b.dpd - a.dpd));
      //   } else {
      //     setAlertShow({ open: true, msg: 'No data found.', alertType: 'error' });
      //   }
      //   return;
      // }
      let url = process.env.REACT_APP_USER_VIEW;
      if (params?.customer_id) {
        url += `?customer_id=${params.customer_id}`;
      } else if (params?.lan) {
        url += `?lan=${params.lan}`;
      } else {
        url += `?primary_mobile_number=${params.primary_mobile_number}`;
      }
      const { data } = await Service.get(`${url}&fc=1&token=1&get_branch_details=1&is_active=1&colender=1`);
      let filteredLoans = [];
      if (data?.success) {
        setAllData(data.data);
        if (params?.customer_id || params?.primary_mobile_number) {
          if (getValues('colender') === 'SHIVALIK') {
            filteredLoans = data.data.loan_detail.filter((item) => item.colender === 'SHIVALIK');
          } else {
            filteredLoans = data.data.loan_detail.filter((item) => item.colender !== 'SHIVALIK');
          }
        }
        if (params?.lan) {
          filteredLoans = data.data.loan_detail.filter((item) => item.lan?.toString().trim() === params?.lan.toString().trim());
        }
      }
      const tableDataArray = createLoansArray(filteredLoans, data.data);
      if (tableDataArray?.length) {
        setTableData(tableDataArray.sort((a, b) => b.dpd - a.dpd));
      } else {
        setAlertShow({ open: true, msg: 'No data found.', alertType: 'error' });
        setTableData([]);
        setTotalAmount(0);
      }
    } catch (err) {
      console.log('error', err);
      setTableData([]);
      setTotalAmount(0);
      if (err?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else if (err?.response?.data?.errors?.detail) {
        setAlertShow({ open: true, msg: err.response.data.errors.detail, alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong, Please try again.', alertType: 'error' });
      }
    } finally {
      loaderRef.current = false;
      setLoading({ loader: false, name: null });
    }
  };

  const resetPageData = () => {
    setTableData([]);
    setTotalAmount(0);
    setCheckedRows([]);
    // setGeneratedReceiptId(null);
    reset2();
  };
  const onSearchSubmit = () => {
    resetPageData();
    throttleFunction(
      {
        args1: [{
          [paramsValue]: getValues(paramsValue)
        }],
        function1: searchDetailsHandler,
      },
      loaderRef,
      setIsSearchDisabled
    );
  };

  const searchResetHandler = () => {
    reset({ [paramsValue]: null });
    resetPageData();
  };

  const seletedValueHandler = (value) => {
    setParamsValue(value);
    const searchTemp = receiptMakerTogglerGroup.values.find((item) => item.value === value);
    setSearchTitle(searchTemp?.name);
    reset({ [value]: null });
  };

  const getChargeSum = (chargeArray) => chargeArray.reduce((acc, item) => acc + item.cashHandlingCharge, 0);

  const getNetAmount = (chargeArray) => {
    const totalCharge = getChargeSum(chargeArray);
    return totalAmount + totalCharge;
  };

  const formHandler = () => {
    // const { pan_no } = allData;
    if (getValues2('paymentMode') === 'cash') {
      // if (!pan_no?.toString()?.trim() && totalAmount > 49999) {
      //   setAlertShow({ open: true, msg: 'Total amount should be less than or equal to 49,999', alertType: 'error' });
      //   return;
      // }
      // if (totalAmount > 199999) {
      //   setAlertShow({ open: true, msg: 'Total amount should be less than or equal to 1,99,999', alertType: 'error' });
      //   return;
      // }
      if (getNetAmount(checkedRows) > 19999) {
        setAlertShow({ open: true, msg: 'Daily cash transaction limit of ₹19,999 has been reached.', alertType: 'error' });
        return;
      }

      if (totalAmount > 19999) {
        setAlertShow({ open: true, msg: 'Total amount should be less than or equal to 19,999', alertType: 'error' });
        return;
      }
    }
    if (checkedRows.length > 5) {
      setAlertShow({ open: true, msg: 'You can not pay amount for more than 5 loan at once.', alertType: 'error' });
      return;
    }
    setIsConfirmationOpen({ onSubmit: true, onCancel: false });
  };

  const pollStatus = async (n, receiptNo) => {
    try {
      const approvalRejectionStatus = await Service.get(`${process.env.REACT_APP_RECEIPT_SERVICE}/fc-status/${receiptNo}`);
      if (approvalRejectionStatus.data.success === true) {
        if (approvalRejectionStatus.data.data.fc_status) {
          const isAllSucess = approvalRejectionStatus.data.data.success.length > 0 && approvalRejectionStatus.data.data.fail.length === 0;
          const isPartialSuccess = approvalRejectionStatus.data.data.success.length > 0 && approvalRejectionStatus.data.data.fail.length > 0;
          const isAllFailed = approvalRejectionStatus.data.data.success.length === 0 && approvalRejectionStatus.data.data.fail.length > 0;
          if (isAllSucess) {
            setAlertShow({ open: true, msg: `Successesfully Approved for - ${approvalRejectionStatus.data.data.success.map((e) => e.loan_account_no).join(', ')}`, alertType: 'success' });
          }
          if (isPartialSuccess) {
            setAlertShow({ open: true, msg: `Successesfully Approved for - ${approvalRejectionStatus.data.data.success.map((e) => e.loan_account_no).join(', ')}  Failed for - ${approvalRejectionStatus.data.data.fail.map((e) => e.loan_account_no).join(', ')}`, alertType: 'success' });
          }
          if (isAllFailed) {
            setAlertShow({ open: true, msg: `Failed for - ${approvalRejectionStatus.data.data.fail.map((e) => e.loan_account_no).join(', ')}`, alertType: 'error' });
          }
          setIsOpen(false);

          // fetchListingAfterApproveOrReject();
          setTimeout(() => {
            setLoading({ loader: false, name: null });
            throttleRef.current = false;
            handleReceipt();
          }, 1000);
        } else if (n === 3) {
          setAlertShow({ open: true, msg: 'Receipt is not approved.', alertType: 'error' });
          setIsOpen(false);
          // fetchListingAfterApproveOrReject();
          setTimeout(() => {
            setLoading({ loader: false, name: null });
            throttleRef.current = false;
            handleReceipt();
          }, 1000);
        } else {
          setTimeout(() => {
            pollStatus(n + 1, receiptNo);
          }, 10000 * (n + 1));
        }
      } else if (n === 3) {
        setAlertShow({ open: true, msg: 'Receipt is not approved.', alertType: 'error' });
        // fetchListingAfterApproveOrReject();
        setTimeout(() => {
          setLoading({ loader: false, name: null });
          throttleRef.current = false;
          handleReceipt();
        }, 2000);
        setIsOpen(false);
      } else {
        setTimeout(() => {
          pollStatus(n + 1, receiptNo);
        }, 10000 * (n + 1));
      }
    } catch (err) {
      console.log('error', err);
      setAlertShow({
        open: true,
        msg: 'Something went wrong, Please try again.',
        alertType: 'error'
      });
      // fetchListingAfterApproveOrReject();
      setLoading({ loader: false, name: null });
      throttleRef.current = false;
    }
  };

  const getInterestClearedTill = (interestSettledEndDate, disbursementDate) => {
    if (interestSettledEndDate === 19500101) {
      return disbursementDate;
    } if (interestSettledEndDate !== null) {
      const dateLast = moment(interestSettledEndDate, 'YYYYMMDD');
      return dateLast.format('DD/MM/YYYY');
    }
    return ' ';
  };

  const finalSubmitHandler = async () => {
    // setIsConfirmationOpen({ onSubmit: false, onCancel: false });
    // setLoading({ loader: true, name: 'pageLoader' });
    // return;
    try {
      if (isConfirmationOpen.onCancel) {
        navigate('/customer-transaction');
        return;
      }
      if (throttleRef.current) return;
      throttleRef.current = true;
      setLoading({ loader: true, name: 'pageLoader' });
      setIsConfirmationOpen({ onSubmit: false, onCancel: false });
      const loanItems = [];
      checkedRows.forEach((item) => {
        console.log('item', item);
        let interestTillDate = getInterestClearedTill(item.interestSettledEndDate, item.disbursed_date)?.toString();
        if (interestTillDate.includes('/')) {
          interestTillDate = moment(interestTillDate, 'DD/MM/YYYY').format('YYYYMMDD');
        }
        loanItems.push({
          loan_account_no: item?.lan,
          due_amount: item?.dueAmount,
          dpd: 0,
          foreclosure_amount: item?.foreclosureAmount,
          paid_amount: item?.amount,
          interest_cleared_till_date: interestTillDate,
          colender: item?.colender,
          cash_handling_charge: item?.cashHandlingCharge,
          loan_dt: item?.loanDt,
          dt: item?.dtToken
        });
      });
      const cashHandlingChargeSum = getChargeSum(checkedRows);
      const requestBody = {
        cust_dt: allData.dt,
        loan_items: loanItems,
        customer_id: checkedRows[0].id,
        customer_name: checkedRows[0].name,
        paid_amount: totalAmount,
        cash_handling_charge: cashHandlingChargeSum,
        total_amount: totalAmount + cashHandlingChargeSum,
        maker_remarks: getValues2('makerRemarks'),
        payment_mode: 'CASH'
      };

      if (requestBody.payment_mode === 'ONLN') {
        requestBody.utr_no = getValues2('utrNumber');
      }
      const { data, status } = await Service.post(`${process.env.REACT_APP_RECEIPT_SERVICE}/create_v2`, requestBody);
      if (status === 200) {
        // setGeneratedReceiptId(data.receipt_no);
        setLoading({ loader: true, name: 'pageLoader' });
        pollStatus(1, data.receipt_no);
        // setIsSubmittedSuccessfully(true);
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong, Please try again!', alertType: 'error' });
      }
    } catch (err) {
      console.log('err', err,);
      const msg = err?.response?.data?.error && errorMessageHandler(err.response.data.error);
      if (msg) {
        setAlertShow({ open: true, msg, alertType: 'error' });
      } else if (err?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else if (err?.response?.data?.error?.hasOwnProperty('limit left')) {
        setAlertShow({ open: true, msg: `${err.response.data.error['limit left']} amount left for cash payment mode.`, alertType: 'error' });
      } else if (err?.response?.data?.error?.hasOwnProperty('total_amount') && err.response.data.error.total_amount.length) {
        setAlertShow({ open: true, msg: err.response.data.error.total_amount[0], alertType: 'error' });
      } else if (err.response?.data?.message) {
        setAlertShow({ open: true, msg: err.response.data.message, alertType: 'error' });
      }
      setLoading({ loader: false, name: null });
      throttleRef.current = false;
    }
  };

  const handleConfirmationClose = (event, reason) => {
    if (reason && reason === 'backdropClick') {
      return;
    }
    setIsConfirmationOpen({ onSubmit: false, onCancel: false });
  };

  const handleForeclosureAmount = async (item, index) => {
    try {
      setLoading({ loader: true, name: 'pageLoader' });
      const { data, status } = await Service.post(`${process.env.REACT_APP_LOAN_REBATE_INTEREST_INQ}?token=1`, {
        loan_account_no: item.lan
      });
      const parsedTotalOutstanding = Number(data?.data?.total_outstandings.toFixed(2));
      const foreClosureAmount = parsedTotalOutstanding < 0 ? 0 : parsedTotalOutstanding;
      if (status === 200) {
        const updatedRows1 = [...tableData];
        updatedRows1[index].foreclosureAmount = foreClosureAmount;
        updatedRows1[index].dueAmount = Number(data?.data?.due_amount.toFixed(2));
        updatedRows1[index].principalBalance = Number(data?.data?.principal_balance.toFixed(2));
        updatedRows1[index].interestTillDate = Number(data?.data?.interest_till_date.toFixed(2));
        updatedRows1[index].additionalInterest = Number(data?.data?.additional_interest.toFixed(2));
        updatedRows1[index].charges = Number(data?.data?.charges.toFixed(2));
        updatedRows1[index].rebateInterestAmount = Number(data?.data?.rebate_interest_amount.toFixed(2));
        updatedRows1[index].checked = true;
        updatedRows1[index].error = true;
        updatedRows1[index].dtToken = data?.data?.dt;
        setTableData(updatedRows1);
        setCheckedRows(updatedRows1.filter((ele) => ele.checked));
      }
    } catch (err) {
      console.log('Error', err);
      const updatedRows1 = [...tableData];
      updatedRows1[index].checked = false;
      updatedRows1[index].error = false;
      setTableData(updatedRows1);
      if (err?.response?.data?.message && typeof err.response.data.message === 'string' && err.response.data.message.trim() === 'No Outstanding Loan Amount.') {
        setAlertShow({ open: true, msg: 'No Outstanding Loan Amount. Do not proceed with receipt creation.', alertType: 'error' });
      } else if (err?.response?.data?.errors) {
        setAlertShow({ open: true, msg: err.response.data.errors, alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'somthing went wrong while fetching the foreclosure amount', alertType: 'error' });
      }
    } finally {
      setLoading({ loader: false, name: null });
    }
  };

  const calculateRebateData = async (index, rowData) => {
    try {
      if (getValues(`amount_${index}`)) {
        setLoading({ loader: true, name: 'pageLoader' });
        const { data } = await Service.post(process.env.REACT_APP_LOAN_REBATE_INQ, {
          loan_account_no: tableData[index].lan,
          amount: getValues(`amount_${index}`)
        });
        const updatedRows = [...tableData];
        updatedRows[index].rebateRate = (rowData.scheme_type === 'RSU' && (getValues(`amount_${index}`) + rowData.amount_paid_today) < rowData.rebateInterestAmount) ? 0 : data?.data?.rebateRate;
        updatedRows[index].interestSettledEndDate = (rowData.scheme_type === 'RSU' && (getValues(`amount_${index}`) + rowData.amount_paid_today) < rowData.rebateInterestAmount) ? 'NA' : data?.data?.interestSettledEndDate;
        setTableData(updatedRows);
      }
    } catch (err) {
      console.log('Error', err);
      setAlertShow({ open: true, msg: 'Something went wrong, Please try again.', alertType: 'error' });
    } finally {
      setLoading({ loader: false, name: null });
    }
  };

  const getRebateEnquiryDate = async (loan_account_no) => {
    try {
      const { data } = await Service.post(process.env.REACT_APP_LOAN_REBATE_INQ, {
        loan_account_no,
        amount: 0
      });
      return data?.data?.interestSettledEndDate;
    } catch (err) {
      console.log('Error', err);
      return null;
    }
  };

  const onRebateDialogOpen = async (index, item) => {
    let interestSettledEndDate = null;
    if (!rebateData[index]?.interestClearedTill) {
      interestSettledEndDate = await getRebateEnquiryDate(item?.lan);
      if (interestSettledEndDate) {
        setRebateData({ ...rebateData, [index]: { interestClearedTill: interestSettledEndDate } });
      }
    } else {
      interestSettledEndDate = rebateData[index]?.interestClearedTill;
    }
    const disbursementDate = item?.disbursed_date;
    tableData[index].interestClearedTill = getInterestClearedTill(interestSettledEndDate, disbursementDate);
    setClickedReceiptData(tableData[index]);
    setIsOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason && ['escapeKeyDown', 'backdropClick'].includes(reason)) {
      return;
    }
    setIsOpen(false);
  };

  const closeAfterRebateCal = (loanRebateData) => {
    const index = tableData.findIndex((ele) => ele.lan === loanRebateData.lan);
    if (index !== -1) {
      const updatedRows = [...tableData];
      updatedRows[index].amount = Number(loanRebateData.amount);
      updatedRows[index].rebateRate = (updatedRows[index].scheme_type === 'RSU' && (Number(loanRebateData.amount) + updatedRows[index].amount_paid_today) < updatedRows[index].rebateInterestAmount) ? 0 : loanRebateData.rebateRate;
      updatedRows[index].interestSettledEndDate = (updatedRows[index].scheme_type === 'RSU' && (Number(loanRebateData.amount) + updatedRows[index].amount_paid_today) < updatedRows[index].rebateInterestAmount) ? 'NA' : loanRebateData.interestSettledEndDate;
      updatedRows[index].error = false;
      const cashHandlingCharge = Math.max(10, Math.ceil(Number(loanRebateData.amount) * 0.0025));
      updatedRows[index].cashHandlingCharge = cashHandlingCharge;
      setValue(`amount_${index}`, loanRebateData.amount);
      setTableData(updatedRows);
      setCheckedRows(updatedRows.filter((ele) => ele.checked));
      setIsOpen(false);
    }
  };

  useEffect(() => {
    let amount = 0;
    checkedRows.forEach((item) => {
      if (item?.amount) {
        amount += item.amount;
      }
    });
    setTotalAmount(amount);
    setValue2('paymentMode', 'cash');
  }, [checkedRows]);

  const renderError = (name) => {
    if (formState2?.errors?.[name]) {
      return <FormHelperText error>{formState2?.errors?.[name].message}</FormHelperText>;
    }
  };

  return (
    <>
      {loading.loader && loading.name === 'pageLoader' ? <PageLoader /> : null}
      <ToastMessage
        alertShow={alertShow}
        setAlertShow={setAlertShow}
      />
      <HeaderContainer
        item
        xs={12}
        padding='0px 20px 3px'
        flexDirection={['xs', 'sm'].includes(screen) ? 'column-reverse' : 'row'}
        justifyItems={['xs', 'sm'].includes(screen) ? 'flex-end' : ''}
      >
        <CustomForm
          onSubmit={handleSubmit(onSearchSubmit)}
          width={['xs', 'sm'].includes(screen) ? '100%' : '550px'}
          flexDirection={['xs', 'sm'].includes(screen) ? 'column' : 'row'}
          justifyItems={['xs', 'sm'].includes(screen) ? 'space-between' : 'space-between'}
        >
          {
            paramsValue === 'customer_id' || paramsValue === 'primary_mobile_number' ? (
              <>
                <InputWrapper flexDirection='column' padding='0px 0px 0px 0px !important'>
                  <TextFieldStyled
                    id='outlined-basic'
                    label={`${searchTitle} *`}
                    variant='outlined'
                    defaultValue=''
                    {...register(paramsValue, {
                      required: true,
                      pattern: (receiptMakerValidation[paramsValue]?.validation?.pattern)
                        ? new RegExp(receiptMakerValidation[paramsValue]?.validation?.pattern) : undefined,
                      maxLength: (receiptMakerValidation[paramsValue]?.validation?.maxLength)
                        ? receiptMakerValidation[paramsValue]?.validation?.maxLength : undefined,
                      minLength: (receiptMakerValidation[paramsValue]?.validation?.minLength)
                        ? receiptMakerValidation[paramsValue]?.validation?.minLength : undefined,
                    })}
                    onChange={(e) => {
                      setValue(paramsValue, e.target.value.trim(), { shouldValidate: true });
                    }}
                  />
                  <ErrorMessageContainer padding='0px'>
                    <ErrorText input={receiptMakerValidation.customer_id} errors={errors} />
                  </ErrorMessageContainer>
                  <ErrorMessageContainer padding='0px'>
                    <ErrorText input={receiptMakerValidation.primary_mobile_number} errors={errors} />
                  </ErrorMessageContainer>
                </InputWrapper>
                <InputWrapper flexDirection='column' justifyContent='start'>
                  <TextFieldStyled
                    label='Type*'
                    select
                    {...register('colender', {
                      onChange: (e) => setValue('colender', e.target.value, { shouldValidate: true }),
                      required: true
                    })}
                  >
                    <SelectMenuStyle key='capri' value='CAPRI'>CAPRI</SelectMenuStyle>
                    <SelectMenuStyle key='shivalik' value='SHIVALIK'>SSFB</SelectMenuStyle>
                  </TextFieldStyled>
                  <ErrorMessageContainer padding='0px'>
                    <ErrorText input={receiptMakerValidation.colender} errors={errors} />
                  </ErrorMessageContainer>
                </InputWrapper>
              </>
            )
              : (
                <TextFieldStyled
                  id='outlined-basic'
                  label={`${searchTitle} *`}
                  variant='outlined'
                  defaultValue=''
                  {...register(paramsValue, {
                    required: true,
                    pattern: (receiptMakerValidation[paramsValue]?.validation?.pattern)
                      ? new RegExp(receiptMakerValidation[paramsValue]?.validation?.pattern) : undefined,
                    maxLength: (receiptMakerValidation[paramsValue]?.validation?.maxLength)
                      ? receiptMakerValidation[paramsValue]?.validation?.maxLength : undefined,
                    minLength: (receiptMakerValidation[paramsValue]?.validation?.minLength)
                      ? receiptMakerValidation[paramsValue]?.validation?.minLength : undefined,
                  })}
                  onChange={(e) => {
                    setValue(paramsValue, e.target.value.trim(), { shouldValidate: true });
                  }}
                />
              )
            }
          <InputWrapper
            justifyContent='center'
            height='fit-content'
            padding='0px !important'
          >
            <LoadingButtonPrimary
              variant='contained'
              loading={loading?.loader && loading?.name === 'onSearch'}
              disabled={isSearchDisabled}
              type='submit'
              margin='5px'
            >
              Search
            </LoadingButtonPrimary>
            <ResetButton onClick={() => searchResetHandler()}>
              Reset
            </ResetButton>
          </InputWrapper>
        </CustomForm>
      </HeaderContainer>
      <ErrorMessageContainer>
        <ErrorText input={receiptMakerValidation.lan} errors={errors} />
      </ErrorMessageContainer>
      <HeaderContainer padding='20px'>
        <MultiToggleButton
          orientation={screen === 'xs' ? 'vertical' : 'horizontal'}
          details={receiptMakerTogglerGroup}
          seletedValueHandler={seletedValueHandler}
        />
      </HeaderContainer>
      {
          tableData.length ? (
            <form onSubmit={handleSubmit2(formHandler)}>
              <Grid container padding='0px 20px 20px'>
                <TableContainer sx={{ maxHeight: 550 }}>
                  <CustomTable stickyHeader>
                    <CustomTableHead>
                      <TableRow>
                        <TableCell width='5%' align='center'> </TableCell>
                        <TableCell width='10%' align='center'>Customer ID</TableCell>
                        <TableCell width='10%' align='center'>LAN</TableCell>
                        <TableCell width='15%' align='center'>Customer Name</TableCell>
                        <TableCell width='10%' align='center'>Due Amount</TableCell>
                        <TableCell width='10%' align='center'>DPD</TableCell>
                        <TableCell width='10%' align='center'>Total Amount</TableCell>
                        <TableCell width='20%' align='center'>Customer wishes to pay</TableCell>
                      </TableRow>
                    </CustomTableHead>
                    <TableBody>
                      {tableData.map((item, index) => (
                        <TableRows
                          item={{ ...item }}
                          config={config}
                          index={index}
                          register={register}
                          tableData={tableData}
                          setValue={setValue}
                          setTableData={setTableData}
                          setCheckedRows={setCheckedRows}
                          onRebateDialogOpen={onRebateDialogOpen}
                          calculateRebateData={calculateRebateData}
                          handleForeclosureAmount={handleForeclosureAmount}
                        />
                      ))}
                    </TableBody>
                  </CustomTable>
                </TableContainer>
              </Grid>
              <Grid container display='flex' justifyContent='space-between'>
                {/* <Grid item xs={12} md={6} display='flex'> */}
                <Grid item xs={12} md={3} padding='10px 20px'>
                  <TextFieldStyled
                    label='Amount Customer Wishes To Pay'
                    InputProps={{
                      startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>,
                    }}
                    disabled
                    value={amountFormat.format(totalAmount)}
                  />
                </Grid>
                <Grid item xs={12} md={3} padding='10px 20px'>
                  <TextFieldStyled
                    label='Cash Handling Charge'
                    InputProps={{
                      startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>,
                    }}
                    disabled
                    value={amountFormat.format(getChargeSum(checkedRows))}
                  />
                </Grid>
                <Grid item xs={12} md={3} padding='10px 20px'>
                  <TextFieldStyled
                    label='PAN'
                    disabled
                    value={allData.pan_no}
                  />
                </Grid>
                <Grid item xs={12} md={3} padding='10px 20px'>
                  <TextFieldStyled
                    label='Mode*'
                    select
                    disabled
                    defaultValue='cash'
                    {...register2('paymentMode', {
                      onChange: (e) => {
                        setValue2('paymentMode', e.target.value, { shouldValidate: true });
                        setValue2('utrNumber', null);
                      },
                      value: 'cash'
                    })}
                  >
                    <SelectMenuStyle key='select' value='select' disabled>Select</SelectMenuStyle>
                    <SelectMenuStyle key='cash' value='cash'>Cash</SelectMenuStyle>
                    <SelectMenuStyle key='online' value='online'>Online</SelectMenuStyle>
                  </TextFieldStyled>
                  {renderError('paymentMode')}
                </Grid>
                {/* </Grid> */}

                {/* <Grid item xl={3} lg={3} md={4} sm={12} xs={12} padding='10px 20px'>
                  <TextFieldStyled
                    label='Mode*'
                    select
                    disabled
                    defaultValue='cash'
                    {...register2('paymentMode', {
                      onChange: (e) => {
                        setValue2('paymentMode', e.target.value, { shouldValidate: true });
                        setValue2('utrNumber', null);
                      },
                      value: 'cash'
                    })}
                  >
                    <SelectMenuStyle key='select' value='select' disabled>Select</SelectMenuStyle>
                    <SelectMenuStyle key='cash' value='cash'>Cash</SelectMenuStyle>
                    <SelectMenuStyle key='online' value='online'>Online</SelectMenuStyle>
                  </TextFieldStyled>
                  {renderError('paymentMode')}
                </Grid> */}
              </Grid>
              {/* <Grid item xs={12} md={6} display='flex'> */}
              <Grid container>
                <Grid item md={3} xs={12} padding='10px 20px'>
                  <TextFieldStyled
                    label='Total Amount to be Calculated'
                    InputProps={{
                      startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>,
                    }}
                    disabled
                    value={amountFormat.format(getNetAmount(checkedRows))}
                  />
                </Grid>
              </Grid>

              {/* </Grid> */}
              <Grid container display='flex' justifyContent='space-between'>
                <Grid item xl={3} lg={3} md={4} sm={12} xs={12} padding='10px 20px'>
                  <TextFieldStyled
                    label='Maker Remarks*'
                    multiline
                    maxRows={3}
                    {...register2('makerRemarks', {
                      onBlur: (e) => {
                        if (e.target.value.trim().length) {
                          setValue2('makerRemarks', e.target.value, { shouldValidate: true });
                        } else {
                          setValue2('makerRemarks', null, { shouldValidate: true });
                        }
                      },
                      required: 'Please enter maker remarks.',
                      maxLength: { value: 200, message: 'Maximum 200 characters allowed' }
                    })}
                  />
                  {renderError('makerRemarks')}
                </Grid>
                {
            getValues2('paymentMode') === 'online' && (
            <Grid item xl={3} lg={3} md={4} sm={12} xs={12} padding='10px 20px'>
              <TextFieldStyled
                label='UTR Number*'
                multiline
                maxRows={3}
                {...register2('utrNumber', {
                  onBlur: (e) => {
                    if (e.target.value.trim().length) {
                      setValue2('utrNumber', e.target.value, { shouldValidate: true });
                    } else {
                      setValue2('utrNumber', null, { shouldValidate: true });
                    }
                  },
                  required: 'Please enter UTR number.',
                  maxLength: { value: 200, message: 'Maximum 200 characters allowed' }
                })}
              />
              {renderError('utrNumber')}
            </Grid>
            )
        }
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12} display='flex' justifyContent='center' padding='0px 0px 20px'>
                  <LoadingButtonPrimary
                    type='submit'
                    disabled={!checkedRows.length || checkedRows.some((ele) => ele.error)}
                    loading={loading.loader && loading.name === 'onSubmit'}
                  >
                    Deposit
                  </LoadingButtonPrimary>
                  <LoadingButtonPrimary
                    onClick={() => setIsConfirmationOpen({ onSubmit: false, onCancel: true })}
                    disabled={loading.loader && loading.name === 'onSubmit'}
                  >
                    Cancel
                  </LoadingButtonPrimary>
                </Grid>
              </Grid>
            </form>
          ) : null
      }
      <DialogBox
        isOpen={isConfirmationOpen.onSubmit || isConfirmationOpen.onCancel}
        title=''
        handleClose={handleConfirmationClose}
        width='auto'
        padding='40px'
      >
        <DialogContentText>
          {
                isConfirmationOpen.onSubmit ? `Are you sure to proceed with Cash deposit of Inr ${amountFormat.format(getNetAmount(checkedRows))} Confirmation?`
                  : 'Are you sure you want to Cancel Receipt Maker?'
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
          <ButtonPrimary onClick={() => setIsConfirmationOpen({ onSubmit: false, onCancel: false })}>No</ButtonPrimary>
        </CenterContainerStyled>
      </DialogBox>
      {/* <DialogBox
        isOpen={isSubmittedSuccessfully}
        title=''
        handleClose={handleSuccessDialogClose}
        width='400px'
        padding='40px'
      >
        <DialogContentText>
          {`The Receipt No. ${generatedReceiptId} has been submitted to checker for Approval.`}
        </DialogContentText>
        <CenterContainerStyled flexDirection='row' padding='20px 0 0 0'>
          <ButtonPrimary onClick={() => {
            setIsSubmittedSuccessfully(false);
            navigate('/customer-transaction');
          }}
          >
            Okay
          </ButtonPrimary>
        </CenterContainerStyled>
      </DialogBox> */}
      <DialogBox
        isOpen={isOpen}
        fullScreen
        title=' '
        width='100%'
        handleClose={handleClose}
      >
        <CustomContainerStyled padding='0 !important'>
          <RebateCalculation
            closeAfterRebateCal={closeAfterRebateCal}
            receiptData={clickedReceiptData}
          />
        </CustomContainerStyled>
      </DialogBox>
      {/* </CustomContainerStyled> */}
    </>
  );
};
export default ReceiptMaker;
