/* eslint-disable max-len */
import {
  React, useEffect, useState, useRef, useMemo
} from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import styled from '@emotion/styled';
import { Grid } from '@mui/material';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import TextField from '@mui/material/TextField';
import {
  ToastMessage, MenuNavigation, DialogBox
} from '../../../../components';
import {
  CustomContainerStyled, HeadingMaster, TextFieldStyled,
  BreadcrumbsWrapperContainerStyled, BreadcrumbsContainerStyled,
  HeaderContainer, SelectMenuStyle, LoadingButtonPrimary, AutoCompleteStyled
} from '../../../../components/styledComponents';
import { NAVIGATION, VARIABLE } from '../../../../constants';
import {
  caseTableColumn, navigationDetails, getAuditStatus, auditTypeArray
} from '../../helper';
import { Service } from '../../../../service';
import AuditorPage from './auditorPage';
import GoldAuditTable from '../table';
import { getDecodedToken } from '../../../../utils';
import { throttleFunction } from '../../../../utils/throttling';
import { useScreenSize } from '../../../../customHooks';
import logo from '../../../../assets/CGCL_logo.png';

const Li = styled.li`
    color: #502a74;
    &:hover{
      background-color: #502a741a !important;
    }
  `;

const AuditCase = () => {
  const { branchCodes, selectedBranch } = useSelector((state) => state.user.userDetails);
  const [isOpen, setIsOpen] = useState(false);
  const [clickedRow, setClickedRow] = useState(null);
  const [branchOption, setBranchOption] = useState([]);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [loading, setLoading] = useState({ loader: false, name: null });
  const [branch, setBranch] = useState('');
  const [auditStatus, setAuditStatus] = useState('all');
  const [auditType, setAuditType] = useState('all');
  const [tableData, setTableData] = useState([]);
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [pageInfo, setPageInfo] = useState({ pageNumber: 1, pageSize: 15 });
  const [isSendEmailButtonDisabled, setIsSendEmailButtonDisabled] = useState(false);
  const [isDownloadPdfButtonDisabled, setIsDownloadPdfButtonDisabled] = useState(false);
  const [availableAuditType, setAvailableAuditType] = useState([...auditTypeArray]);
  const loaderRef = useRef();
  const screen = useScreenSize();

  const pad = (num) => (`0${num}`).slice(-2);

  const handleGeneratePdf = async () => {
    loaderRef.current = true;
    setLoading({ loader: true, name: 'Download' });
    // eslint-disable-next-line new-cap
    const doc = new jsPDF();
    const head = ['Customer ID', 'LAN', 'First Name', 'Last Name', 'Branch ID', 'Gold Pouch Number', 'Audit Status', 'Assigned To', 'Start Date', 'End Date'];
    const body = [];
    tableData.forEach((item) => {
      body.push([item.customerId, item.applicationNo, item.firstName, item.lastName, item.branchId, item.goldPouchNumber, item.auditStatus, item.assignedTo, item.startDate, item.endDate]);
    });

    const user = getDecodedToken();
    doc.autoTable({
      head: [head],
      body,
      startY: 50,
      margin: { top: 50 },
      headStyles: {
        fillColor: [80, 42, 116],
      },
      bodyStyle: {
        lineWidth: 0.1,
        lineColor: [255, 255, 255]
      },
      styles: {
        fontSize: 7,
        cellPadding: 2
      },
      didDrawPage: () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();

        const formattedDate = `${year}-${pad(month)}-${pad(day)}`;
        const formattedTime = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
        doc.setFontSize(8);
        doc.setTextColor(80, 42, 116);
        doc.setFont('helvetica', 'bold');
        doc.text(`Auditor Name: ${user.fullname}`, 20, 15);
        doc.text(`Employee Code: ${user.emp_code}`, 20, 20);
        doc.text(`Date: ${formattedDate}`, 20, 25);
        doc.text(`Time: ${formattedTime}`, 20, 30);
        doc.setDrawColor(80, 42, 116);
        doc.rect(15, 8, 80, 30, 'S');
        doc.addImage(logo, 'PNG', 145, 8, 50, 20);
      }
    });
    doc.setFontSize(10);
    for (let i = 1; i <= doc.getNumberOfPages(); i += 1) {
      doc.setFontSize(6);
      doc.setPage(i);
      doc.setTextColor(80, 42, 116);
      doc.text(`Page ${i} of ${doc.getNumberOfPages()}`, 20, doc.internal.pageSize.height - 10);
    }
    doc.save(`${Date.now()}.pdf`);
    setLoading({ loader: false, name: null });
    loaderRef.current = false;
  };

  const searchDetailsHandler = async (pageNumber, pageSize, params) => {
    try {
      setLoading({ loader: true, name: 'auditorListing' });
      let url = `${process.env.REACT_APP_AUDIT_SERVICE}/list?page=${pageNumber}&page_size=${pageSize}`;
      if (params?.branch_code && params.branch_code !== 'all') {
        url = `${url}&branch_code=${params.branch_code}`;
      }
      if (params?.audit_status && params.audit_status !== 'all') {
        url = `${url}&audit_status=${params.audit_status}`;
      }
      if (params?.audit_type && params.audit_type !== 'all') {
        url = `${url}&assigned_audit_type=${params.audit_type}`;
      }
      if (params?.startDate && params?.endDate) {
        url += `&start_date=${params.startDate}&end_date=${params.endDate}`;
      }
      const { data } = await Service.post(url);
      if (data?.results && data.results.length) {
        const tableDataArray = [];
        data.results.forEach((item) => {
          tableDataArray.push({
            // eslint-disable-next-line no-underscore-dangle
            _id: item?._id,
            auditor_findings: item.auditor_findings ?? {},
            are_details_incorrect: item.are_details_incorrect ?? false,
            customerId: item?.customer_id,
            applicationNo: item?.application_no,
            disb_date: item.disbursement_date ? moment(item.disbursement_date).format('DD-MM-YYYY') : 'N/A',
            firstName: item?.first_name,
            lastName: item?.last_name,
            branchId: item?.branch_code,
            goldPouchNumber: item?.additional_gold_information?.gold_pouch_number,
            auditStatus: getAuditStatus(item?.audit_status),
            assignedTo: item?.auditor_name || 'NA',
            startDate: moment(item?.start_date).format('DD-MM-YYYY'),
            endDate: moment(item?.end_date).format('DD-MM-YYYY'),
            consolidated_collateral_pic: item?.consolidated_collateral_details?.items_pic,
            itemArray: item?.items,
            source: item?.source,
            tareWeight: item?.additional_gold_information?.tare_weight_gold_pouch,
            // eslint-disable-next-line no-nested-ternary
            auditType: item?.assigned_audit_type === 'TARE' ? 'TARE Weight Audit' : item?.assigned_audit_type === 'GOLD_VERIFICATION' ? 'Gold Verification' : 'Full Audit',
            colender: item?.colender,
            last_audit_tare_weight: item?.last_audit_tare_weight,
            last_audit_gold_pouch_number: item?.last_audit_gold_pouch_number
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
      setLoading({ loader: false, name: null });
    }
  };

  const getSearchCount = async (params) => {
    try {
      let url = '';
      if (params?.branch_code && params.branch_code !== 'all') {
        url = `branch_code=${params.branch_code}`;
      }
      if (params?.audit_status && params.audit_status !== 'all') {
        url += `&audit_status=${params.audit_status}`;
      }
      if (params?.audit_type && params.audit_type !== 'all') {
        url = `${url}&assigned_audit_type=${params.audit_type}`;
      }
      if (params?.startDate && params?.endDate) {
        url += `&start_date=${params.startDate}&end_date=${params.endDate}`;
      }
      const { data } = await Service.post(`${process.env.REACT_APP_AUDIT_SERVICE}/audit/count?${url}`);
      if (data.success) {
        setTotalRowCount(data?.data);
      } else {
        setTotalRowCount(0);
      }
    } catch (err) {
      console.log('error', err);
    }
  };

  const getAuditType = async () => {
    try {
      const { data } = await Service.get(`${process.env.REACT_APP_AUDIT_SERVICE}/audit/config?key=audit_type`);
      console.log(data?.data?.config);
      const activeAuditTypes = data?.data?.config
        .filter((item) => Object.values(item)[0].is_active) // Filter where is_active is true
        .map((item) => Object.keys(item)[0]); // Get the keys of the active audits (e.g., 'TARE', 'FULL')

      const filteredArray = availableAuditType.filter((item) => activeAuditTypes.includes(item.value));
      setAvailableAuditType([{ label: 'All', value: activeAuditTypes.join(',') }, ...filteredArray]);
      setAuditType(activeAuditTypes.join(','));
      return activeAuditTypes;
    } catch (err) {
      console.log('error', err);
    }
  };

  const initiatHandler = async () => {
    if (branchCodes.length) {
      setBranchOption(branchCodes);
    }
    const branchToSelect = selectedBranch === VARIABLE.BRANCHALL ? branchCodes[0] : selectedBranch;
    const returnedAuditType = await getAuditType();
    getSearchCount(
      {
        branch_code: branchToSelect, startDate: moment().subtract(6, 'days').format('DD/MM/YYYY'), endDate: moment().format('DD/MM/YYYY'), audit_type: returnedAuditType
      }
    );
    searchDetailsHandler(1, 15, {
      branch_code: branchToSelect,
      startDate: moment().subtract(6, 'days').format('DD/MM/YYYY'),
      endDate: moment().format('DD/MM/YYYY'),
      audit_type: returnedAuditType

    });
    setStartDate(moment().subtract(6, 'days').format('MM/DD/YYYY'));
    setEndDate(moment().format('MM/DD/YYYY'));
    setBranch(branchToSelect);
  };

  useEffect(() => {
    initiatHandler();
  }, []);

  const onPageSizeChange = (pageSize) => {
    setPageInfo({ pageNumber: pageInfo.pageNumber, pageSize });
    searchDetailsHandler(pageInfo.pageNumber, pageSize, {
      branch_code: branch,
      audit_type: auditType,
      audit_status: auditStatus,
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

  const onAuditStatusChange = (event) => {
    const { value } = event.target;
    setAuditStatus(value);
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
    getSearchCount({
      branch_code: value,
      audit_type: auditType,
      audit_status: auditStatus,
      startDate: startDate && moment(startDate).format('DD/MM/YYYY'),
      endDate: endDate && moment(endDate).format('DD/MM/YYYY')
    });
    searchDetailsHandler(pageInfo.pageNumber, pageInfo.pageSize, {
      branch_code: value,
      audit_type: auditType,
      audit_status: auditStatus,
      startDate: startDate && moment(startDate).format('DD/MM/YYYY'),
      endDate: endDate && moment(endDate).format('DD/MM/YYYY')
    });
  };

  const handleClose = (event, reason) => {
    if (reason && ['escapeKeyDown', 'backdropClick'].includes(reason)) {
      return;
    }
    setIsOpen(false);
  };

  const viewDetailsHandler = async (field, row) => {
    if (row?.auditStatus === 'Audit Pending') {
      setClickedRow(row);
      setIsOpen(true);
    }
  };

  const rowClassNameHandler = ({ row }) => {
    if (row?.auditStatus !== 'Audit Pending') {
      return 'disabledRow';
    }
    return 'enabledRow';
  };

  const onDailogclose = (msg) => {
    setIsOpen(false);
    if (msg) {
      setAlertShow({ open: true, msg, alertType: 'success' });
    }
    searchDetailsHandler(pageInfo.pageNumber, pageInfo.pageSize, {
      branch_code: branch,
      audit_type: auditType,
      audit_status: auditStatus,
      startDate: startDate && moment(startDate).format('DD/MM/YYYY'),
      endDate: endDate && moment(endDate).format('DD/MM/YYYY')
    });
  };

  const handleEmail = async () => {
    try {
      loaderRef.current = true;
      setLoading({ loader: true, name: 'sendEmail' });
      const userData = getDecodedToken();
      const { data } = await Service.put(`${process.env.REACT_APP_AUDIT_SERVICE}/email/audit`, {
        employee_code: userData.emp_code
      });
      setAlertShow({ open: true, msg: data?.msg, alertType: data?.success ? 'success' : 'error' });
    } catch (err) {
      console.log('error', err);
      if (err?.response?.data?.errors?.detail) {
        setAlertShow({ open: true, msg: err?.response?.data?.errors?.detail, alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong, Please try again.', alertType: 'error' });
      }
    } finally {
      loaderRef.current = false;
      setLoading({ loader: false, name: null });
    }
  };

  const handleEndDateChange = (newEndDate) => {
    if (startDate) {
      setEndDate(newEndDate);
      getSearchCount({
        branch_code: branch,
        audit_type: auditType,
        audit_status: auditStatus,
        startDate: moment(startDate).format('DD/MM/YYYY'),
        endDate: moment(newEndDate).format('DD/MM/YYYY')
      });
      searchDetailsHandler(
        pageInfo.pageNumber,
        pageInfo.pageSize,
        {
          branch_code: branch,
          audit_type: auditType,
          audit_status: auditStatus,
          startDate: moment(startDate).format('DD/MM/YYYY'),
          endDate: moment(newEndDate).format('DD/MM/YYYY')
        }
      );
    } else {
      setAlertShow({ open: true, msg: 'Please select start date.', alertType: 'error' });
    }
  };
  const auditCaseNavigations = useMemo(() => [...navigationDetails, { name: 'Audit Case', url: NAVIGATION.auditCase }], [NAVIGATION]);
  const disableEndDates = (currentDate) => moment(currentDate).isAfter(moment(startDate).add(29, 'days'), 'day') || moment(currentDate).isBefore(moment(startDate), 'day');
  const renderButtons = () => (
    <>
      <LoadingButtonPrimary
        loading={loading.loader && loading.name === 'sendEmail'}
        onClick={() => {
          throttleFunction(
            {
              args1: [],
              function1: handleEmail
            },
            loaderRef,
            setIsSendEmailButtonDisabled
          );
        }}
        disabled={isSendEmailButtonDisabled}
      >
        Audit Mail
      </LoadingButtonPrimary>
      <LoadingButtonPrimary
        loading={loading.loader && loading.name === 'Download'}
        onClick={() => {
          throttleFunction(
            {
              args1: [],
              function1: handleGeneratePdf
            },
            loaderRef,
            setIsDownloadPdfButtonDisabled
          );
        }}
        disabled={isDownloadPdfButtonDisabled || tableData.length === 0}
      >
        Download
      </LoadingButtonPrimary>
    </>
  );

  return (
    <>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={auditCaseNavigations} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      <CustomContainerStyled padding='0 !important'>
        <ToastMessage
          alertShow={alertShow}
          setAlertShow={setAlertShow}
        />
        <HeaderContainer item xs={12}>
          <Grid container display='flex' justifyContent={['xs', 'sm', 'md'].includes(screen) ? 'start' : 'start'}>
            <HeadingMaster>
              Audit Case
            </HeadingMaster>
          </Grid>
          {['xl', 'lg', 'md', 'sm'].includes(screen)
          && (
          <Grid container display='flex' justifyContent='end'>
            {renderButtons()}
          </Grid>
          )}
        </HeaderContainer>
        {
          ['xs'].includes(screen) && (
          <Grid container padding='0 10px 10px' display='flex' justifyContent='space-between'>
            {renderButtons()}
          </Grid>
          )
        }
        <Grid container padding='0px 20px' display='flex' justifyContent='space-between'>
          <Grid item xs={12} sm={12} md={8} lg={4} xl={4} display='flex'>
            <AutoCompleteStyled
              disablePortal
              disableClearable
              id='combo-box-demo'
              options={branchOption}
              value={branch}
              sx={{ padding: ['xs', 'sm'].includes(screen) ? '0px 10px 5px 0px' : '0px 10px 0px 0px' }}
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
            <TextFieldStyled
              label='Audit Status'
              select
              defaultValue={auditStatus}
              onChange={onAuditStatusChange}
            >
              <SelectMenuStyle value='all'>All</SelectMenuStyle>
              <SelectMenuStyle value='AUDPEN'>Audit Pending</SelectMenuStyle>
              <SelectMenuStyle value='AUDCOM'>Audit Completed</SelectMenuStyle>
            </TextFieldStyled>
          </Grid>
          <Grid item xs={12} sm={12} md={8} lg={4} xl={4} paddingTop={['xs', 'sm', 'md'].includes(screen) ? '10px' : '0px'} display='flex'>
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
        <Grid container padding='10px 20px' display='flex'>
          <Grid item xs={6} sm={6} md={4} lg={2} xl={2}>
            <TextFieldStyled
              label='Audit Type'
              select
              value={auditType}
              onChange={onAuditTypeChange}
            >
              {
                  availableAuditType.map((item) => (
                    <SelectMenuStyle value={item.value}>{item.label}</SelectMenuStyle>
                  ))
                }
            </TextFieldStyled>
          </Grid>
        </Grid>
        <Grid item xs={12} padding='10px 20px'>
          <GoldAuditTable
            rows={tableData}
            columns={caseTableColumn}
            checkboxAllowed={false}
            handleCellClick={viewDetailsHandler}
            clientPaginationMode={false}
            loading={loading.loader && loading.name === 'auditorListing'}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            rowCount={totalRowCount}
            pageSizeNumber={pageInfo.pageSize}
            rowClassNameHandler={rowClassNameHandler}
          />
        </Grid>
        <DialogBox
          isOpen={isOpen}
          fullScreen
          title='Auditor Page'
          width='100%'
          handleClose={handleClose}
        >
          <CustomContainerStyled padding='0 !important'>
            <AuditorPage
              rowData={clickedRow}
              onDailogclose={onDailogclose}
            />
          </CustomContainerStyled>
        </DialogBox>
      </CustomContainerStyled>
    </>
  );
};
export default AuditCase;
