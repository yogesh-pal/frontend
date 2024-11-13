/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable object-shorthand */
/* eslint-disable max-len */
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import styled from '@emotion/styled';
import {
  Typography, useMediaQuery, Grid
} from '@mui/material';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import { useForm } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useSelector } from 'react-redux';
import { useScreenSize } from '../../../customHooks';
import {
  BreadcrumbsContainerStyled,
  BreadcrumbsWrapperContainerStyled, CustomContainerStyled, HeaderContainer, HeadingMaster,
  LoadingButtonPrimary,
  TextFieldStyled, ResetButton,
  AutoCompleteStyled,
  SelectMenuStyle
} from '../../../components/styledComponents';
import {
  MenuNavigation, ToastMessage,
  TableComponent,
  MultiToggleButton,
  ErrorText, DialogBox
} from '../../../components';
import { navigationDetails } from './navigationDetail';
import PageLoader from '../../../components/PageLoader';
import {
  CustomForm,
  Li,
} from '../../loanDisbursal/list/helper';
import {
  leadListingSearchValidation,
  togglerGroup,
  columnFields,
  STATUS,
  STATUS_FILTER_VALUES,
  LEAD_TYPE_VALUES,
  LEAD_TYPE,
  LEAD_TYPE_SHOW_VALUES
} from './constant';
import { Service } from '../../../service';
import { SERVICEURL } from '../../../constants';
import FormGenerator from '../../../components/formGenerator';
import { assignedLeadJson } from './assignedLeadJson';

const ButtonWrapper = styled(Button)(({ theme, isDisabled }) => ({
  background: theme?.button?.ternary,
  color: theme?.button?.primary,
  opacity: isDisabled ? 0.5 : 1,
  pointerEvents: isDisabled ? 'none' : 'auto',
  margin: '5px',
  padding: '10px 20px',
  borderRadius: '25px',
  '&.Mui-focused': {
    background: 'none',
    boxShadow: 'none',
  },
  '&:hover': {
    background: 'none',
    boxShadow: 'none',
  },
}));

const CardIcon = styled('div')(({ theme, screen }) => ({
  color: theme?.background?.secondary,
  svg: {
    fontSize: (screen === 'sm' || screen === 'xs') ? '50px' : '100px',
    color: theme?.background?.primary,
    borderRadius: '50%',
    padding: '16px',
    backgroundImage: 'linear-gradient(90deg, #d0d4f1 20%, #a560b4 100%)'
  },
  cursor: 'pointer'
}));

const TypographyStyled = styled(Typography)(() => ({
  textAlign: 'center',
  marginBottom: '10px'
}));

