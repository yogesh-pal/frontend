/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
/* eslint-disable max-len */
import {
  useEffect, useState, useRef, useMemo
} from 'react';
import { Grid } from '@mui/material';
import { useForm } from 'react-hook-form';
import styled from '@emotion/styled';
import { useSelector } from 'react-redux';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import moment from 'moment';
import TextField from '@mui/material/TextField';
import {
  ToastMessage, MenuNavigation, MultiToggleButton, ErrorText,
  DialogBox
} from '../../../../components';
import {
  ButtonPrimary, CustomContainerStyled, HeadingMaster, LoadingButtonPrimary,
  BreadcrumbsWrapperContainerStyled, BreadcrumbsContainerStyled, ResetButton, ErrorMessageContainer,
  HeaderContainer, SelectMenuStyle, TextFieldStyled, ContainerStyled, AutoCompleteStyled
} from '../../../../components/styledComponents';
import { NAVIGATION } from '../../../../constants';
import {
  assignmentTableColumn, navigationDetails, validation, togglerGroup, auditStatusArray,
  getAuditStatus, auditTypeArray, auditTypeEnum,
} from '../../helper';
import { Service } from '../../../../service';
import { useScreenSize } from '../../../../customHooks';
import AssignmentPage from './assignmentPage';
import GoldAuditTable from '../table';
import { throttleFunction } from '../../../../utils/throttling';

const CustomForm = styled('form')(({ width }) => ({
  width: width || '500px',
  display: 'flex'
}));

const Li = styled.li`
    color: #502a74;
    &:hover{
      background-color: #502a741a !important;
    }
  `;

