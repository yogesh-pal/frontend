/* eslint-disable max-len */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import moment from 'moment';
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  Grid, FormHelperText, Modal, Box, TableBody,
  TableCell, TableHead, TableRow, Skeleton
} from '@mui/material';
import styled from '@emotion/styled';
import { REGEX, VARIABLE } from '../../../../../constants';
import { ToastMessage, MenuNavigation, DialogBox } from '../../../../../components';
import {
  HeaderContainer, HeadingMaster, LoadingButtonPrimary, TextFieldStyled, ButtonPrimary,
  BreadcrumbsWrapperContainerStyled, BreadcrumbsContainerStyled, ResetButton, SelectMenuStyle,
} from '../../../../../components/styledComponents';
import {
  collateralReleaseMakerNavigation, imageBoxStyle, CustomTableCell,
  HeadingMaster2, ContainerStyled, CustomTable2
} from '../../../helper';
import { throttleFunction } from '../../../../../utils/throttling';
import { Service } from '../../../../../service';
import SelfRelease from './selfRelease';
import NomineeRelease from './nomineeRelease';
import store from '../../../../../redux/store';
import ThirdPartyRelease from './thirdPartyRelease';

const CustomForm = styled('form')(({ width }) => ({
  width: width || '500px'
}));

const CustomGrid = styled(Grid)`
 display: flex;
 align-items: center;
 word-break: break-all;
`;

const TableWrapper = styled('div')(() => ({
  overflow: 'auto',
  width: '100%'
}));

const amountFormat = Intl.NumberFormat('en-IN');

export const isAllowedForRelease = (makerBranch, transferBranch, selBranch) => {
  if (transferBranch) {
    if (transferBranch === selBranch) return true;
  } else if (makerBranch === selBranch) return true;
  return false;
};