const AssignedLead = () => {
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [searchTitle, setSearchTitle] = useState('Lead Id');
  const [paramsValue, setParamsValue] = useState('lead_id');
  const [startDate, setStartDate] = useState(moment().subtract(30, 'days').format('MM/DD/YYYY'));
  const [isLoading, setIsLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const [open, setOpen] = useState(false);
  const [formConfiguration, setFormConfiguration] = useState(null);
  const [endDate, setEndDate] = useState(moment().format('MM/DD/YYYY'));
  const [statusValue, setStatusValue] = useState('');
  const [leadType, setLeadType] = useState(LEAD_TYPE.GL_WINBACK);
  const [isDisabled, setIsDisabled] = useState(false);
  const [pageInfo, setPageInfo] = useState({ pageNumber: 0, pageSize: 10 });
  const [filterType, setFilterType] = useState({
    leadId: '',
    customerName: '',
    mobileNo: '',
  });
  const [searchDetails, setSearchDetails] = useState({
    data: [],
    rowCount: 0,
  });
  const [leadDetails, setLeadDetails] = useState({});
  const { selectedBranch } = useSelector((state) => state.user.userDetails);

  const screen = useScreenSize();
  const {
    register, handleSubmit, setValue, formState: { errors },
    reset
  } = useForm();

  const handleLeadUpdate = async (values, setError) => {
    const {
      status,
      reschedule_date
    } = values;
    let response = false;
    if (status === STATUS.INTERESTED && !reschedule_date) {
      setError('reschedule_date', { type: 'custom', customMsg: 'Please select date' });
      response = true;
    }
    if (status === STATUS.NOT_PICKED && !reschedule_date) {
      setError('reschedule_date', { type: 'custom', customMsg: 'Please select date' });
      response = true;
    }
    if (status === STATUS.CALL_BACK_LATER && !reschedule_date) {
      setError('reschedule_date', { type: 'custom', customMsg: 'Please select date' });
      response = true;
    }
    return response;
  };

  const onSearchSubmit = async (value, refresh = 'not_reset') => {
    try {
      setIsLoading(true);
      const reqBody = {};
      reqBody.isStatusFilter = true;
      if (value) {
        if (value?.customer_name) {
          reqBody.fullName = value?.customer_name;
          reqBody.isStatusFilter = false;
          setFilterType((prev) => ({
            ...prev,
            customerName: value?.customer_name
          }));
        }
        if (value?.lead_id) {
          reqBody.id = value?.lead_id;
          reqBody.isStatusFilter = false;
          setFilterType((prev) => ({
            ...prev,
            leadId: value?.lead_id
          }));
        }
        if (value?.customer_mobile_number) {
          reqBody.phoneNumber = value?.customer_mobile_number;
          reqBody.isStatusFilter = false;
          setFilterType((prev) => ({
            ...prev,
            mobileNo: value?.customer_mobile_number
          }));
        }
      } else if (refresh !== 'reset') {
        if (filterType?.customerName) {
          reqBody.fullName = filterType?.customerName;
          reqBody.isStatusFilter = false;
        }
        if (filterType?.leadId) {
          reqBody.id = filterType?.leadId;
          reqBody.isStatusFilter = false;
        }
        if (filterType?.mobileNo) {
          reqBody.phoneNumber = filterType?.mobileNo;
          reqBody.isStatusFilter = false;
        }
      }

      reqBody.startDate = moment(startDate).format('YYYY-MM-DD');
      reqBody.endDate = moment(endDate).format('YYYY-MM-DD');
      reqBody.externalSource = leadType;
      if (leadType === LEAD_TYPE.GL_WINBACK || leadType === LEAD_TYPE.GL_TOPUP) {
        reqBody.pageNo = pageInfo.pageNumber;
        reqBody.pageSize = pageInfo.pageSize;
        reqBody.branchCode = selectedBranch;
      }
      reqBody.productType = 'GOLD_LOAN';
      if (statusValue && refresh !== 'reset') {
        reqBody.isStatusFilter = false;
        reqBody.status = statusValue;
      }

      const { data } = await Service.post(SERVICEURL.CIRCULAR.LEAD_DASHBOARD, reqBody);

      if (data?.status !== 200) {
        setAlertShow({
          open: true,
          msg: data?.message || 'Something went wrong',
          alertType: 'error'
        });
        setSearchDetails((prev) => ({
          ...prev,
          data: [],
        }));
        return;
      }
      if (data?.result?.length === 0 || data?.result?.totalRecords === 0) {
        setAlertShow({
          open: true,
          msg: 'No Record Found',
          alertType: 'error'
        });
      }
      let userDetails = [];
      if (leadType === LEAD_TYPE.SWARNIM) {
        userDetails = data?.result?.map((item, index) => ({
          ...item,
          phoneNumberMasked: item?.phoneNumber ? `XXXXXX${item?.phoneNumber.substring(6,)}` : '',
          appointmentDate: item?.appointmentDate ? moment(item?.appointmentDate).format('DD/MM/YYYY') : '',
          loanAmount: item?.loanAmount ? item?.loanAmount.toLocaleString('en-US', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
          }) : '',
          _id: index + 1,
        }));
      }
      if (leadType === LEAD_TYPE.GL_WINBACK || leadType === LEAD_TYPE.GL_TOPUP) {
        userDetails = data?.result?.data?.map((item, index) => ({
          ...item,
          phoneNumberMasked: item?.phoneNumber ? `XXXXXX${item?.phoneNumber.substring(6,)}` : '',
          appointmentDate: item?.appointmentDate ? moment(item?.appointmentDate).format('DD/MM/YYYY') : '',
          loanAmount: item?.loanAmount ? item?.loanAmount.toLocaleString('en-US', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
          }) : '',
          _id: index + 1,
        }));
      }
      setSearchDetails((prev) => ({
        ...prev,
        data: userDetails,
        rowCount: (leadType === LEAD_TYPE.GL_WINBACK || leadType === LEAD_TYPE.GL_TOPUP) ? data?.result?.totalRecords : prev.rowCount,
      }));
    } catch (e) {
      console.log(e);
      setAlertShow({
        open: true,
        msg: e?.response?.data?.message || 'Something went wrong',
        alertType: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const seletedValueHandler = (value) => {
    try {
      if (value) {
        setParamsValue(value);
        const searchTemp = togglerGroup.values.find((item) => item.value === value);
        setSearchTitle(searchTemp?.name);
        reset({ [value]: null });
      }
    } catch (e) {
      console.log('Error', e);
    }
  };
  const searchResetHandler = () => {
    setValue(paramsValue, '');
    setStatusValue('');
    setSearchDetails((pre) => ({
      ...pre,
      rowCount: 0,
      data: [],
    }));
    setFilterType((prev) => ({
      ...prev,
      customerName: '',
      leadId: '',
      mobileNo: '',
    }));
    onSearchSubmit(null, 'reset');
  };
  const handleEndDateChange = (newEndDate) => {
    if (startDate) {
      setEndDate(newEndDate);
    } else {
      setAlertShow({ open: true, msg: 'Please select start date.', alertType: 'error' });
    }
  };
  const handleStartDateChange = (newEndDate) => {
    setStartDate(newEndDate);
  };
  const handleStatusChange = (event, value) => {
    setStatusValue(value);
  };

  const onPageChangeClient = () => {
    console.log('client side page change');
  };

  const onPageSizeChangeClient = () => {
    console.log('client side page size change');
  };

  const onPageSizeChange = (pageSize) => {
    setPageInfo({ pageNumber: pageInfo.pageNumber, pageSize });
  };

  const onPageChange = (pageNumber) => {
    setPageInfo({ pageNumber, pageSize: pageInfo.pageSize });
  };
  const disableEndDates = (currentDate) => moment(currentDate).isAfter(moment(startDate).add(90, 'days'), 'day') || moment(currentDate).isBefore(moment(startDate), 'day');

  const openUpdateLeadDialog = (cellValues) => {
    setLeadDetails({ ...cellValues.row });
    setOpen(true);
  };

  const columnFieldsHandler = columnFields({
    openUpdateLeadDialog
  });

  const handleClose = () => {
    setOpen(false);
  };

  const assignedLeadHandler = assignedLeadJson(
    leadDetails,
    handleLeadUpdate
  );

  const formHandler = async (values) => {
    try {
      setLoader(true);
      const {
        status,
        reschedule_date
      } = values;
      const rescheduleDate = moment(reschedule_date, 'ddd MMM DD YYYY HH:mm:ss [GMT]Z (zz)');
      const reqBody = {
        leadId: leadDetails.id,
        leadStatus: status,
        updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        extSource: leadType,
      };
      if (status !== STATUS.NOT_INTERESTED) {
        reqBody.appointmentDate = rescheduleDate.format('YYYY-MM-DD HH:mm:ss');
        reqBody.resetAppointmentDate = true;
      }

      if (status === STATUS.NOT_INTERESTED) {
        reqBody.appointmentDate = null;
        reqBody.resetAppointmentDate = true;
      }

      const { data } = await Service.post(SERVICEURL.CIRCULAR.LEAD_UPDATE, reqBody);
      if (data?.status === 400) {
        setAlertShow({
          open: true,
          msg: data?.message || 'Lead is not updated at the moment. Please try again later',
          alertType: 'error'
        });
      } else {
        setAlertShow({
          open: true,
          msg: 'Lead is updated updated successfully.',
          alertType: 'success'
        });
        setOpen(false);
        onSearchSubmit();
      }
    } catch (e) {
      setAlertShow({
        open: true,
        msg: e?.response?.data?.message || 'Something went wrong',
        alertType: 'error'
      });
    } finally {
      setLoader(false);
    }
  };

  const callApiHandler = async () => {
    setIsDisabled(true);
    try {
      const { phoneNumber } = leadDetails;
      const reqBody = {
        customerNumber: phoneNumber,
      };
      const { data } = await Service.post(SERVICEURL.CIRCULAR.LEAD_CALL_SLASH_RTC, reqBody);
      if (data?.STATUS_CODE === 200) {
        // callpicked
      }
      if (data?.STATUS_CODE === 404) {
        // call not picked
      }
      setIsDisabled(false);
    } catch (e) {
      console.log('errr');
      console.log(e);
      setIsDisabled(false);
      setAlertShow({
        open: true,
        msg: e?.response?.data?.message || 'Something went wrong',
        alertType: 'error'
      });
    }
  };

  const onLeadTypeChange = (value) => {
    setLeadType(value);
    setPageInfo({ pageNumber: 0, pageSize: pageInfo.pageSize });
  };

  useEffect(() => {
    onSearchSubmit();
  }, [startDate, endDate, statusValue, leadType, pageInfo]);

  return (
    <>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={navigationDetails} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      <CustomContainerStyled padding='10px !important'>
        <ToastMessage
          alertShow={alertShow}
          setAlertShow={setAlertShow}
        />
        <HeaderContainer item xs={12}>
          <HeadingMaster>
            Assigned Leads
          </HeadingMaster>
        </HeaderContainer>
        <HeaderContainer item xs={12} display={['xs', 'sm'].includes(screen) ? 'block' : 'flex'} justifyContent='space-between'>
          <div>
            <CustomForm
              onSubmit={handleSubmit(onSearchSubmit)}
              width={['xs', 'sm'].includes(screen) ? '100%' : ''}
            >
              <TextFieldStyled
                id='outlined-basic'
                label={`${searchTitle} *`}
                variant='outlined'
                defaultValue=''
                {...register(paramsValue, {
                  required: true,
                  pattern: (leadListingSearchValidation[paramsValue]?.validation?.pattern)
                    ? new RegExp(leadListingSearchValidation[paramsValue]?.validation?.pattern) : undefined,
                  maxLength: (leadListingSearchValidation[paramsValue]?.validation?.maxLength)
                    ? leadListingSearchValidation[paramsValue]?.validation?.maxLength : undefined,
                  minLength: (leadListingSearchValidation[paramsValue]?.validation?.minLength)
                    ? leadListingSearchValidation[paramsValue]?.validation?.minLength : undefined,
                })}
                onChange={(e) => setValue(paramsValue, e.target.value, { shouldValidate: true })}
              />
              <LoadingButtonPrimary
                variant='contained'
                disabled={isLoading}
                loading={isLoading?.loader && isLoading?.name === 'SEARCH'}
                type='submit'
                margin='5px 5px 5px 24px !important'
              >
                Search
              </LoadingButtonPrimary>
              <ResetButton onClick={() => searchResetHandler()}>
                Reset
              </ResetButton>
            </CustomForm>
            <ErrorText input={leadListingSearchValidation[paramsValue]} errors={errors} />
            <HeaderContainer padding='10px 0px'>
              <MultiToggleButton
                orientation={screen === 'xs' ? 'vertical' : 'horizontal'}
                details={togglerGroup}
                seletedValueHandler={seletedValueHandler}
              />
            </HeaderContainer>
          </div>
          <div>
            <Grid item display='flex' margin='0px 0px 15px 0px'>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label='Start Date'
                  value={startDate}
                  disableHighlightToday
                  inputFormat='dd/MM/yyyy'
                  onChange={(newValue) => handleStartDateChange(newValue)}
                  disableFuture
                  renderInput={(params) => (
                    <TextFieldStyled
                      {...params}
                      error={false}
                      onKeyDown={(e) => {
                        e.preventDefault();
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
              <div style={{ width: '100%', paddingLeft: '10px' }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label='End Date'
                    value={endDate}
                    disableHighlightToday
                    inputFormat='dd/MM/yyyy'
                    onChange={(newValue) => handleEndDateChange(newValue)}
                    shouldDisableDate={disableEndDates}
                    disableFuture
                    renderInput={(params) => (
                      <TextFieldStyled
                        {...params}
                        error={false}
                        onKeyDown={(e) => {
                          e.preventDefault();
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </div>
            </Grid>
            <Grid container display='flex'>
              <Grid
                item
                xs={12}
                md={6}
                sx={{
                  mt: { xs: '10px', md: 0 },
                }}
              >
                <TextFieldStyled
                  label='Lead Type'
                  select
                  style={{ paddingBottom: '10px' }}
                  value={leadType}
                  onChange={(e) => onLeadTypeChange(e.target.value)}
                >
                  {
                    LEAD_TYPE_VALUES.map((value) => <SelectMenuStyle value={value}>{LEAD_TYPE_SHOW_VALUES[value]}</SelectMenuStyle>)
                  }
                </TextFieldStyled>
              </Grid>
              <Grid
                item
                xs={12}
                md={6}
                sx={{
                  mt: { xs: '10px', md: 0 },
                  pl: { md: '10px' }
                }}
              >
                <AutoCompleteStyled
                  disableClearable
                  id='auto-complete'
                  value={statusValue}
                  onChange={handleStatusChange}
                  options={STATUS_FILTER_VALUES}
                  renderOption={(prop, option) => (
                    <Li
                      {...prop}
                    >
                      {option}
                    </Li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label='Status'
                    />
                  )}
                />
              </Grid>
            </Grid>
          </div>
        </HeaderContainer>
        <Grid item xs={12}>
          {leadType === LEAD_TYPE.GL_WINBACK
          && (
          <TableComponent
            cursor='default'
            clientPaginationMode={leadType === LEAD_TYPE.SWARNIM}
            rows={searchDetails?.data || []}
            columns={columnFieldsHandler}
            checkboxAllowed={false}
            loading={isLoading}
            isLeadListing
            rowCount={searchDetails?.rowCount}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            pageSizeNumber={pageInfo.pageSize}
          />
          )}
          {
            leadType === LEAD_TYPE.SWARNIM
            && (
            <TableComponent
              cursor='default'
              clientPaginationMode={leadType === LEAD_TYPE.SWARNIM}
              rows={searchDetails?.data || []}
              columns={columnFieldsHandler}
              checkboxAllowed={false}
              loading={isLoading}
              isLeadListing
              rowCount={searchDetails?.data?.length}
              onPageChange={onPageChangeClient}
              onPageSizeChange={onPageSizeChangeClient}
            />
            )
          }
          {leadType === LEAD_TYPE.GL_TOPUP
          && (
          <TableComponent
            cursor='default'
            clientPaginationMode={leadType === LEAD_TYPE.SWARNIM}
            rows={searchDetails?.data || []}
            columns={columnFieldsHandler}
            checkboxAllowed={false}
            loading={isLoading}
            isLeadListing
            rowCount={searchDetails?.rowCount}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            pageSizeNumber={pageInfo.pageSize}
          />
          )}
        </Grid>
        {loader ? <PageLoader /> : null}
        <DialogBox
          isOpen={open}
          fullScreen
          title='Assigned Lead'
          width='100%'
          handleClose={handleClose}
        >
          <CustomContainerStyled>
            <HeaderContainer item xs={12} justifyContent='center' alignItems='center'>
              <HeadingMaster>
                Lead Details
              </HeadingMaster>
            </HeaderContainer>
            <Grid container alignItems='center'>
              <Grid item xs={12} sm={9}>
                <FormGenerator
                  formDetails={assignedLeadHandler}
                  formHandler={formHandler}
                  setFormDetails={setFormConfiguration}
                  alertShow={alertShow}
                  setAlertShow={setAlertShow}
                />
              </Grid>
              <Grid item xs={12} sm={3} cursor='pointer' display='flex' flexDirection='column'>
                <TypographyStyled>
                  Make a Call
                </TypographyStyled>
                <ButtonWrapper disabled={isDisabled || leadDetails?.status === 'DISBURSED'} isDisabled={isDisabled || leadDetails?.status === 'DISBURSED'}>
                  <CardIcon onClick={callApiHandler}>
                    <PhoneInTalkIcon />
                  </CardIcon>
                </ButtonWrapper>
              </Grid>
            </Grid>
          </CustomContainerStyled>
        </DialogBox>
      </CustomContainerStyled>
    </>
  );
};

export default AssignedLead;