const AuditAssignment = () => {
  const { branchCodes } = useSelector((state) => state.user.userDetails);
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [branchOption, setBranchOption] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowIDs, setSelectedRowIDs] = useState([]);
  const [searchTitle, setSearchTitle] = useState('Customer ID');
  const [paramsValue, setParamsValue] = useState('customer_id');
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [loading, setLoading] = useState({ loader: false, name: null });
  const [auditStatus, setAuditStatus] = useState('');
  const [auditType, setAuditType] = useState('');
  const [availableAuditType, setAvailableAuditType] = useState([...auditTypeArray]);
  const [availableAuditTypeEnum, setAvailableAuditTypeEnum] = useState({ ...auditTypeEnum });
  const [branch, setBranch] = useState('');
  const [tableData, setTableData] = useState([]);
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [isSearchDisabled, setIsSearchDisabled] = useState(false);
  const [pageInfo, setPageInfo] = useState({ pageNumber: 1, pageSize: 15 });
  const loaderRef = useRef();
  const selectionDetailsRef = useRef({
    status: null
  });

  const {
    register, handleSubmit, formState: { errors }, reset, getValues, setValue
  } = useForm();

  const screen = useScreenSize();

  const searchDetailsHandler = async (pageNumber, pageSize, params) => {
    try {
      loaderRef.current = true;
      setLoading({ loader: true, name: 'auditAssignmentListing' });
      let url = `${process.env.REACT_APP_AUDIT_SERVICE}/list?page=${pageNumber}&page_size=${pageSize}`;
      if (getValues(paramsValue)) {
        url = `${url}&${paramsValue}=${getValues(paramsValue)}`;
      }
      if (params?.branch_code) {
        url = `${url}&branch_code=${params.branch_code}`;
      }
      if (params?.audit_status && params.audit_status !== 'all') {
        url = `${url}&audit_status=${params.audit_status}`;
      }
      if (params?.audit_type && params.audit_type !== 'all') {
        url = `${url}&audit_type=${params.audit_type}`;
      }
      if (params?.startDate && params?.endDate) {
        url += `&start_date=${params.startDate}&end_date=${params.endDate}`;
      }
      const { data } = await Service.get(url);
      if (data?.results && data.results.length) {
        const tableDataArray = [];
        data.results.forEach((item) => {
          tableDataArray.push({
            _id: item?._id,
            disb_date: item.disbursement_date ? moment(item.disbursement_date).format('DD-MM-YYYY') : 'N/A',
            customerId: item?.customer_id,
            applicationNo: item?.application_no,
            firstName: item?.first_name,
            lastName: item?.last_name,
            branchId: item?.branch_code,
            status: item?.audit_status,
            goldPouchNumber: item?.additional_gold_information?.gold_pouch_number,
            auditStatus: getAuditStatus(item?.audit_status),
            auditor_type: item?.audit_status === 'AUDCOM' ? item?.auditor_type : 'NA',
            last_audit_type: availableAuditTypeEnum[item.audit_type] ? availableAuditTypeEnum[item.audit_type] : 'NA'
          });
        });
        setTableData(tableDataArray);
      } else {
        setTotalRowCount(0);
        setTableData([]);
      }
    } catch (err) {
      console.log('error', err);
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

  const getSearchCount = async (params) => {
    try {
      let url = '';
      if (params?.branch_code) {
        url = `branch_code=${params.branch_code}`;
      }
      if (getValues(paramsValue)) {
        if (paramsValue === 'lan') {
          url += `&lan=${getValues(paramsValue)}`;
        } else {
          url += `&customer_id=${getValues(paramsValue)}`;
        }
      }
      if (params?.audit_status && params.audit_status !== 'all') {
        url += `&audit_status=${params.audit_status}`;
      }
      if (params?.audit_type && params.audit_type !== 'all') {
        url = `${url}&audit_type=${params.audit_type}`;
      }
      if (params?.startDate && params?.endDate) {
        url += `&start_date=${params.startDate}&end_date=${params.endDate}`;
      }
      const { data } = await Service.get(`${process.env.REACT_APP_AUDIT_SERVICE}/audit/count?${url}`);
      if (data.success) {
        setTotalRowCount(data?.data);
      } else {
        setTotalRowCount(0);
      }
    } catch (err) {
      console.log('error', err);
    }
  };

  const onPageSizeChange = (pageSize) => {
    setPageInfo({ pageNumber: pageInfo.pageNumber, pageSize });
    searchDetailsHandler(pageInfo.pageNumber, pageSize, {
      branch_code: branch,
      audit_status: auditStatus,
      audit_type: auditType,
      startDate: startDate && moment(startDate).format('DD/MM/YYYY'),
      endDate: endDate && moment(endDate).format('DD/MM/YYYY')
    });
  };

  const onPageChange = (pageNumber) => {
    setPageInfo({ pageNumber, pageSize: pageInfo.pageSize });
    searchDetailsHandler(pageNumber, pageInfo.pageSize, {
      branch_code: branch,
      audit_type: auditType,
      audit_status: auditStatus,
      startDate: startDate && moment(startDate).format('DD/MM/YYYY'),
      endDate: endDate && moment(endDate).format('DD/MM/YYYY')
    });
  };

  const onSearchSubmit = () => {
    if (!branch) {
      setAlertShow({ open: true, msg: 'Please select branch id.', alertType: 'error' });
      return;
    }
    throttleFunction(
      {
        args1: [{
          branch_code: branch,
          audit_status: auditStatus,
          audit_type: auditType,
          startDate: startDate && moment(startDate).format('DD/MM/YYYY'),
          endDate: endDate && moment(endDate).format('DD/MM/YYYY')
        }],
        function1: getSearchCount,
        args2: [pageInfo.pageNumber, pageInfo.pageSize, {
          branch_code: branch,
          audit_type: auditType,
          audit_status: auditStatus,
          startDate: startDate && moment(startDate).format('DD/MM/YYYY'),
          endDate: endDate && moment(endDate).format('DD/MM/YYYY')
        }],
        function2: searchDetailsHandler
      },
      loaderRef,
      setIsSearchDisabled
    );
  };

  const searchResetHandler = () => {
    if (getValues(paramsValue)) {
      reset({ [paramsValue]: null });
      if (branch) {
        getSearchCount({
          branch_code: branch,
          audit_type: auditType,
          audit_status: auditStatus,
          startDate: startDate && moment(startDate).format('DD/MM/YYYY'),
          endDate: endDate && moment(endDate).format('DD/MM/YYYY')
        });
        searchDetailsHandler(pageInfo.pageNumber, pageInfo.pageSize, {
          branch_code: branch,
          audit_type: auditType,
          audit_status: auditStatus,
          startDate: startDate && moment(startDate).format('DD/MM/YYYY'),
          endDate: endDate && moment(endDate).format('DD/MM/YYYY')
        });
      }
    }
  };

  const onAuditStatusChange = (event) => {
    const { value } = event.target;
    setAuditStatus(value);
    if (!branch) {
      setAlertShow({ open: true, msg: 'Please select branch id.', alertType: 'error' });
      return;
    }
    getSearchCount({
      branch_code: branch,
      audit_status: value,
      audit_type: auditType,
      startDate: startDate && moment(startDate).format('DD/MM/YYYY'),
      endDate: endDate && moment(endDate).format('DD/MM/YYYY')
    });
    searchDetailsHandler(pageInfo.pageNumber, pageInfo.pageSize, {
      branch_code: branch,
      audit_status: value,
      audit_type: auditType,
      startDate: startDate && moment(startDate).format('DD/MM/YYYY'),
      endDate: endDate && moment(endDate).format('DD/MM/YYYY')
    });
  };

  const onAuditTypeChange = (event) => {
    const { value } = event.target;
    setAuditType(value);
    if (!branch) {
      setAlertShow({ open: true, msg: 'Please select branch id.', alertType: 'error' });
      return;
    }
    getSearchCount({
      branch_code: branch,
      audit_status: auditStatus,
      audit_type: value,
      startDate: startDate && moment(startDate).format('DD/MM/YYYY'),
      endDate: endDate && moment(endDate).format('DD/MM/YYYY')
    });
    searchDetailsHandler(pageInfo.pageNumber, pageInfo.pageSize, {
      branch_code: branch,
      audit_status: auditStatus,
      audit_type: value,
      startDate: startDate && moment(startDate).format('DD/MM/YYYY'),
      endDate: endDate && moment(endDate).format('DD/MM/YYYY')
    });
  };

  const branchChangeHandler = (event, value) => {
    setBranch(value);
    setStartDate(moment().subtract(6, 'days').format('MM/DD/YYYY'));
    setEndDate(moment().format('MM/DD/YYYY'));
    setAuditStatus('all');
    setAuditType('all');
    getSearchCount({
      branch_code: value,
      audit_status: 'all',
      audit_type: 'all',
      startDate: moment().subtract(6, 'days').format('DD/MM/YYYY'),
      endDate: moment().format('DD/MM/YYYY')
    });
    searchDetailsHandler(pageInfo.pageNumber, pageInfo.pageSize, {
      branch_code: value,
      audit_status: 'all',
      audit_type: 'all',
      startDate: moment().subtract(6, 'days').format('DD/MM/YYYY'),
      endDate: moment().format('DD/MM/YYYY')
    });
  };

  const seletedValueHandler = (value) => {
    setParamsValue(value);
    const searchTemp = togglerGroup.values.find((item) => item.value === value);
    setSearchTitle(searchTemp?.name);
    reset({ [value]: null });
  };

  const getAuditType = async () => {
    try {
      const { data } = await Service.get(`${process.env.REACT_APP_AUDIT_SERVICE}/audit/config?key=audit_type`);
      const activeAuditTypes = data?.data?.config
        .filter((item) => Object.values(item)[0].is_active) // Filter where is_active is true
        .map((item) => Object.keys(item)[0]); // Get the keys of the active audits (e.g., 'TARE', 'FULL')

      const availableAuditTypeEnums = Object.keys(auditTypeEnum)
        .filter((key) => activeAuditTypes.includes(key)) // Filter active audit types
        .reduce((acc, key) => {
          acc[key] = auditTypeEnum[key]; // Construct the new object with active keys
          return acc;
        }, {});
      setAvailableAuditTypeEnum({ NA: 'NA', ...availableAuditTypeEnums });

      const filteredArray = availableAuditType.filter((item) => activeAuditTypes.includes(item.value));
      setAvailableAuditType([{ label: 'All', value: 'all' }, ...filteredArray]);
      setAuditType(activeAuditTypes.join(','));
      return activeAuditTypes;
    } catch (err) {
      console.log('error', err);
    }
  };

  const initiatHandler = async () => {
    await getAuditType();
  };

  useEffect(() => {
    if (branchCodes.length) {
      const branches = [...branchCodes];
      setBranchOption(branches.sort());
    }
    initiatHandler();
  }, []);

  const handleClose = (event, reason) => {
    if ((reason && ['escapeKeyDown', 'backdropClick'].includes(reason)) || (loading.loader && loading.name === 'onAssign')) {
      return;
    }
    setIsOpen(false);
  };

  const closeOnSuccess = (data) => {
    setSelectedRowIDs([]);
    setIsOpen(false);
    setAlertShow({ open: true, msg: data?.msg, alertType: 'success' });
    searchDetailsHandler(1, 15, {
      branch_code: branch,
      audit_status: auditStatus,
      audit_type: auditType,
      startDate: startDate && moment(startDate).format('DD/MM/YYYY'),
      endDate: endDate && moment(endDate).format('DD/MM/YYYY')
    });
  };

  const onRowSelection = (rows) => {
    const applicationNo = [];
    const row = [];
    // const statusDetails = {
    //   [AUDITSTATUS.AUDNOTOK1]: 0,
    //   otherStatus: 0
    // };

    for (let i = 0; i < rows.length; i += 1) {
      const index = tableData.findIndex((ele) => ele._id === rows[i]);
      if (index !== -1) {
        // const { status } = tableData[index];
        // if ([AUDITSTATUS.AUDLOWPURITY, AUDITSTATUS.AUDNOTOK2].includes(status)) {
        //   return;
        // }
        // status === AUDITSTATUS.AUDNOTOK1 ? statusDetails[AUDITSTATUS.AUDNOTOK1] += 1 : statusDetails.otherStatus += 1;
        // if (statusDetails[AUDITSTATUS.AUDNOTOK1] > 0 && statusDetails.otherStatus > 0) {
        //   status === AUDITSTATUS.AUDNOTOK1 ? statusDetails[AUDITSTATUS.AUDNOTOK1] -= 1 : statusDetails.otherStatus -= 1;
        //   setAlertShow({ open: true, msg: 'Invalid selection.', alertType: 'error' });
        //   break;
        // } else {
        applicationNo.push(tableData[index].applicationNo);
        row.push(rows[i]);
        // }
      }
    }
    // selectionDetailsRef.status = statusDetails;
    setSelectedRowIDs(row);
    setSelectedRows(applicationNo);
  };

  const handleEndDateChange = (newEndDate) => {
    if (!branch) {
      setAlertShow({ open: true, msg: 'Please select branch id.', alertType: 'error' });
      return;
    }
    if (startDate) {
      setEndDate(newEndDate);
      getSearchCount({
        branch_code: branch,
        audit_status: auditStatus,
        audit_type: auditType,
        startDate: moment(startDate).format('DD/MM/YYYY'),
        endDate: moment(newEndDate).format('DD/MM/YYYY')
      });
      searchDetailsHandler(
        pageInfo.pageNumber,
        pageInfo.pageSize,
        {
          branch_code: branch,
          audit_status: auditStatus,
          audit_type: auditType,
          startDate: moment(startDate).format('DD/MM/YYYY'),
          endDate: moment(newEndDate).format('DD/MM/YYYY')
        }
      );
    } else {
      setAlertShow({ open: true, msg: 'Please select start date.', alertType: 'error' });
    }
  };

  // const rowClassNameHandler = ({ row }) => {
  //   // if ([AUDITSTATUS.AUDLOWPURITY, AUDITSTATUS.AUDNOTOK2].includes(row?.status)) {
  //   //   return 'disabledRow';
  //   // }
  //   return 'enabledRow';
  // };

  // const isRowSelectableHandler = (params) => {
  //   try {
  //     return ![AUDITSTATUS.AUDLOWPURITY, AUDITSTATUS.AUDNOTOK2].includes(params.row.status);
  //   } catch (e) {
  //     console.log('Error', e);
  //   }
  // };

  const menuNavigations = useMemo(() => [...navigationDetails, { name: 'Audit Assignment', url: NAVIGATION.auditAssignment }], [NAVIGATION]);

  const disableEndDates = (currentDate) => moment(currentDate).isAfter(moment(startDate).add(29, 'days'), 'day') || moment(currentDate).isBefore(moment(startDate), 'day');

  return (
    <>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={menuNavigations} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      <CustomContainerStyled padding='0 !important'>
        <ToastMessage
          alertShow={alertShow}
          setAlertShow={setAlertShow}
        />
        <HeaderContainer item xs={12}>
          <HeadingMaster>
            Audit Assignment
          </HeadingMaster>
        </HeaderContainer>
        <Grid container padding='0 20px' display='flex' justifyContent='space-between'>
          <Grid item xs={12} sm={5} md={3} lg={2} xl={2} padding={['xs', 'sm'].includes(screen) ? '5px 0px' : '5px 10px 0px 0px'}>
            <AutoCompleteStyled
              disablePortal
              disableClearable
              id='combo-box-demo'
              options={branchOption}
              defaultValue={branch}
              onChange={(event, value) => branchChangeHandler(event, value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='Branch ID'
                />
              )}
              renderOption={(props, option) => (
                <Li
                  {...props}
                >
                  {option}
                </Li>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={8} md={6} lg={4} xl={4} padding='5px 0px 5px' display='flex'>
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
        <Grid
          container
          padding={['xs', 'sm'].includes(screen) ? '0px 20px' : '10px 20px'}
          display='flex'
          flexDirection={['xs', 'sm'].includes(screen) ? 'column-reverse' : 'row'}
          justifyItems={['xs', 'sm'].includes(screen) ? 'flex-end' : ''}
          justifyContent='space-between'
        >
          <Grid item xs={12} sm={8} md={5} lg={4} xl={3} padding={['xs', 'sm'].includes(screen) ? '5px 0px' : '5px 10px 0px 0px'}>
            <CustomForm
              onSubmit={handleSubmit(onSearchSubmit)}
              width='100%'
            >
              <TextFieldStyled
                id='outlined-basic'
                label={`${searchTitle} *`}
                variant='outlined'
                defaultValue=''
                {...register(paramsValue, {
                  required: true,
                  pattern: (validation[paramsValue]?.validation?.pattern)
                    ? new RegExp(validation[paramsValue]?.validation?.pattern) : undefined,
                  maxLength: (validation[paramsValue]?.validation?.maxLength)
                    ? validation[paramsValue]?.validation?.maxLength : undefined,
                  minLength: (validation[paramsValue]?.validation?.minLength)
                    ? validation[paramsValue]?.validation?.minLength : undefined,
                })}
                onChange={(e) => {
                  setValue(paramsValue, e.target.value.trim(), { shouldValidate: true });
                }}
              />
              <LoadingButtonPrimary
                variant='contained'
                loading={loading?.loader && loading?.name === 'SEARCH'}
                disabled={isSearchDisabled}
                type='submit'
              >
                Search
              </LoadingButtonPrimary>
              <ResetButton onClick={() => searchResetHandler()}>
                Reset
              </ResetButton>
            </CustomForm>
          </Grid>
          <Grid item xs={12} sm={8} md={6} lg={4} xl={4} display='flex' padding={['xs', 'sm'].includes(screen) ? '5px 0px' : '0px'}>
            <TextFieldStyled
              label='Last Audit Type'
              select
              value={auditType}
              onChange={onAuditTypeChange}
            >
              {
                  availableAuditType?.map((item) => (
                    <SelectMenuStyle value={item.value}>{item.label}</SelectMenuStyle>
                  ))
                }
            </TextFieldStyled>
            <div style={{ width: '100%', paddingLeft: '10px' }}>
              <TextFieldStyled
                label='Audit Status'
                select
                value={auditStatus}
                onChange={onAuditStatusChange}
              >
                {
                  auditStatusArray?.map((item) => (
                    <SelectMenuStyle value={item.value}>{item.label}</SelectMenuStyle>
                  ))
                }
              </TextFieldStyled>
            </div>
          </Grid>
        </Grid>
        <ErrorMessageContainer>
          <ErrorText input={validation[paramsValue]} errors={errors} />
        </ErrorMessageContainer>
        <HeaderContainer padding='0px 20px 20px 20px'>
          <MultiToggleButton
            orientation={screen === 'xs' ? 'vertical' : 'horizontal'}
            details={togglerGroup}
            seletedValueHandler={seletedValueHandler}
          />
        </HeaderContainer>
        {branch
          ? (
            <>
              <Grid item xs={12} padding='0px 20px'>
                <GoldAuditTable
                  rows={tableData}
                  columns={assignmentTableColumn}
                  checkboxAllowed
                  selectionOnClick
                  clientPaginationMode={false}
                  loading={loading.loader && loading.name === 'auditAssignmentListing'}
                  onPageChange={onPageChange}
                  onPageSizeChange={onPageSizeChange}
                  rowCount={totalRowCount}
                  pageSizeNumber={pageInfo.pageSize}
                  onSelectionModelChange={onRowSelection}
                  selectedRowIDs={selectedRowIDs}
                  // rowClassNameHandler={rowClassNameHandler}
                  // isRowSelectable={isRowSelectableHandler}
                />
              </Grid>
              <Grid item xs={12} display='flex' justifyContent='center'>
                <ButtonPrimary disabled={!selectedRows.length} onClick={() => setIsOpen(true)}>
                  Assign Case
                </ButtonPrimary>
              </Grid>
            </>
          ) : null}
        <DialogBox
          isOpen={isOpen}
          fullScreen
          title='Assign Case'
          width='100%'
          handleClose={handleClose}
        >
          <ContainerStyled padding='0 !important'>
            <AssignmentPage
              selectedRows={selectedRows}
              tableData={tableData}
              closeOnSuccess={closeOnSuccess}
              loading={loading}
              setLoading={setLoading}
              setIsOpen={setIsOpen}
              availableAuditType={availableAuditType}
              selectionDetailsRef={selectionDetailsRef}
            />
          </ContainerStyled>
        </DialogBox>
      </CustomContainerStyled>
    </>
  );
};
export default AuditAssignment;