const CollateralReleaseMaker = () => {
  const [tableData, setTableData] = useState([]);
  const [releaseToCustomer, setReleaseToCustomer] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [isSearchDisabled, setIsSearchDisabled] = useState(false);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [loading, setLoading] = useState({ loader: false, name: null });
  const [imageViewerURL, setImageViewerURL] = useState(null);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const {
    register, handleSubmit, formState: { errors }, reset, setValue
  } = useForm();
  const {
    register: register2,
    handleSubmit: handleSubmit2,
    formState: formState2,
    reset: reset2,
    setValue: setValue2,
  } = useForm();
  const loaderRef = useRef();
  const state = store.getState();
  const { selectedBranch } = state.user.userDetails;

  const searchDetailsHandler = async ({ lan }) => {
    try {
      loaderRef.current = true;
      setLoading({ loader: true, name: 'onSearch' });
      setIsImageLoading(true);
      const { data } = await Service.get(`${process.env.REACT_APP_LOAN_ACCOUNT_DETAILS}/${lan}?is_parent=1`);
      if (data?.status === 'CLO') {
        reset2();
        setCustomerDetails(null);
        setAlertShow({ open: true, msg: `LAN ${lan} has already been released.`, alertType: 'error' });
        return;
      }
      if (!isAllowedForRelease(data?.maker_branch, data?.transfer_branch, selectedBranch)) {
        reset2();
        setCustomerDetails(null);
        setAlertShow({ open: true, msg: `This LAN ${lan} does not belong to your branch${selectedBranch === VARIABLE.BRANCHALL ? '' : ` ${selectedBranch}`}.`, alertType: 'error' });
        return;
      }
      if (moment(data.disbursed_on).isSame(moment(), 'day')) {
        reset2();
        setCustomerDetails(null);
        setAlertShow({ open: true, msg: 'Disbursement done today. Hence, Collateral Release not allowed.', alertType: 'error' });
        return;
      }
      if (data?.parent_account_no) {
        reset2();
        setCustomerDetails(null);
        setAlertShow({ open: true, msg: 'Collateral Release is not allowed for a Top Up LAN.', alertType: 'error' });
        return;
      }
      if (data.status === 'DBD') {
        const customerData = await Service.get(`${process.env.REACT_APP_USER_VIEW}?fc=1&token=1&customer_id=${data.customer_id}&collateral=1`);
        const lanData = customerData?.data?.data?.loan_detail?.filter((item) => item.lan.trim() === lan.trim());
        if (lanData.length === 0) {
          setAlertShow({ open: true, msg: `LAN ${lan} does not exist in flexcube.`, alertType: 'error' });
          return;
        }
        const childLoans = customerData?.data?.data?.loan_detail?.filter((item) => item.parentAcctNo.trim() === lan.trim());
        const childLoansTotalDues = childLoans.reduce((acc, currentValue) => acc + currentValue.total_outstanding_for_foreclosure, 0);

        const request1 = Service.get(
          `${process.env.REACT_APP_USER_VIEW}?customer_id=${data?.customer_id}&branch_code=All Branches`
        );
        const request2 = Service.get(
          `${process.env.REACT_APP_GET_S3_URL}/?module=GOLD&doc=${data?.customer_photo}`
        );
        const request3 = Service.get(
          `${process.env.REACT_APP_GET_S3_URL}/?module=GOLD&doc=${data?.items_pic}`
        );
        await Promise.all([request1, request2, request3]).then((responses) => {
          const [customerInfo, customerPhoto, collateralPhoto] = responses;
          if (data?.items) {
            const tableDataArray = [];
            data.items.forEach((item, index) => {
              tableDataArray.push({ id: index, ...item });
            });
            setTableData(tableDataArray);
          }
          setCustomerDetails({
            loan_dt: data?.dt,
            cust_dt: customerInfo?.data?.data?.dt,
            amt_dt: lanData[0]?.dt,
            is_eligible: lanData[0].is_eligible,
            application_no: data?.application_no,
            loan_account_no: data?.loan_account_no,
            customer_id: data?.customer_id,
            total_weight_gm: data?.total_weight_gm,
            total_dues: lanData[0].total_outstanding_for_foreclosure + childLoansTotalDues,
            customer_full_name: `${data?.first_name} ${data?.middle_name} ${data?.last_name}`,
            customer_mobile_number: data?.customer_mobile_number,
            nominee_dob: customerInfo?.data?.data.nominee_dob,
            nominee_name: customerInfo?.data?.data?.nominee_name,
            nominee_mobile: customerInfo?.data?.data?.nominee_mobile,
            customer_photo: customerPhoto.data?.data?.full_path,
            consolidated_collateral_photo: collateralPhoto.data?.data?.full_path
          });
        }).catch((err) => {
          console.log('Error', err);
          reset2();
          setCustomerDetails(null);
          setAlertShow({ open: true, msg: 'Something went wrong, Please try again.', alertType: 'error' });
        });
      } else {
        reset2();
        setCustomerDetails(null);
        setAlertShow({ open: true, msg: 'LAN is not in disbursed state.', alertType: 'error' });
      }
    } catch (err) {
      console.log('error', err);
      reset2();
      setCustomerDetails(null);
      if (err?.response.data?.errors?.detail) {
        if (err.response.data.errors.detail === 'Not found.') {
          setAlertShow({ open: true, msg: 'No LAN found', alertType: 'error' });
        } else {
          setAlertShow({ open: true, msg: err.response.data.errors.detail, alertType: 'error' });
        }
      } else if (err.response.data?.errors?.lan_details) {
        setAlertShow({ open: true, msg: err.response.data.errors.lan_details, alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong, Please try again.', alertType: 'error' });
      }
    } finally {
      loaderRef.current = false;
      setLoading({ loader: false, name: null });
    }
  };

  const onSearchSubmit = ({ lan }) => {
    throttleFunction(
      {
        args1: [{ lan }],
        function1: searchDetailsHandler,
      },
      loaderRef,
      setIsSearchDisabled
    );
  };

  const searchResetHandler = () => {
    reset({ lan: null });
    reset2();
    setCustomerDetails(null);
  };

  const onProceedToRelease = ({ releaseTo }) => setReleaseToCustomer(releaseTo);

  const renderError = (name) => {
    if (errors?.[name]) {
      return <FormHelperText error>{errors?.[name].message}</FormHelperText>;
    }
  };

  const renderError2 = (name) => {
    if (formState2.errors?.[name]) {
      return <FormHelperText error>{formState2.errors?.[name].message}</FormHelperText>;
    }
  };

  const handleClose = (event, reason) => {
    if (reason && ['escapeKeyDown', 'backdropClick'].includes(reason)) {
      return;
    }
    setReleaseToCustomer(null);
  };

  const closeOnSuccess = () => {
    setReleaseToCustomer(null);
    setCustomerDetails(null);
    reset({ lan: null });
    reset2();
  };

  const handleImageLoad = () => setIsImageLoading(false);

  return (
    <>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={collateralReleaseMakerNavigation} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      <ContainerStyled padding='0 !important'>
        <ToastMessage
          alertShow={alertShow}
          setAlertShow={setAlertShow}
        />
        <HeaderContainer item xs={12}>
          <HeadingMaster>
            Collateral Release Maker
          </HeadingMaster>
        </HeaderContainer>
        <HeaderContainer
          item
          xs={12}
          sm={6}
          md={6}
          lg={6}
          xl={6}
          padding='0 20px 20px'
          display='flex'
          justifyContent='center'
        >
          <CustomForm
            onSubmit={handleSubmit(onSearchSubmit)}
          >
            <TextFieldStyled
              label='LAN*'
              {...register('lan', {
                onChange: (e) => setValue('lan', e.target.value.trim(), { shouldValidate: true }),
                required: 'Please enter LAN',
                pattern: { value: REGEX.NUMBER, message: 'Please enter valid LAN' },
                maxLength: { value: 20, message: 'LAN should not be more than 20 digits' }
              })}
            />
            {renderError('lan')}
            <Grid item xs={12} sm={12} padding='20px 0px 0px' display='flex' justifyContent='center'>
              <LoadingButtonPrimary
                variant='contained'
                loading={loading?.loader && loading?.name === 'onSearch'}
                disabled={isSearchDisabled}
                type='submit'
              >
                Search
              </LoadingButtonPrimary>
              <ResetButton onClick={() => searchResetHandler()}>
                Reset
              </ResetButton>
            </Grid>
          </CustomForm>
        </HeaderContainer>
        {
          customerDetails ? (
            <form
              onSubmit={handleSubmit2(onProceedToRelease)}
            >
              <Grid container padding='0px 20px 0px' display='flex' justifyContent='center'>
                <Grid item xs={12} sm={12} md={6} lg={6} xl={6} display='flex'>
                  <Grid item xs={12} sm={12} md={6} lg={5} xl={5}>
                    <HeadingMaster2 padding='0 !important'>Customer ID</HeadingMaster2>
                  </Grid>
                  <CustomGrid item xs={12} sm={12} md={6} lg={7} xl={7}>
                    :
                    &nbsp;
                    <span>{customerDetails.customer_id}</span>
                  </CustomGrid>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6} xl={6} display='flex'>
                  <Grid item xs={12} sm={12} md={6} lg={5} xl={5}>
                    <HeadingMaster2 padding='0 !important'>Customer Name</HeadingMaster2>
                  </Grid>
                  <CustomGrid item xs={12} sm={12} md={6} lg={7} xl={7}>
                    :
                    &nbsp;
                    <span>{customerDetails.customer_full_name}</span>
                  </CustomGrid>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6} xl={6} display='flex'>
                  <Grid item xs={12} sm={12} md={6} lg={5} xl={5}>
                    <HeadingMaster2 padding='0 !important'>LAN</HeadingMaster2>
                  </Grid>
                  <CustomGrid item xs={12} sm={12} md={6} lg={7} xl={7}>
                    :
                    &nbsp;
                    <span>{customerDetails.loan_account_no}</span>
                  </CustomGrid>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6} xl={6} display='flex'>
                  <Grid item xs={12} sm={12} md={6} lg={5} xl={5}>
                    <HeadingMaster2 padding='0 !important'>Total Dues</HeadingMaster2>
                  </Grid>
                  <CustomGrid item xs={12} sm={12} md={6} lg={7} xl={7}>
                    :
                    &nbsp;
                    <span>{amountFormat.format(customerDetails.total_dues)}</span>
                  </CustomGrid>
                </Grid>
              </Grid>
              <Grid container padding='20px' display='flex' justifyContent='center'>
                <Grid item xs={12} sm={6} md={6} lg={4} xl={4}>
                  <TextFieldStyled
                    label='Release To*'
                    select
                    {...register2('releaseTo', {
                      onChange: (e) => setValue2('releaseTo', e.target.value, { shouldValidate: true }),
                      required: 'Please select Release To'
                    })}
                  >
                    <SelectMenuStyle key='self' value='Self'>Self</SelectMenuStyle>
                    <SelectMenuStyle key='nominee' value='Nominee'>Nominee</SelectMenuStyle>
                    <SelectMenuStyle key='thirdParty' value='Third Party'>Third Party</SelectMenuStyle>
                  </TextFieldStyled>
                  {renderError2('releaseTo')}
                </Grid>
              </Grid>
              <Grid container padding='0px 20px 20px' display='flex' justifyContent='center'>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                  <HeadingMaster2 padding='0 !important'>Collateral Details:</HeadingMaster2>
                  <TableWrapper>
                    <CustomTable2>
                      <TableHead>
                        <TableRow>
                          <TableCell align='center'>Item Name</TableCell>
                          <TableCell align='center'>Count</TableCell>
                          <TableCell align='center'>Total Weight (in gm)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tableData.map((item) => (
                          <TableRow>
                            <CustomTableCell align='center'>{item?.full_name}</CustomTableCell>
                            <TableCell align='center'>{item?.item_count}</TableCell>
                            <TableCell align='center'>{item?.total_weight_gm}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <CustomTableCell align='center' colSpan={2}>Consolidated Total Weight</CustomTableCell>
                          <TableCell align='center'>{customerDetails.total_weight_gm}</TableCell>
                        </TableRow>
                      </TableBody>
                    </CustomTable2>
                  </TableWrapper>
                </Grid>
              </Grid>
              <Grid container padding='0px 20px 20px' display='flex' justifyContent='center'>
                <Grid item xs={12} sm={12} md={6} lg={3} xl={3} display='flex' alignItems='center'>
                  <HeadingMaster2 padding='0 !important'>Customer Photo</HeadingMaster2>
                </Grid>
                { isImageLoading
                  ? (
                    <Grid item xs={12} sm={12} md={6} lg={3} xl={3} style={{ margin: '10px 0px' }}>
                      <Skeleton
                        sx={{ bgcolor: '#8f8f91' }}
                        variant='rectangular'
                        width='200px'
                        height='150px'
                      />
                    </Grid>
                  )
                  : null}
                <Grid item xs={12} sm={12} md={6} lg={3} xl={3} display={isImageLoading ? 'none' : 'block'}>
                  <img
                    src={customerDetails.customer_photo}
                    onClick={() => setImageViewerURL(customerDetails.customer_photo)}
                    width='200px'
                    onLoad={handleImageLoad}
                    alt=''
                  />
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={3} xl={3} display='flex' alignItems='center'>
                  <HeadingMaster2 padding='0 !important'>Consolidated Collateral Photo</HeadingMaster2>
                </Grid>
                { isImageLoading
                  ? (
                    <Grid item xs={12} sm={12} md={6} lg={3} xl={3} style={{ margin: '10px 0px' }}>
                      <Skeleton
                        sx={{ bgcolor: '#8f8f91' }}
                        variant='rectangular'
                        width='200px'
                        height='150px'
                      />
                    </Grid>
                  )
                  : null}
                <Grid item xs={12} sm={12} md={6} lg={3} xl={3} display={isImageLoading ? 'none' : 'block'}>
                  <img
                    src={customerDetails.consolidated_collateral_photo}
                    onClick={() => setImageViewerURL(customerDetails.consolidated_collateral_photo)}
                    width='200px'
                    alt=''
                  />
                </Grid>
              </Grid>
              <Grid container padding='0px 20px 20px'>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} display='flex' justifyContent='center'>
                  <ButtonPrimary type='submit' disabled={!customerDetails.is_eligible}>Proceed to release</ButtonPrimary>
                </Grid>
              </Grid>
            </form>
          ) : null
        }
        <Modal
          open={imageViewerURL}
          onClose={() => setImageViewerURL(null)}
        >
          <Box sx={imageBoxStyle}>
            <img
              src={imageViewerURL}
              width='100%'
              alt=''
            />
          </Box>
        </Modal>
        <DialogBox
          isOpen={releaseToCustomer}
          fullScreen
          title={`Release To ${releaseToCustomer}`}
          width='100%'
          handleClose={handleClose}
        >
          <ContainerStyled padding='20px 0px !important'>
            { releaseToCustomer === 'Self' ? <SelfRelease customerDetails={customerDetails} closeOnSuccess={closeOnSuccess} /> : null }
            { releaseToCustomer === 'Nominee' ? <NomineeRelease customerDetails={customerDetails} closeOnSuccess={closeOnSuccess} /> : null }
            { releaseToCustomer === 'Third Party' ? <ThirdPartyRelease customerDetails={customerDetails} closeOnSuccess={closeOnSuccess} /> : null }
          </ContainerStyled>
        </DialogBox>
      </ContainerStyled>
    </>
  );
};
export default CollateralReleaseMaker;
