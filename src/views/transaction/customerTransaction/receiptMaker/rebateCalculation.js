import moment from 'moment';
import { useState } from 'react';
import styled from '@emotion/styled';
import { useForm } from 'react-hook-form';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { Grid, FormHelperText, InputAdornment } from '@mui/material';
import { HeadingMaster2 } from '../../helper';
import { Service } from '../../../../service';
import { ToastMessage } from '../../../../components';
import { TextFieldStyled, LoadingButtonPrimary } from '../../../../components/styledComponents';

const CustomForm = styled.form`
  padding: 20px 0px;
`;
const amountFormat = Intl.NumberFormat('en-IN');

const RebateCalculation = (props) => {
  const [loanRebateData, setLoanRebateData] = useState(null);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [loading, setLoading] = useState({ loader: false, name: null });

  const { receiptData, closeAfterRebateCal } = props;
  const {
    register, handleSubmit, setValue, getValues, formState: { errors }
  } = useForm();

  const calculateDueDays = (date) => {
    try {
      const date1 = moment(date, 'DD/MM/YYYY');
      const date2 = moment();
      const daysCount = Math.abs(date1.startOf('day').diff(date2.startOf('day'), 'days'));
      if (Number.isNaN(daysCount)) {
        return 'NA';
      }
      return daysCount;
    } catch (err) {
      console.log('Error', err);
      return 'NA';
    }
  };

  const onSubmit = async ({ cashAmount }) => {
    try {
      setLoading({ loader: true, name: 'onSubmit' });
      const { data } = await Service.post(process.env.REACT_APP_LOAN_REBATE_INQ, {
        loan_account_no: receiptData?.lan,
        amount: cashAmount
      });
      setLoanRebateData(data.data);
    } catch (err) {
      console.log('Error', err);
      setAlertShow({ open: true, msg: 'Something went wrong, Please try again.', alertType: 'error' });
    } finally {
      setLoading({ loader: false, name: null });
    }
  };

  const renderError = (name) => {
    if (errors?.[name]) {
      return <FormHelperText error>{errors?.[name].message}</FormHelperText>;
    }
  };

  const rebateVal = loanRebateData?.rebateRate;
  const interestCoverageDateVal = moment(loanRebateData?.interestSettledEndDate, 'YYYYMMDD').isBefore(moment('20220101', 'YYYYMMDD')) ? 'NA' : moment(loanRebateData?.interestSettledEndDate, 'YYYYMMDD').format('DD/MM/YYYY');
  const daysCoveredVal = calculateDueDays(moment(loanRebateData?.interestSettledEndDate, 'YYYYMMDD').isBefore(moment('20220101', 'YYYYMMDD')) ? 'NA' : moment(loanRebateData?.interestSettledEndDate, 'YYYYMMDD').format('DD/MM/YYYY'));

  return (
    <>
      <ToastMessage
        alertShow={alertShow}
        setAlertShow={setAlertShow}
      />
      <CustomForm onSubmit={handleSubmit(onSubmit)}>
        <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <HeadingMaster2>ForeClosure Amount</HeadingMaster2>
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <TextFieldStyled
              InputProps={{
                startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>
              }}
              label=''
              defaultValue={amountFormat.format(Math.ceil(receiptData?.foreclosureAmount))}
              disabled
            />
          </Grid>
        </Grid>
        <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <HeadingMaster2>Principle OutStanding</HeadingMaster2>
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <TextFieldStyled
              InputProps={{
                startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>
              }}
              label=''
              defaultValue={amountFormat.format(Math.ceil(receiptData?.principalBalance))}
              disabled
            />
          </Grid>
        </Grid>
        <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <HeadingMaster2>Interest Due Till Date</HeadingMaster2>
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <TextFieldStyled
              InputProps={{
                startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>
              }}
              label=''
              defaultValue={amountFormat.format(Math.ceil(receiptData?.interestTillDate))}
              disabled
            />
          </Grid>
        </Grid>
        <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <HeadingMaster2>Additional Interest Due Till Date</HeadingMaster2>
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <TextFieldStyled
              InputProps={{
                startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>
              }}
              label=''
              defaultValue={amountFormat.format(Math.ceil(receiptData?.additionalInterest))}
              disabled
            />
          </Grid>
        </Grid>
        <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <HeadingMaster2>Charges</HeadingMaster2>
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <TextFieldStyled
              InputProps={{
                startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>
              }}
              label=''
              defaultValue={amountFormat.format(Math.ceil(receiptData?.charges))}
              disabled
            />
          </Grid>
        </Grid>
        <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <HeadingMaster2>Due Amount</HeadingMaster2>
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <TextFieldStyled
              InputProps={{
                startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>
              }}
              label=''
              defaultValue={amountFormat.format(Math.ceil(receiptData?.dueAmount))}
              disabled
            />
          </Grid>
        </Grid>
        <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <HeadingMaster2>Rebated Due Amount</HeadingMaster2>
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <TextFieldStyled
              InputProps={{
                startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>
              }}
              label=''
              defaultValue={amountFormat.format(Math.ceil(receiptData?.rebateInterestAmount))}
              disabled
            />
          </Grid>
        </Grid>
        <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <HeadingMaster2>Interest Cleared till</HeadingMaster2>
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <TextFieldStyled
              label=''
              defaultValue={receiptData?.interestClearedTill}
              disabled
            />
          </Grid>
        </Grid>
        <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <HeadingMaster2>Interest Due Days</HeadingMaster2>
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <TextFieldStyled
              label=''
              defaultValue={calculateDueDays(receiptData?.interestClearedTill)}
              disabled
            />
          </Grid>
        </Grid>
        <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <HeadingMaster2>Amount Customer Wishes To Pay</HeadingMaster2>
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <TextFieldStyled
              label=''
              placeholder='Amount*'
              InputProps={{
                startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>
              }}
              {...register('cashAmount', {
                onChange: (e) => {
                  const value = e.target.value.replace(/[^0-9"]/g, '');
                  setValue('cashAmount', value, { shouldValidate: true });
                },
                required: 'Please enter amount',
                min: { value: 1, message: 'Amount should be greater than 0' },
                max: { value: 1000000000, message: 'Amount should be less than or equal to 1,00,00,00,000' }
              })}
            />
            {renderError('cashAmount')}
          </Grid>
        </Grid>
        <Grid container display='flex' alignItems='center' justifyContent='center'>
          <LoadingButtonPrimary
            variant='contained'
            loading={loading?.loader && loading?.name === 'onSubmit'}
            type='submit'
          >
            Calculate
          </LoadingButtonPrimary>
        </Grid>
        {
        loanRebateData ? (
          <>
            <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
              <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                <HeadingMaster2>Rebate (%)</HeadingMaster2>
              </Grid>
              <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                <TextFieldStyled
                  label=''
                  value={receiptData.schemeType === 'RSU' && ((getValues('cashAmount') + receiptData.amount_paid_today) < receiptData.rebateInterestAmount) ? 0 : rebateVal}
                  disabled
                />
              </Grid>
            </Grid>
            <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
              <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                <HeadingMaster2>Interest Coverage Date</HeadingMaster2>
              </Grid>
              <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                <TextFieldStyled
                  label=''
                  value={receiptData.schemeType === 'RSU' && ((getValues('cashAmount') + receiptData.amount_paid_today) < receiptData.rebateInterestAmount) ? 'NA' : interestCoverageDateVal}
                  disabled
                />
              </Grid>
            </Grid>
            <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
              <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                <HeadingMaster2>Count of Days Covered</HeadingMaster2>
              </Grid>
              <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                <TextFieldStyled
                  label=''
                  value={receiptData.schemeType === 'RSU' && ((getValues('cashAmount') + receiptData.amount_paid_today) < receiptData.rebateInterestAmount) ? 'NA' : daysCoveredVal}
                  disabled
                />
              </Grid>
            </Grid>
            <Grid container display='flex' alignItems='center' justifyContent='center'>
              <LoadingButtonPrimary
                variant='contained'
                onClick={() => closeAfterRebateCal({
                  ...loanRebateData,
                  lan: receiptData.lan,
                  amount: getValues('cashAmount')
                })}
              >
                OK
              </LoadingButtonPrimary>
            </Grid>
          </>
        ) : null
      }
      </CustomForm>
    </>
  );
};
export default RebateCalculation;
