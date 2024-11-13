/* eslint-disable max-len */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import {
  Grid, TextField, DialogContentText, InputAdornment, TableRow, TableCell,
  TableBody, TableContainer
} from '@mui/material';
import TopUP from './topUP';
import store from '../../../redux/store';
import { Service } from '../../../service';
import { ROUTENAME } from '../../../constants';
import PageLoader from '../../../components/PageLoader';
import { MenuNavigation, ToastMessage, DialogBox } from '../../../components';
import {
  navigationDetails, CustomText, CustomLi, DivWithMargin, CustomTable, CustomTableHead
} from './helper';
import {
  TextFieldStyled, CustomContainerStyled, LoadingButtonPrimary, BreadcrumbsWrapperContainerStyled,
  BreadcrumbsContainerStyled, HeadingMaster, HeaderContainer, AutoCompleteStyled, ContainerStyled,
  CenterContainerStyled, ResetButton
} from '../../../components/styledComponents';

const amountFormat = Intl.NumberFormat('en-IN');

const LoanTopUp = () => {
  const [open, setOpen] = useState(false);
  const [timeTakenByUser, setTimeTakenByUser] = useState(0);
  const [intervalAddress, setIntervalAddress] = useState(null);
  const [dpdTableData, setDPDTableData] = useState([]);
  const [selectedLAN, setSelectedLAN] = useState(null);
  const [allActiveLAN, setAllActiveLAN] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [allselectedLAN, setAllSelectedLAN] = useState([]);
  const [topUpLoanData, setTopUpLoanData] = useState(null);
  const [rateMasterToken, setRateMasterToken] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [loading, setLoading] = useState({ loader: false, name: null });

  const state = store.getState();
  const { formData } = state.loanMaker;
  const navigate = useNavigate();

  const fetchRateMasterToken = async () => {
    try {
      setLoading({ loader: true, name: 'pageLoader' });
      const { data } = await Service.get(`${process.env.REACT_APP_SCHEME_RPA}?token=1`);
      setRateMasterToken(data.dt);
      setLoading({ loader: false, name: null });
    } catch (err) {
      console.log('Error', err);
      setAlertShow({ open: true, msg: 'Something went wrong while fetching today\'s gold price.', alertType: 'error' });
    }
  };

  useEffect(() => {
    const allParentLAN = formData.loan_detail?.filter((ele) => ele.parentAcctNo.trim().length === 0 && Number(ele.current_status_code) !== 1);
    setAllActiveLAN(allParentLAN);
    fetchRateMasterToken();
    const interval = setInterval(() => setTimeTakenByUser((pre) => (pre + 1)), 1000);
    setIntervalAddress(interval);
    return () => clearInterval(intervalAddress);
  }, []);

  const handleChange = async (e, value) => {
    try {
      let selectedLoan = allselectedLAN.filter((ele) => ele.lan === value.lan);
      if (selectedLoan.length) {
        setSelectedLAN(selectedLoan[0]);
      } else {
        selectedLoan = allActiveLAN.filter((ele) => ele.lan === value.lan);
        if (selectedLoan.length) {
          setLoading({ loader: true, name: 'pageLoader' });
          const request1 = Service.get(`${process.env.REACT_APP_LOAN_ACCOUNT_DETAILS}/${selectedLoan[0]?.lan}`);
          const request2 = Service.get(`${process.env.REACT_APP_AUDIT_SERVICE}/net_weight?application_no=${selectedLoan[0]?.lan}`);
          await Promise.all([request1, request2]).then(([response1, response2]) => {
            if (response1?.data?.colender !== 'SHIVALIK' && response1?.data?.colender !== 'KVB') {
              let isChargeInPercentage = false;
              const filteredCharges = response1?.data?.charge.filter((ele) => ele.name === 'STAMPDUTYRJ');
              const filteredFees = response1?.data?.fees.filter((ele) => ele.name === 'PROCESSING');
              if (filteredCharges.some((ele) => ele.type === 'PER') || filteredFees.some((ele) => ele.type === 'percentage_of_loan_amount')) {
                isChargeInPercentage = true;
              }
              const totalChargeAmount = filteredCharges.reduce((accumulator, currentValue) => accumulator + currentValue.amount.amount + (currentValue.amount.gst ?? 0), 0);
              const totalFeeAmount = filteredFees.reduce((accumulator, currentValue) => accumulator + currentValue.amount.amount + (currentValue.amount.gst ?? 0), 0);
              const parentChildLoans = formData.loan_detail?.filter((ele) => (ele.parentAcctNo.trim() === selectedLoan[0]?.lan.trim()) || (ele.lan.trim() === selectedLoan[0]?.lan.trim()));
              let dpd = 0;
              parentChildLoans.forEach((ele) => {
                if (Number(ele.dpd) > dpd) {
                  dpd = ele.dpd;
                }
              });
              const consolidatedLanDetails = {
                ...selectedLoan[0],
                application_no: response1?.data?.application_no,
                charge: filteredCharges ?? [],
                fees: filteredFees ?? [],
                scheme_name: response1?.data?.scheme_name ?? 'NA',
                audit_token: response2?.data?.msg?.dt,
                consolidated_fee_change: totalChargeAmount + totalFeeAmount,
                isHavePercentageCharge: isChargeInPercentage,
                maxdpd: dpd,
                scheme_min_loan_amount: response1?.data?.scheme_min_loan_amount,
                scheme_max_loan_amount: response1?.data?.scheme_max_loan_amount
              };
              setSelectedLAN(consolidatedLanDetails);
              setAllSelectedLAN([...allselectedLAN, consolidatedLanDetails]);
            } else {
              setAlertShow({ open: true, msg: `Top up is not allowed for ${response1.data.colender} Loan.`, alertType: 'error' });
            }
          });
        } else {
          setSelectedLAN(null);
        }
      }
    } catch (err) {
      console.log('Error', err);
      setSelectedLAN(null);
      if (err?.response?.data?.errors?.detail) {
        setAlertShow({ open: true, msg: err?.response?.data?.errors?.detail, alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong while fetching LAN details.', alertType: 'error' });
      }
    } finally {
      setLoading({ loader: false, name: null });
    }
  };

  const onSubmit = async () => {
    try {
      setLoading({ loader: true, name: 'pageLoader' });
      const { data } = await Service.post(`${process.env.REACT_APP_TOPUP_SERVICE}/validate`, {
        customer_token: formData?.cust_dt,
        lan_token: selectedLAN?.dt,
        rate_token: rateMasterToken,
        audit_token: selectedLAN?.audit_token
      });
      if (data?.topup_details?.is_eligible) {
        setTopUpLoanData(data?.topup_details);
        setIsDialogOpen(true);
      }
    } catch (err) {
      console.log('Error', err);
      if (err?.response?.data?.validation_errors) {
        const parentChildLoans = formData.loan_detail?.filter((ele) => (ele.parentAcctNo.trim() === selectedLAN.lan.trim()) || (ele.lan.trim() === selectedLAN.lan.trim()));
        const dpdTableArray = [];
        if (parentChildLoans.reduce((acc, curr) => acc + Number(curr.dpd), 0)) {
          parentChildLoans.forEach((item) => {
            if (Number(item.dpd) > 0 && item.amount_paid_today < item.interest_overdue) {
              dpdTableArray.push({
                lan: item.lan,
                dpd: item.dpd,
                dueAmount: item.interest_overdue,
                amountPaidToday: item.amount_paid_today
              });
            }
          });
        }
        setDPDTableData(dpdTableArray);
        setValidationErrors(err.response.data.validation_errors);
      } else if (err?.response?.data?.msg) {
        setAlertShow({ open: true, msg: err.response.data.msg, alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong while validating LAN details.', alertType: 'error' });
      }
    } finally {
      setLoading({ loader: false, name: null });
    }
  };

  const handleClose = (msg) => {
    try {
      if (msg) {
        setAlertShow({ open: true, msg, alertType: 'error' });
      }
      setIsDialogOpen(false);
    } catch (err) {
      console.log('Error', err);
    }
  };

  return (
    <>
      {loading.loader && loading.name === 'pageLoader' ? <PageLoader /> : null}
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={navigationDetails} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      <CustomContainerStyled padding='0px 0px 20px 0px !important'>
        <ToastMessage
          alertShow={alertShow}
          setAlertShow={setAlertShow}
        />
        <HeaderContainer item xs={12} padding='20px 20px 0px 20px'>
          <HeadingMaster>
            Top Up
          </HeadingMaster>
        </HeaderContainer>
        <Grid container padding='10px'>
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
            <CustomText>Customer Details</CustomText>
          </Grid>
          <Grid item xs={12} sm={12} md={6} lg={3} xl={3} padding='10px'>
            <TextFieldStyled label='Customer ID' disabled value={formData?.customer_id ?? 'NA'} />
          </Grid>
          <Grid item xs={12} sm={12} md={6} lg={3} xl={3} padding='10px'>
            <TextFieldStyled label='Customer Name' disabled value={formData?.full_name ?? 'NA'} />
          </Grid>
          <Grid item xs={12} sm={12} md={6} lg={3} xl={3} padding='10px'>
            <TextFieldStyled label='Mobile Number' disabled value={formData?.primary_mobile_number ?? 'NA'} />
          </Grid>
        </Grid>
        <Grid container padding='10px' display='flex' alignItems='center'>
          <Grid item xs={12} sm={12} md={12} lg={3} xl={3}>
            <CustomText>Select LAN for Top Up</CustomText>
          </Grid>
          <Grid item xs={12} sm={12} md={6} lg={3} xl={3} padding='0px 10px'>
            <AutoCompleteStyled
              disableClearable
              id='auto-complete'
              noOptionsText='No Active LAN'
              open={open}
              onOpen={() => setOpen(true)}
              onClose={() => setOpen(false)}
              onChange={handleChange}
              options={allActiveLAN}
              renderOption={(prop, option) => (
                <CustomLi {...prop}>{option.lan}</CustomLi>
              )}
              getOptionLabel={(option) => option.lan}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='LAN*'
                  InputProps={{
                    ...params.InputProps
                  }}
                />
              )}
            />
          </Grid>
        </Grid>
        {
          selectedLAN
            ? (
              <>
                <Grid container padding='10px'>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <CustomText>LAN Details</CustomText>
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={3} xl={3} padding='10px'>
                    <TextFieldStyled label='LAN' disabled value={selectedLAN?.lan ?? 'NA'} />
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={3} xl={3} padding='10px'>
                    <TextFieldStyled label='Disbursement Date' disabled value={selectedLAN?.disburshment_date ?? 'NA'} />
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={3} xl={3} padding='10px'>
                    <TextFieldStyled
                      label='Disbursement Amount'
                      disabled
                      value={amountFormat.format(selectedLAN?.disburshment_amout) ?? 'NA'}
                      InputProps={{
                        startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={3} xl={3} padding='10px'>
                    <TextFieldStyled label='Scheme Name' disabled value={selectedLAN?.scheme_name ?? 'NA'} />
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={3} xl={3} padding='10px'>
                    <TextFieldStyled
                      label='Principal Outstanding'
                      disabled
                      value={amountFormat.format(selectedLAN?.pos) ?? 'NA'}
                      InputProps={{
                        startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={3} xl={3} padding='10px'>
                    <TextFieldStyled
                      label='Due Till Date'
                      disabled
                      value={amountFormat.format(selectedLAN?.interest_overdue) ?? 'NA'}
                      InputProps={{
                        startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={3} xl={3} padding='10px'>
                    <TextFieldStyled label='Maturity Date' disabled value={selectedLAN?.maturity_date ?? 'NA'} />
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={3} xl={3} padding='10px'>
                    <TextFieldStyled
                      label='Interest'
                      disabled
                      value={amountFormat.format(selectedLAN?.interest) ?? 'NA'}
                      InputProps={{
                        startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={3} xl={3} padding='10px'>
                    <TextFieldStyled
                      label='Additional Interest'
                      disabled
                      value={amountFormat.format(selectedLAN?.additional_interest) ?? 'NA'}
                      InputProps={{
                        startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={3} xl={3} padding='10px'>
                    <TextFieldStyled label='DPD' disabled value={selectedLAN?.maxdpd ?? 'NA'} />
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={3} xl={3} padding='10px'>
                    <TextFieldStyled label='Spurious' disabled value={formData?.loan_summary?.count_of_spurious_account > 0 ? 'Yes' : 'No'} />
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={3} xl={3} padding='10px'>
                    <TextFieldStyled label='Lien Status' disabled value={formData?.loan_summary?.lien_status === 'N' ? 'No' : 'Yes'} />
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={3} xl={3} padding='10px'>
                    <TextFieldStyled label='NPA' disabled value={formData?.loan_summary?.npa_status ?? 'NA'} />
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={3} xl={3} padding='10px'>
                    <TextFieldStyled label='Legal' disabled value={formData?.loan_summary?.legal_status === 'N' ? 'No' : 'Yes'} />
                  </Grid>
                </Grid>
                <Grid container display='flex' justifyContent='center'>
                  <LoadingButtonPrimary onClick={onSubmit}>Submit</LoadingButtonPrimary>
                  <ResetButton onClick={() => navigate(ROUTENAME.loanCreationCustomerSearch)}>Cancel</ResetButton>
                </Grid>
              </>
            )
            : null
       }
      </CustomContainerStyled>
      <DialogBox
        isOpen={isDialogOpen}
        fullScreen
        title='Top Up'
        width='100%'
        handleClose={() => handleClose()}
      >
        <ContainerStyled padding='0 !important'>
          <TopUP
            lanData={selectedLAN}
            formData={formData}
            rateMasterToken={rateMasterToken}
            topUpLoanData={topUpLoanData}
            timeTakenByUser={timeTakenByUser}
            closeParentDialog={handleClose}
          />
        </ContainerStyled>
      </DialogBox>
      <DialogBox
        isOpen={validationErrors.length}
        title=''
        handleClose={() => setValidationErrors([])}
        width='auto'
        padding='30px'
      >
        <DialogContentText>
          Due to followling Credit Policy Parameters, You are not eligible for Additional Credit Facility
          <DivWithMargin>
            {
            validationErrors.map((error, ind) => (
              <div>
                {validationErrors.length > 1 ? `${ind + 1}.` : null}
                {error}
              </div>
            ))
          }
          </DivWithMargin>
          { dpdTableData.length > 0
            ? (
              <TableContainer sx={{ maxHeight: 550, margin: '20px 0px' }}>
                <CustomTable stickyHeader>
                  <CustomTableHead>
                    <TableRow>
                      <TableCell width='25%' align='center'>LAN</TableCell>
                      <TableCell width='25%' align='center'>DPD</TableCell>
                      <TableCell width='25%' align='center'>Due Till Date</TableCell>
                      <TableCell width='25%' align='center'>Amount Paid Today</TableCell>
                    </TableRow>
                  </CustomTableHead>
                  <TableBody>
                    {
                    dpdTableData.map((row) => (
                      <TableRow key={row.lan}>
                        <TableCell align='center'>{row.lan}</TableCell>
                        <TableCell align='center'>{row.dpd}</TableCell>
                        <TableCell align='center'>{amountFormat.format(row.dueAmount)}</TableCell>
                        <TableCell align='center'>{amountFormat.format(row.amountPaidToday)}</TableCell>
                      </TableRow>
                    ))
                }
                  </TableBody>
                </CustomTable>
              </TableContainer>
            ) : null}
        </DialogContentText>
        <CenterContainerStyled padding='20px 0 0 0'>
          <LoadingButtonPrimary onClick={() => setValidationErrors([])}>Okay</LoadingButtonPrimary>
        </CenterContainerStyled>
      </DialogBox>
    </>
  );
};

export default LoanTopUp;
