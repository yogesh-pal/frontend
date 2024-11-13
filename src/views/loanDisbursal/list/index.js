/* eslint-disable max-len */
/* eslint-disable no-nested-ternary */
import moment from 'moment';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert, DialogActions,
  DialogContent, Grid, Popover
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import CheckerComponent from './checker';
import { Service } from '../../../service';
import ColenderComponent from './colender';
import DisbursementComponent from './disbursement';
import { useScreenSize } from '../../../customHooks';
import PageLoader from '../../../components/PageLoader';
import { ROUTENAME, VARIABLE } from '../../../constants';
import {
  columnFields, navigationDetails, losListingSearchValidation, togglerGroup,
  stageName, DownLoadButtonDiv, CustomDiv, CustomDiv2, CustomDialog, CustomDiv3,
  CustomForm, Li, CustomDiv4
} from './helper';
import {
  ToastMessage, MenuNavigation, TableComponent, DialogBox, MultiToggleButton,
  ErrorText
} from '../../../components';
import {
  ButtonPrimary, CustomContainerStyled, BreadcrumbsWrapperContainerStyled, AutoCompleteStyled,
  BreadcrumbsContainerStyled, HeadingMaster, HeaderContainer, ContainerStyled, LoadingButtonPrimary,
  TextFieldStyled, ResetButton
} from '../../../components/styledComponents';

