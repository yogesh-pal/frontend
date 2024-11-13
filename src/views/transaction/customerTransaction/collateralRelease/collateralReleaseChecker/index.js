/* eslint-disable max-len */
import moment from 'moment';
import { Grid } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useEffect, useState, useRef } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import GoldAuditTable from '../table';
import { Service } from '../../../../../service';
import { REGEX } from '../../../../../constants';
import ThirdPartyRelease from './thirdPartyRelease';
import { useScreenSize } from '../../../../../customHooks';
import { throttleFunction } from '../../../../../utils/throttling';
import CollateralReleaseCheckerApproveReject from './approveReject';
import { getUserPermissions } from '../../../../../utils/getUserPermissions';
import {
  MenuNavigation, DialogBox, ToastMessage, ErrorText
} from '../../../../../components';
import {
  pendingReleaseTableColumn, statusArray, collateralReleaseCheckerNavigation, getStatus, CustomFormContainer,
  validation, TwoResponsiveButtonWrapper
} from '../../../helper';
import {
  HeadingMaster, HeaderContainer, CustomContainerStyled, ResetButton, TextFieldStyled, BreadcrumbsContainerStyled,
  LoadingButtonPrimary, SelectMenuStyle, ContainerStyled, BreadcrumbsWrapperContainerStyled, ErrorMessageContainer
} from '../../../../../components/styledComponents';