const LoanDisbursalSearch = () => {
  const [clickedRow, setClickedRow] = useState();
  const [anchorEl, setAnchorEl] = useState(null);
  const [showError, setShowError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [utrDetails, setUTRDetails] = useState(null);
  const [utrLoading, setUTRLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [branchOption, setBranchOption] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [searchTitle, setSearchTitle] = useState('LAN');
  const [isColenderOpen, setIsColenderOpen] = useState(false);
  const [paramsValue, setParamsValue] = useState('loan_account_no');
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [endDate, setEndDate] = useState(moment().format('MM/DD/YYYY'));
  const [isShowPDFDownloadModal, setIsShowPDFDownloadModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState({ loading: false, name: null });
  const { branchCodes, selectedBranch } = useSelector((state) => state.user.userDetails);
  const [startDate, setStartDate] = useState(moment().subtract(2, 'days').format('MM/DD/YYYY'));
  const [branch, setBranch] = useState(selectedBranch === VARIABLE.BRANCHALL ? '' : selectedBranch);
  const [isOpen, setIsOpen] = useState({
    isCheckerOpen: false,
    isDeviationOpen: false,
    isDisbursementOpen: false
  });
  const [searchDetails, setSearchDetails] = useState({
    data: [],
    rowCount: 0,
    pageNumber: 1,
    pageSize: 15
  });
  const {
    register, handleSubmit, setValue, formState: { errors }, reset, getValues
  } = useForm();

  const navigate = useNavigate();
  const screen = useScreenSize();

  const addCustomerhandler = () => {
    try {
      navigate(ROUTENAME?.loanCreationCustomerSearch);
    } catch (e) {
      console.log('Error', e);
    }
  };

  const searchDetailsHandler = async (pageNumber, pageSize, params) => {
    try {
      setIsLoading(true);
      let url = `${process.env.REACT_APP_LOAN_LISTING}?page=${pageNumber}&page_size=${pageSize}`;
      if (params?.branchID && params.branchID !== VARIABLE.BRANCHALL) {
        url += `&branch_code=${params.branchID}`;
      }
      if (params?.startDate && params?.endDate && moment(params.startDate, 'dd/mm/yyyy').isValid() && moment(params.endDate, 'dd/mm/yyyy').isValid()) {
        url += `&start_date=${params.startDate}&end_date=${params.endDate}`;
      }
      if (params?.customer_mobile_number) {
        url += `&customer_mobile_number=${params.customer_mobile_number}`;
      }
      if (params?.application_no) {
        url += `&application_no=${params.application_no}`;
      }
      if (params?.loan_account_no) {
        url += `&loan_account_no=${params.loan_account_no}`;
      }
      const { data } = await Service.get(url);
      const userDetails = data.results.map((item, index) => ({
        _id: index + 1,
        stageName: stageName[item?.status],
        ...item,
        loan_account_no: item?.loan_account_no || 'NA',
      }));
      setSearchDetails((pre) => ({
        ...pre,
        data: userDetails || [],
      }));
      setIsLoading(false);
    } catch (e) {
      if (e?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else {
        setAlertShow({
          open: true,
          msg: 'Something went wrong while fetching Loan Disbursal list.',
          alertType: 'error'
        });
      }
      console.log('Error', e);
    }
  };

  const getListCount = async (params) => {
    try {
      let url = `${process.env.REACT_APP_LOS_COUNT}`;
      if (params?.branchID && params.branchID !== VARIABLE.BRANCHALL) {
        url += `?branch_code=${params.branchID}`;
      }
      if (params?.startDate && params?.endDate && moment(params.startDate, 'dd/mm/yyyy').isValid() && moment(params.endDate, 'dd/mm/yyyy').isValid()) {
        url += `${url.includes('?') ? '&' : '?'}start_date=${params.startDate}&end_date=${params.endDate}`;
      }
      if (params?.customer_mobile_number) {
        url += `${url.includes('?') ? '&' : '?'}customer_mobile_number=${params.customer_mobile_number}`;
      }
      if (params?.application_no) {
        url += `${url.includes('?') ? '&' : '?'}application_no=${params.application_no}`;
      }
      if (params?.loan_account_no) {
        url += `${url.includes('?') ? '&' : '?'}loan_account_no=${params.loan_account_no}`;
      }
      const { data, status } = await Service.get(url);
      if (status === 200) {
        setSearchDetails((pre) => ({
          ...pre,
          rowCount: data?.count,
        }));
      }
    } catch (err) {
      setAlertShow({ open: true, msg: 'Something went wrong while fetching list count.', alertType: 'error' });
    }
  };

  const viewDetailsHandler = async (field, row) => {
    console.log('fjdksla----', field, row);
    try {
      if ((row.status === 'DBD' && field === 'documents') || row.status === 'CLO' || row.status === 'CHR' || row.status === 'DBR') {
        return;
      }
      if (row.colender === 'KVB' && (row.status === 'CLR' || row.status === 'CLP')) {
        return;
      }
      if (row.status === 'CHK') {
        setClickedRow(row);
        setIsOpen({ isCheckerOpen: true, isDeviationOpen: false, isDisbursementOpen: false });
        return;
      }
      if (row.status === 'DVN') {
        setClickedRow(row);
        setIsOpen({ isCheckerOpen: false, isDeviationOpen: true, isDisbursementOpen: false });
        return;
      }
      if (row.status === 'DBD') {
        if (row.colender !== 'SHIVALIK' && row.net_disbursment_mode === 'CASH') {
          setUTRDetails({ utr: 'NA', status: 'NA' });
        }
        setClickedRow(row);
        setIsShowPDFDownloadModal(true);
        return;
      }
      if (row.status === 'MKR') {
        if (branchCodes.length <= 1) {
          navigate(`${ROUTENAME?.loanCreationMaker}/${row.application_no}-${row.customer_id}`);
        }
      }
      if (row.status === 'DBT' || row.status === 'DBF' || row.status === 'DBP') {
        setClickedRow(row);
        setIsOpen({ isCheckerOpen: false, isDeviationOpen: false, isDisbursementOpen: true });
      }
      if (row.status === 'CLP' || row.status === 'CLR' || row.status === 'CDP' || row.status === 'CDR') {
        setClickedRow(row);
        setIsColenderOpen(true);
      }
    } catch (e) {
      console.log('Error', e);
    }
  };

  const onPageSizeChange = (pageSize) => {
    try {
      setSearchDetails((pre) => ({
        ...pre,
        pageSize
      }));
      searchDetailsHandler(searchDetails.pageNumber, pageSize, {
        branchID: branch,
        [paramsValue]: getValues(paramsValue)?.trim(),
        startDate: moment(startDate).format('DD/MM/YYYY'),
        endDate: moment(endDate).format('DD/MM/YYYY')
      });
    } catch (e) {
      console.log(e);
    }
  };

  const onPageChange = (pageNumber) => {
    try {
      setSearchDetails((pre) => ({
        ...pre,
        pageNumber
      }));
      searchDetailsHandler(pageNumber, searchDetails.pageSize, {
        branchID: branch,
        [paramsValue]: getValues(paramsValue)?.trim(),
        startDate: moment(startDate).format('DD/MM/YYYY'),
        endDate: moment(endDate).format('DD/MM/YYYY')
      });
    } catch (e) {
      console.log(e);
    }
  };

  const branchSelectHandler = (event, value) => {
    try {
      setBranch(value);
      setSearchDetails((pre) => ({
        ...pre,
        pageNumber: 1,
        pageSize: 15
      }));
      searchDetailsHandler(1, searchDetails.pageSize, {
        branchID: value,
        [paramsValue]: getValues(paramsValue)?.trim(),
        startDate: moment(startDate).format('DD/MM/YYYY'),
        endDate: moment(endDate).format('DD/MM/YYYY')
      });
      getListCount({
        branchID: value,
        [paramsValue]: getValues(paramsValue)?.trim(),
        startDate: moment(startDate).format('DD/MM/YYYY'),
        endDate: moment(endDate).format('DD/MM/YYYY')
      });
    } catch (e) {
      console.log('Error', e);
    }
  };

  const handleClose = (msg) => {
    try {
      if (msg) {
        setAlertShow({
          open: true,
          msg,
          alertType: 'error'
        });
      }
      setIsOpen({ isCheckerOpen: false, isDeviationOpen: false, isDisbursementOpen: false });
      setIsColenderOpen(false);
    } catch (e) {
      console.log('Error', e);
    }
  };

  const initalLoanDetailsHandler = (msg) => {
    try {
      setIsColenderOpen(false);
      if (msg) {
        setAlertShow(msg);
      }
      searchDetailsHandler(1, searchDetails.pageSize, {
        branchID: branch,
        [paramsValue]: getValues(paramsValue)?.trim(),
        startDate: moment(startDate).format('DD/MM/YYYY'),
        endDate: moment(endDate).format('DD/MM/YYYY')
      });
      getListCount({
        branchID: branch,
        [paramsValue]: getValues(paramsValue)?.trim(),
        startDate: moment(startDate).format('DD/MM/YYYY'),
        endDate: moment(endDate).format('DD/MM/YYYY')
      });
    } catch (e) {
      console.log('Error', e);
    }
  };

  useEffect(() => {
    if (branchCodes.length) {
      setBranchOption(branchCodes);
    }
    searchDetailsHandler(1, searchDetails.pageSize, { branchID: selectedBranch === VARIABLE.BRANCHALL ? '' : selectedBranch });
    getListCount({ branchID: branch });
  }, []);

  const handleEndDateChange = (newEndDate) => {
    if (startDate) {
      setEndDate(newEndDate);
      getListCount({
        branchID: branch,
        [paramsValue]: getValues(paramsValue)?.trim(),
        startDate: moment(startDate).format('DD/MM/YYYY'),
        endDate: moment(newEndDate).format('DD/MM/YYYY')
      });
      searchDetailsHandler(searchDetails.pageNumber, searchDetails.pageSize, {
        branchID: branch,
        [paramsValue]: getValues(paramsValue)?.trim(),
        startDate: moment(startDate).format('DD/MM/YYYY'),
        endDate: moment(newEndDate).format('DD/MM/YYYY')
      });
    } else {
      setAlertShow({ open: true, msg: 'Please select start date.', alertType: 'error' });
    }
  };

  const downloadFile = async (docName, row) => {
    try {
      setShowError(null);
      setIsDownloading({ loading: true, name: docName });
      const { data } = await Service.get(`${process.env.REACT_APP_APPLICATION_LOS_CHECKER}/${clickedRow.application_no}/documents/${docName === 'branchCopy' && !row.parent_account_no ? 3 : 2}`);
      if (data.success) {
        window.open(data?.data, '_self');
      } else {
        setShowError('Please retry after 30 seconds.');
      }
    } catch (err) {
      console.log('err', err);
      setShowError('Please retry after 30 seconds.');
    } finally {
      setTimeout(() => {
        setIsDownloading({ loading: false, name: null });
      }, 1000);
    }
  };

  const getUTRDetails = async () => {
    try {
      setShowError(null);
      setUTRLoading(true);
      const { data, status } = await Service.post(process.env.REACT_APP_LOS_UTR_DETAILS, {
        loan_account_no: clickedRow.loan_account_no
      });
      if (status === 200 && data?.utr) {
        setUTRDetails(data);
      } else {
        data?.error_description ? setShowError(data.error_description) : setShowError('Please retry after 30 minutes.');
      }
    } catch (err) {
      console.log('err', err);
      setShowError('Please retry after 30 minutes.');
    } finally {
      setUTRLoading(false);
    }
  };

  const handleDocView = async (source) => {
    try {
      setAnchorEl(false);
      setPageLoading(true);
      const { data } = await Service.get(`${process.env.REACT_APP_COLLATERAL_SERVICE}/applications/${selectedRow.application_no}/documents?source_module=${source}&doc=1`);
      if (data?.success) {
        fetch(data.data)
          .then((res) => res.blob())
          .then((res) => {
            const file = new File([res], 'document.pdf', { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL, '_blank');
          });
      }
    } catch (err) {
      console.log('err', err);
      if (err?.response?.status === 404) {
        setAlertShow({ open: true, msg: `${source === 'PR' ? 'Part Release document' : 'Satisfaction Letter'} not found`, alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong. Please try again!', alertType: 'error' });
      }
    } finally {
      setPageLoading(false);
    }
  };

  const onSearchSubmit = async (value) => {
    getListCount({
      branchID: branch,
      // startDate: moment(startDate).format('DD/MM/YYYY'),
      // endDate: moment(endDate).format('DD/MM/YYYY'),
      ...value
    });
    searchDetailsHandler(searchDetails.pageNumber, searchDetails.pageSize, {
      branchID: branch,
      // startDate: moment(startDate).format('DD/MM/YYYY'),
      // endDate: moment(endDate).format('DD/MM/YYYY'),
      ...value
    });
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
    if (getValues(paramsValue).trim()) {
      getListCount({
        branchID: branch,
        startDate: moment(startDate).format('DD/MM/YYYY'),
        endDate: moment(endDate).format('DD/MM/YYYY')
      });
      searchDetailsHandler(searchDetails.pageNumber, searchDetails.pageSize, {
        branchID: branch,
        startDate: moment(startDate).format('DD/MM/YYYY'),
        endDate: moment(endDate).format('DD/MM/YYYY'),
      });
    }
    reset({ [paramsValue]: null });
  };

  const handleCamReportView = () => {
    window.open(`/cam-report/${selectedRow.customer_id}-${selectedRow.application_no}`, '_blank');
  };

  const handleTopUPCAM = (row) => {
    window.open(`/cam-report/${row.customer_id}-${row.application_no}`, '_blank');
  };

  const popOverComponent = ({ row }) => (
    row.status === 'DBD' || row.status === 'CLO'
      ? (
        !row.parent_account_no
          ? (
            <>
              <Popover
                id='simple-popover'
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
              >
                <CustomDiv2>
                  <CustomDiv3 onClick={() => handleCamReportView()}>CAM</CustomDiv3>
                  <CustomDiv3 onClick={() => handleDocView('PR')}>Part Release</CustomDiv3>
                  <CustomDiv3 onClick={() => handleDocView('CR')}>Satisfaction Letter</CustomDiv3>
                </CustomDiv2>
              </Popover>
              <ButtonPrimary onClick={(event) => {
                setSelectedRow(row);
                setAnchorEl(event.currentTarget);
              }}
              >
                View
              </ButtonPrimary>
            </>
          ) : <CustomDiv4 onClick={() => handleTopUPCAM(row)}>CAM</CustomDiv4>
      )
      : 'NA'
  );

  const handlePDFModalClose = (event, reason) => {
    if (reason && reason === 'backdropClick') {
      return;
    }
    setShowError(null);
    setIsShowPDFDownloadModal(false);
    setUTRDetails(null);
  };

  const disableEndDates = (currentDate) => moment(currentDate).isAfter(moment(startDate).add(7, 'days'), 'day') || moment(currentDate).isBefore(moment(startDate), 'day');

  const rowClassNameHandler = ({ row }) => {
    if (row.colender === 'KVB' && (row.status === 'CLR' || row.status === 'CLP')) {
      return 'disabledRow';
    }
    return 'enabledRow';
  };
  return (
    <>
      {pageLoading ? <PageLoader /> : null}
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={navigationDetails} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      <CustomContainerStyled padding='0 !important'>
        <ToastMessage
          alertShow={alertShow}
          setAlertShow={setAlertShow}
        />
        <HeaderContainer item xs={12}>
          <HeadingMaster>
            Loan Disbursal
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
                  pattern: (losListingSearchValidation[paramsValue]?.validation?.pattern)
                    ? new RegExp(losListingSearchValidation[paramsValue]?.validation?.pattern) : undefined,
                  maxLength: (losListingSearchValidation[paramsValue]?.validation?.maxLength)
                    ? losListingSearchValidation[paramsValue]?.validation?.maxLength : undefined,
                  minLength: (losListingSearchValidation[paramsValue]?.validation?.minLength)
                    ? losListingSearchValidation[paramsValue]?.validation?.minLength : undefined,
                })}
                onChange={(e) => setValue(paramsValue, e.target.value, { shouldValidate: true })}
              />
              <LoadingButtonPrimary
                variant='contained'
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
            <ErrorText input={losListingSearchValidation[paramsValue]} errors={errors} />
            <HeaderContainer padding='10px 0px'>
              <MultiToggleButton
                orientation={screen === 'xs' ? 'vertical' : 'horizontal'}
                details={togglerGroup}
                seletedValueHandler={seletedValueHandler}
              />
            </HeaderContainer>
          </div>
          <div>
            <Grid item xs={12} sm={branchCodes.length <= 1 ? 8 : 12} md={branchCodes.length <= 1 ? 6 : 12} lg={branchCodes.length <= 1 ? 4 : 8} xl={branchCodes.length <= 1 ? 4 : 8} display='flex' justifyContent={['xs', 'sm'].includes(screen) ? 'space-between' : 'end'} margin='0px 0px 15px 0px'>
              {branchCodes.length <= 1 && (
              <ButtonPrimary onClick={addCustomerhandler}>
                Create New Loan
              </ButtonPrimary>
              )}
              <AutoCompleteStyled
                disablePortal
                disableClearable
                id='demo-simple-select-label'
                options={branchOption}
                value={branch}
                sx={{ width: '50%', paddingLeft: branchCodes.length <= 1 || (branchCodes.length >= 1 && !['xs', 'sm'].includes(screen)) ? '10px' : '0px' }}
                onChange={(event, value) => branchSelectHandler(event, value)}
                renderInput={(params) => (
                  <TextField {...params} label='Branch ID' />
                )}
                renderOption={(props, option) => (
                  <Li {...props}>{option}</Li>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={branchCodes.length <= 1 ? 8 : 12} md={branchCodes.length <= 1 ? 6 : 12} lg={branchCodes.length <= 1 ? 4 : 8} xl={branchCodes.length <= 1 ? 4 : 8} display='flex'>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label='Start Date'
                  value={startDate}
                  disableHighlightToday
                  inputFormat='dd/MM/yyyy'
                  onChange={(newValue) => {
                    setStartDate(newValue);
                    setEndDate(null);
                  }}
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
          </div>
        </HeaderContainer>
        <Grid item xs={12}>
          <TableComponent
            rows={searchDetails?.data}
            columns={columnFields(popOverComponent)}
            checkboxAllowed={false}
            handleCellClick={viewDetailsHandler}
            clientPaginationMode={false}
            loading={isLoading}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            rowCount={searchDetails?.rowCount}
            cursor='pointer'
            pageSizeNumber={searchDetails?.pageSize}
            rowClassNameHandler={rowClassNameHandler}
          />
        </Grid>
        <DialogBox
          isOpen={isOpen.isCheckerOpen || isOpen.isDeviationOpen || isOpen.isDisbursementOpen || isColenderOpen}
          fullScreen
          title={isOpen.isCheckerOpen ? 'Loan Creation Checker' : (
            isOpen.isDeviationOpen ? 'Loan Creation Deviation' : isColenderOpen ? stageName[clickedRow.status] : 'Loan Creation Disbursement'
          )}
          width='100%'
          handleClose={() => handleClose()}
        >
          <ContainerStyled padding='0 !important'>
            {
              isOpen.isCheckerOpen || isOpen.isDeviationOpen ? (
                <CheckerComponent
                  clickedRow={clickedRow}
                  initalLoanDetailsHandler={initalLoanDetailsHandler}
                  setIsOpen={setIsOpen}
                  handleClose={handleClose}
                />
              ) : null
            }
            {
              isOpen.isDisbursementOpen ? (
                <DisbursementComponent
                  clickedRow={clickedRow}
                  initalLoanDetailsHandler={initalLoanDetailsHandler}
                  setIsOpen={setIsOpen}
                  handleClose={handleClose}
                />
              ) : null
            }
            {
              isColenderOpen ? (
                <ColenderComponent
                  clickedRow={clickedRow}
                  initalLoanDetailsHandler={initalLoanDetailsHandler}
                  setIsColenderOpen={setIsColenderOpen}
                  handleClose={handleClose}
                />
              ) : null
            }
          </ContainerStyled>
        </DialogBox>
        <CustomDialog
          open={isShowPDFDownloadModal}
          onClose={() => handlePDFModalClose}
          disableEscapeKeyDown
        >
          <DialogContent>
            { showError && <Alert severity='error' style={{ marginBottom: '10px' }}>{showError}</Alert>}
            <CustomDiv>
              <Grid container>
                <Grid item xs={utrDetails && utrDetails?.utr !== 'NA' ? 5 : 6} sm={utrDetails && utrDetails?.utr !== 'NA' ? 5 : 6} md={utrDetails && utrDetails?.utr !== 'NA' ? 5 : 6} lg={utrDetails && utrDetails?.utr !== 'NA' ? 5 : 6} xl={utrDetails && utrDetails?.utr !== 'NA' ? 5 : 6} display='flex' justifyContent={screen === 'xs' ? 'start' : 'end'}>
                  Loan Account Number:
                </Grid>
                <Grid item xs={utrDetails && utrDetails?.utr !== 'NA' ? 7 : 6} sm={utrDetails && utrDetails?.utr !== 'NA' ? 7 : 6} md={utrDetails && utrDetails?.utr !== 'NA' ? 7 : 6} lg={utrDetails && utrDetails?.utr !== 'NA' ? 7 : 6} xl={utrDetails && utrDetails?.utr !== 'NA' ? 7 : 6} padding='0px 5px'>
                  {clickedRow?.loan_account_no}
                </Grid>
              </Grid>
              {
                utrDetails ? (
                  <>
                    <Grid container>
                      <Grid item xs={utrDetails && utrDetails?.utr !== 'NA' ? 5 : 6} sm={utrDetails && utrDetails?.utr !== 'NA' ? 5 : 6} md={utrDetails && utrDetails?.utr !== 'NA' ? 5 : 6} lg={utrDetails && utrDetails?.utr !== 'NA' ? 5 : 6} xl={utrDetails && utrDetails?.utr !== 'NA' ? 5 : 6} display='flex' justifyContent={screen === 'xs' ? 'start' : 'end'}>
                        UTR Number:
                      </Grid>
                      <Grid item xs={utrDetails && utrDetails?.utr !== 'NA' ? 7 : 6} sm={utrDetails && utrDetails?.utr !== 'NA' ? 7 : 6} md={utrDetails && utrDetails?.utr !== 'NA' ? 7 : 6} lg={utrDetails && utrDetails?.utr !== 'NA' ? 7 : 6} xl={utrDetails && utrDetails?.utr !== 'NA' ? 7 : 6} padding='0px 5px'>
                        {utrDetails?.utr ?? 'NA'}
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={utrDetails && utrDetails?.utr !== 'NA' ? 5 : 6} sm={utrDetails && utrDetails?.utr !== 'NA' ? 5 : 6} md={utrDetails && utrDetails?.utr !== 'NA' ? 5 : 6} lg={utrDetails && utrDetails?.utr !== 'NA' ? 5 : 6} xl={utrDetails && utrDetails?.utr !== 'NA' ? 5 : 6} display='flex' justifyContent={screen === 'xs' ? 'start' : 'end'}>
                        Status:
                      </Grid>
                      <Grid item xs={utrDetails && utrDetails?.utr !== 'NA' ? 7 : 6} sm={utrDetails && utrDetails?.utr !== 'NA' ? 7 : 6} md={utrDetails && utrDetails?.utr !== 'NA' ? 7 : 6} lg={utrDetails && utrDetails?.utr !== 'NA' ? 7 : 6} xl={utrDetails && utrDetails?.utr !== 'NA' ? 7 : 6} padding='0px 5px'>
                        {utrDetails?.status ?? 'NA'}
                      </Grid>
                    </Grid>
                  </>
                ) : null
              }
            </CustomDiv>
            {clickedRow?.colender !== 'SHIVALIK' && (clickedRow?.net_disbursment_mode === 'ONLINE' || clickedRow?.net_disbursment_mode === 'CASH_AND_ONLINE')
              ? (
                <DownLoadButtonDiv>

                  <LoadingButtonPrimary
                    onClick={() => getUTRDetails()}
                    loading={utrLoading}
                  >
                    Check UTR Number
                  </LoadingButtonPrimary>
                </DownLoadButtonDiv>
              )
              : null}
            <DownLoadButtonDiv>
              <LoadingButtonPrimary
                onClick={() => downloadFile('branchCopy', clickedRow)}
                loading={isDownloading.loading && isDownloading.name === 'branchCopy'}
              >
                View Branch Copy
              </LoadingButtonPrimary>
              <LoadingButtonPrimary
                onClick={() => downloadFile('borrowerCopy', clickedRow)}
                loading={isDownloading.loading && isDownloading.name === 'borrowerCopy'}
              >
                Print Borrower Copy
              </LoadingButtonPrimary>
            </DownLoadButtonDiv>
          </DialogContent>
          <DialogActions>
            <LoadingButtonPrimary onClick={handlePDFModalClose}>Okay</LoadingButtonPrimary>
          </DialogActions>
        </CustomDialog>
      </CustomContainerStyled>
    </>
  );
};
export default LoanDisbursalSearch;