const CollateralReleaseChecker = () => {
  const [status, setStatus] = useState('All');
  const [tableData, setTableData] = useState([]);
  const [clickedRow, setClickedRow] = useState(null);
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [isSearchDisabled, setIsSearchDisabled] = useState(false);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [loading, setLoading] = useState({ loader: false, name: null });
  const [endDate, setEndDate] = useState(moment().format('MM/DD/YYYY'));
  const [pageInfo, setPageInfo] = useState({ pageNumber: 1, pageSize: 15 });
  const [isApproveRejectPopUpOpen, setApproveRejectPopUpIsOpen] = useState(false);
  const [isReleaseToThirdPartyPopUpOpen, setReleaseToThirdPartyPopUpIsOpen] = useState(false);
  const [startDate, setStartDate] = useState(moment().subtract(7, 'days').format('MM/DD/YYYY'));
  const loaderRef = useRef();
  const paramsValue = 'lan';

  const {
    register, handleSubmit, getValues, setValue, reset, formState: { errors }
  } = useForm();

  const screen = useScreenSize();

  const searchDetailsCount = async (params) => {
    try {
      loaderRef.current = true;
      setLoading({ loader: true, name: 'collateralReleaseListing' });
      let url = `${process.env.REACT_APP_COLLATERAL_SERVICE}/third-party/listcount`;
      if (getValues(paramsValue)) {
        url = `${url}?${paramsValue}=${getValues(paramsValue)}`;
      }
      if (params?.status && params.status !== 'All') {
        url = `${url}${getValues(paramsValue) ? '&' : '?'}status=${params.status}`;
      }
      if (params?.startDate && params?.endDate && moment(params.startDate, 'dd/mm/yyyy').isValid() && moment(params.endDate, 'dd/mm/yyyy').isValid()) {
        url += `${url.includes('?') ? '&' : '?'}start_date=${params.startDate}&end_date=${params.endDate}`;
      }
      const { data } = await Service.get(url);
      if (data?.success && data?.data?.count) {
        setTotalRowCount(data.data.count);
      } else {
        setTotalRowCount(0);
      }
    } catch (err) {
      if (err?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else if (err?.response?.data?.errors && err.response.data.errors.length) {
        setAlertShow({ open: true, msg: err.response.data.errors[0], alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong, Please try again.', alertType: 'error' });
      }
    } finally {
      loaderRef.current = false;
      setLoading({ loader: false, name: null });
    }
  };

  const searchDetailsHandler = async (pageNumber, pageSize, params) => {
    try {
      loaderRef.current = true;
      setLoading({ loader: true, name: 'collateralReleaseListing' });
      let url = `${process.env.REACT_APP_COLLATERAL_SERVICE}/third-party/list?page=${pageNumber}&page_size=${pageSize}`;
      if (getValues(paramsValue)) {
        url = `${url}&${paramsValue}=${getValues(paramsValue)}`;
      }
      if (params?.status && params.status !== 'All') {
        url = `${url}&status=${params.status}`;
      }
      if (params?.startDate && params?.endDate && moment(params.startDate, 'dd/mm/yyyy').isValid() && moment(params.endDate, 'dd/mm/yyyy').isValid()) {
        url = `${url}&start_date=${params.startDate}&end_date=${params.endDate}`;
      }
      const { data } = await Service.get(url);
      if (data?.results && data.results.length) {
        const tableDataArray = [];
        data.results.forEach((item, idx) => {
          tableDataArray.push({
            id: idx,
            custmer_id: item?.customer_id,
            customer_name: item?.customer_name,
            lan: item?.application_no,
            loanAccountNo: item?.loan_account_no,
            total_dues: item?.total_dues,
            third_party_name: item?.third_party_name ?? 'NA',
            branch_name: item?.customer_branch,
            status: getStatus(item?.status),
            satisfaction_letter: item?.satisfaction_letter_link ?? 'NA',
            third_party_relationship: item?.third_party_relationship,
            third_party_other_relation: item?.third_party_other_relation,
            third_party_dob: item?.third_party_dob,
            third_party_mobile: item?.third_party_mobile,
            third_party_id_type: item?.third_party_id_type,
            third_party_id_number: item?.third_party_id_number,
            third_party_osv_done: item?.third_party_osv_done,
            maker_remarks: item?.third_party_remarks,
            checker_remarks: item?.checker_remarks,
            third_party_doc_live_pic: item?.third_party_doc_live_pic,
            third_party_live_pic: item?.third_party_live_pic,
          });
        });
        setTableData(tableDataArray);
      } else {
        setTableData([]);
      }
    } catch (err) {
      if (err?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else if (err?.response?.data?.errors && err.response.data.errors.length) {
        setAlertShow({ open: true, msg: err.response.data.errors[0], alertType: 'error' });
      } else if (!tableData.length) {
        setAlertShow({ open: true, msg: 'Something went wrong, Please try again.', alertType: 'error' });
      }
    } finally {
      loaderRef.current = false;
      setLoading({ loader: false, name: null });
    }
  };

  const onSearchSubmit = () => {
    throttleFunction(
      {
        args1: [{
          status,
          startDate: moment(startDate).format('DD/MM/YYYY'),
          endDate: moment(endDate).format('DD/MM/YYYY')
        }],
        function1: searchDetailsCount,
        args2: [
          pageInfo.pageNumber,
          pageInfo.pageSize,
          {
            status,
            startDate: moment(startDate).format('DD/MM/YYYY'),
            endDate: moment(endDate).format('DD/MM/YYYY')
          }
        ],
        function2: searchDetailsHandler,
      },
      loaderRef,
      setIsSearchDisabled
    );
  };

  const searchInString = (str, arr) => arr.includes(str);
  const rowClassNameHandler = ({ row }) => {
    const userPermissionsList = getUserPermissions();
    const isCollateralCheckerPermission = searchInString('collateral_checker', userPermissionsList);
    const isCollateralMaker = searchInString('collateral_maker', userPermissionsList) && isCollateralCheckerPermission;
    const isCollateralChecker = !isCollateralMaker && isCollateralCheckerPermission;
    // put a check for National Operations Manager As well
    if (isCollateralMaker && (row?.status === 'Approved')) {
      return 'enabledRow';
    }
    if (isCollateralChecker && !isCollateralMaker && (row?.status === 'Pending')) {
      return 'enabledRow';
    }
    return 'disabledRow';
  };

  const searchResetHandler = () => {
    if (getValues('lan')) {
      reset({ lan: null });
      searchDetailsCount({
        status,
        startDate: moment(startDate).format('DD/MM/YYYY'),
        endDate: moment(endDate).format('DD/MM/YYYY')
      });
      searchDetailsHandler(pageInfo.pageNumber, pageInfo.pageSize, {
        status,
        startDate: moment(startDate).format('DD/MM/YYYY'),
        endDate: moment(endDate).format('DD/MM/YYYY')
      });
    }
  };
  const seletedValueHandler = (event) => {
    const { value } = event.target;
    setStatus(value);
    if (getValues('lan')) {
      reset({ lan: null });
    }
    searchDetailsCount({
      status: value,
      startDate: moment(startDate).format('DD/MM/YYYY'),
      endDate: moment(endDate).format('DD/MM/YYYY')
    });
    searchDetailsHandler(1, 15, {
      status: value,
      startDate: moment(startDate).format('DD/MM/YYYY'),
      endDate: moment(endDate).format('DD/MM/YYYY')
    });
  };
  const handleClose = () => {
    setApproveRejectPopUpIsOpen(false);
    setReleaseToThirdPartyPopUpIsOpen(false);
  };
  const viewDetailsHandler = (field, row) => {
    const userPermissionsList = getUserPermissions();
    const isCollateralCheckerPermission = searchInString('collateral_checker', userPermissionsList);
    const isCollateralMaker = searchInString('collateral_maker', userPermissionsList) && isCollateralCheckerPermission;
    const isCollateralChecker = !isCollateralMaker && isCollateralCheckerPermission;
    if (field !== 'satisfaction_letter') {
      if (isCollateralChecker === true && (row?.status === 'Pending')) {
        setClickedRow(row);
        setApproveRejectPopUpIsOpen(true);
      }
      if (isCollateralMaker === true && !isCollateralChecker && (row?.status === 'Approved')) {
        setClickedRow(row);
        setReleaseToThirdPartyPopUpIsOpen(true);
      }
    }
  };
  const onPageSizeChange = (pageSize) => {
    setPageInfo({ pageNumber: pageInfo.pageNumber, pageSize });
    searchDetailsHandler(pageInfo.pageNumber, pageSize, {
      status,
      startDate: moment(startDate).format('DD/MM/YYYY'),
      endDate: moment(endDate).format('DD/MM/YYYY')
    });
  };

  const onPageChange = (pageNumber) => {
    setPageInfo({ pageNumber, pageSize: pageInfo.pageSize });
    searchDetailsHandler(pageNumber, pageInfo.pageSize, {
      status,
      startDate: moment(startDate).format('DD/MM/YYYY'),
      endDate: moment(endDate).format('DD/MM/YYYY')
    });
  };
  useEffect(() => {
    searchDetailsCount({ status: 'All' });
    searchDetailsHandler(pageInfo.pageNumber, pageInfo.pageSize, { status: 'All' });
  }, []);

  const handleEndDateChange = (newEndDate) => {
    if (startDate) {
      setEndDate(newEndDate);
      searchDetailsCount({
        status,
        startDate: moment(startDate).format('DD/MM/YYYY'),
        endDate: moment(newEndDate).format('DD/MM/YYYY')
      });
      searchDetailsHandler(pageInfo.pageNumber, pageInfo.pageSize, {
        status,
        startDate: moment(startDate).format('DD/MM/YYYY'),
        endDate: moment(newEndDate).format('DD/MM/YYYY')
      });
    } else {
      setAlertShow({ open: true, msg: 'Please select start date.', alertType: 'error' });
    }
  };

  const closeOnSuccess = (data) => {
    setReleaseToThirdPartyPopUpIsOpen(false);
    setApproveRejectPopUpIsOpen(false);
    if (data?.msg) {
      setAlertShow({ open: true, msg: data?.msg, alertType: 'success' });
    }
    searchDetailsCount({ status: 'All' });
    searchDetailsHandler(1, 15, { status: 'All' });
  };

  const disableEndDates = (currentDate) => moment(currentDate).isAfter(moment(startDate).add(7, 'days'), 'day') || moment(currentDate).isBefore(moment(startDate), 'day');

  return (
    <>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={collateralReleaseCheckerNavigation} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      <CustomContainerStyled padding='0 !important'>
        <ToastMessage
          alertShow={alertShow}
          setAlertShow={setAlertShow}
        />
        <HeaderContainer>
          <HeadingMaster>
            Collateral Release
          </HeadingMaster>
        </HeaderContainer>
        <Grid container padding='0 20px' display='flex' justifyContent='space-between'>
          <Grid item xs={12} sm={6} md={4} lg={2} xl={2}>
            <TextFieldStyled
              label='Status'
              select
              style={{ paddingBottom: '10px' }}
              value={status}
              onChange={seletedValueHandler}
            >
              {
                  statusArray?.map((item) => (
                    <SelectMenuStyle value={item.value}>{item.label}</SelectMenuStyle>
                  ))
                }
            </TextFieldStyled>
          </Grid>
          <Grid item xs={12} sm={12} md={6} lg={4} xl={4} display='flex'>
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
        </Grid>
        <HeaderContainer
          item
          xs={12}
          padding='10px 20px'
          flexDirection={['xs', 'sm'].includes(screen) ? 'column-reverse' : 'row'}
          justifyItems={['xs', 'sm'].includes(screen) ? 'flex-end' : ''}
        >
          <CustomFormContainer
        // eslint-disable-next-line no-restricted-globals
            onSubmit={handleSubmit(onSearchSubmit)}
            flexDirection={['xs', 'sm'].includes(screen) ? 'column' : 'row'}
            justifyItems={['xs', 'sm'].includes(screen) ? 'flex-end' : ''}
            width={['xs', 'sm'].includes(screen) ? '100%' : ''}
          >
            <TextFieldStyled
              label='LAN*'
              {...register('lan', {
                onChange: (e) => {
                  setValue('lan', e.target.value.trim(), { shouldValidate: true });
                },
                required: true,
                pattern: { value: REGEX.NUMBER, message: 'Please enter valid LAN' },
                maxLength: { value: 20, message: 'LAN should not be more than 20 digits' }
              })}
            />
            <TwoResponsiveButtonWrapper justifyContent={['xs', 'sm'].includes(screen) ? 'center' : 'flex-start'} marginTop={['xs', 'sm'].includes(screen) ? '20px' : '0px'}>
              <LoadingButtonPrimary
                variant='contained'
                loading={loading?.loader && loading?.name === 'SEARCH'}
                type='submit'
                disabled={isSearchDisabled}
              >
                Search
              </LoadingButtonPrimary>
              <ResetButton onClick={() => searchResetHandler()}>
                Reset
              </ResetButton>
            </TwoResponsiveButtonWrapper>
          </CustomFormContainer>
        </HeaderContainer>
        <ErrorMessageContainer>
          <ErrorText input={validation?.lan} errors={errors} />
        </ErrorMessageContainer>
        <Grid container padding='0 20px' display='flex' justifyContent='space-between' />
        <Grid item xs={12} padding={['xs', 'sm'].includes(screen) ? '10px 20px 20px 20px' : '10px 20px'}>
          <GoldAuditTable
            rows={tableData}
            columns={pendingReleaseTableColumn}
            clientPaginationMode={false}
            loading={loading.loader && loading.name === 'collateralReleaseListing'}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            rowCount={totalRowCount}
            pageSizeNumber={pageInfo.pageSize}
            rowClassNameHandler={rowClassNameHandler}
            handleCellClick={viewDetailsHandler}
          />
        </Grid>
        <DialogBox
          isOpen={isApproveRejectPopUpOpen}
          fullScreen
          title='Collateral Release'
          width='100%'
          handleClose={handleClose}
        >
          <ContainerStyled padding='0 !important'>
            <CollateralReleaseCheckerApproveReject
              rowData={clickedRow}
              setAlertShow={setAlertShow}
              closeOnSuccess={closeOnSuccess}
            />
          </ContainerStyled>
        </DialogBox>
        <DialogBox
          isOpen={isReleaseToThirdPartyPopUpOpen}
          fullScreen
          title='Collateral Release'
          width='100%'
          handleClose={handleClose}
        >
          <ContainerStyled padding='0 !important'>
            <ThirdPartyRelease
              rowData={clickedRow}
              closeOnSuccess={closeOnSuccess}
            />
          </ContainerStyled>
        </DialogBox>
      </CustomContainerStyled>
    </>
  );
};
export default CollateralReleaseChecker;
