import moment from 'moment';
import { useEffect, useState } from 'react';
import { Grid, FormControl, OutlinedInput } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import TransactionTable from '../../table';
import { ROLE } from '../../../../constants';
import { useScreenSize } from '../../../../customHooks';
import { Service } from '../../../../service';
import { ToastMessage } from '../../../../components';
import { getDecodedToken } from '../../../../utils/getUserPermissions';
import {
  TextFieldStyled, SelectLabelStyled, SelectStyled, SelectMenuStyle
} from '../../../../components/styledComponents';
import {
  detailedPacketTransactionsTableColumn, HeadingMaster2, CustomGrid, packetTransactionEventType
} from '../../helper';
import { numberFormat } from '../../../../utils';

const DetailedPacketTransactions = (props) => {
  const [tableData, setTableData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [eventType, setEventType] = useState('all');
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [isRoleAOMorAbove, setIsRoleAOMorAbove] = useState(false);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [loading, setLoading] = useState({ loader: false, name: null });
  const [pageInfo, setPageInfo] = useState({ pageNumber: 1, pageSize: 15 });
  const screen = useScreenSize();
  const { summaryData } = props;

  const searchDetailsHandler = async (pageNumber, pageSize, params) => {
    try {
      setLoading({ loader: true, name: 'onFetchDetails' });
      let apiURL = `${process.env.REACT_APP_CASH_SERVICE}/packet/list?page=${pageNumber}&page_size=${pageSize}`;
      if (params?.eventType && params.eventType !== 'all') {
        apiURL += `&activity=${params.eventType === 'DISB' ? 'IN' : 'OT'}&category=${params.eventType}`;
      }
      if (params?.startDate && params?.endDate) {
        apiURL += `&start_date=${params.startDate}&end_date=${params.endDate}`;
      }
      const { data, status } = await Service.get(apiURL);
      if (status === 200) {
        const tableDataArray = [];
        data.data.forEach((item, ind) => {
          let narration = '';
          if (item?.application_no) {
            narration = item.application_no;
          }
          if (item?.maker_branch) {
            narration += narration.length ? ` - ${item.maker_branch}` : item.maker_branch;
          }
          tableDataArray.push({
            id: ind,
            date: moment(item?.submit_date).format('Do MMMM YYYY, h:mm A'),
            eventType: packetTransactionEventType[item?.category],
            narration,
            packetsAdded: item?.activity === 'IN' ? item?.count : '_',
            packetsRemoved: item?.activity === 'OT' ? item?.count : '_',
            netBalance: numberFormat(item?.net_balance)
          });
        });
        setTableData(tableDataArray);
      }
    } catch (err) {
      console.log('err', err);
      if (err.response?.data?.message) {
        setAlertShow({ open: true, msg: err.response.data.message, alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong, Please try again.', alertType: 'error' });
      }
    } finally {
      setLoading({ loader: false, name: null });
    }
  };

  const getRowCount = async (params) => {
    try {
      setLoading({ loader: true, name: 'onFetchDetails' });
      let apiURL = `${process.env.REACT_APP_CASH_SERVICE}/packet/list?is_count=1`;
      if (params?.eventType && params.eventType !== 'all') {
        apiURL += `&activity=${params.eventType === 'DISB' ? 'IN' : 'OT'}&category=${params.eventType}`;
      }
      if (params?.startDate && params?.endDate) {
        apiURL += `&start_date=${params.startDate}&end_date=${params.endDate}`;
      }
      const { data, status } = await Service.get(apiURL);
      if (status === 200) {
        setTotalRowCount(data.data.count);
      }
    } catch (err) {
      console.log('err', err);
      if (err.response?.data?.message) {
        setAlertShow({ open: true, msg: err.response.data.message, alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong, Please try again.', alertType: 'error' });
      }
    } finally {
      setLoading({ loader: false, name: null });
    }
  };

  useEffect(() => {
    searchDetailsHandler(1, 15, {});
    getRowCount({ is_count: 1 });
    const userInfo = getDecodedToken();
    if (userInfo.super_admin || userInfo.pan_india || (userInfo.hasOwnProperty('subroles') && userInfo.subroles.includes(ROLE.BM)
    && userInfo.subroles.includes(ROLE.GV))) {
      setIsRoleAOMorAbove(true);
    }
  }, []);

  const eventTypeChangeHandler = (value) => {
    setEventType(value);
    searchDetailsHandler(1, 15, {
      eventType: value,
      startDate: startDate && moment(startDate).format('YYYY-MM-DD'),
      endDate: endDate && moment(endDate).format('YYYY-MM-DD')
    });
    getRowCount({
      is_count: 1,
      eventType: value,
      startDate: startDate && moment(startDate).format('YYYY-MM-DD'),
      endDate: endDate && moment(endDate).format('YYYY-MM-DD')
    });
  };

  const onPageSizeChange = (pageSize) => {
    setPageInfo({ pageNumber: pageInfo.pageNumber, pageSize });
    searchDetailsHandler(pageInfo.pageNumber, pageSize, {
      eventType,
      startDate: startDate && moment(startDate).format('YYYY-MM-DD'),
      endDate: endDate && moment(endDate).format('YYYY-MM-DD')
    });
  };

  const onPageChange = (pageNumber) => {
    setPageInfo({ pageNumber, pageSize: pageInfo.pageSize });
    searchDetailsHandler(pageNumber, pageInfo.pageSize, {
      eventType,
      startDate: startDate && moment(startDate).format('YYYY-MM-DD'),
      endDate: endDate && moment(endDate).format('YYYY-MM-DD')
    });
  };

  const handleEndDateChange = (newEndDate) => {
    setEndDate(newEndDate);
    if (startDate) {
      searchDetailsHandler(pageInfo.pageNumber, pageInfo.pageSize, {
        eventType,
        startDate: startDate && moment(startDate).format('YYYY-MM-DD'),
        endDate: newEndDate && moment(newEndDate).format('YYYY-MM-DD')
      });
      getRowCount({
        is_count: 1,
        eventType,
        startDate: startDate && moment(startDate).format('YYYY-MM-DD'),
        endDate: newEndDate && moment(newEndDate).format('YYYY-MM-DD')
      });
    }
  };

  const disableStartDates = (currentDate) => {
    if (isRoleAOMorAbove) {
      return moment(currentDate).isBefore(moment().subtract(30, 'days'), 'day');
    }
    return moment(currentDate).isBefore(moment().subtract(7, 'days'), 'day');
  };

  const disableEndDates = (currentDate) => {
    if (isRoleAOMorAbove) {
      return moment(currentDate).isBefore(moment().subtract(30, 'days'), 'day') || moment(currentDate).isBefore(moment(startDate), 'day');
    }
    return moment(currentDate).isBefore(moment().subtract(7, 'days'), 'day') || moment(currentDate).isBefore(moment(startDate), 'day');
  };

  const startDateFieldRender = () => (
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
        shouldDisableDate={disableStartDates}
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
  );

  const endDateFieldRender = () => (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        label='End Date'
        value={endDate}
        disableHighlightToday
        inputFormat='dd/MM/yyyy'
        onChange={(newValue) => handleEndDateChange(newValue)}
        disableFuture
        shouldDisableDate={disableEndDates}
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
  );

  const eventTypeRender = () => (
    <FormControl sx={{ width: '100%' }}>
      <SelectLabelStyled>Event Type*</SelectLabelStyled>
      <SelectStyled
        input={<OutlinedInput label='Event Type*' />}
        defaultValue='all'
        onChange={(e) => eventTypeChangeHandler(e.target.value)}
      >
        <SelectMenuStyle value='all'>ALL</SelectMenuStyle>
        <SelectMenuStyle value='DISB'>Disbursement</SelectMenuStyle>
        <SelectMenuStyle value='CLOS'>Closure</SelectMenuStyle>
      </SelectStyled>
    </FormControl>
  );

  return (
    <>
      <ToastMessage
        alertShow={alertShow}
        setAlertShow={setAlertShow}
      />
      {
        screen === 'xs' ? (
          <>
            <Grid container padding='10px 0px' display='flex' justifyContent='space-between'>
              <Grid item xs={12} display='flex' alignItems='center'>
                <Grid item xs={6}>
                  <HeadingMaster2 padding='0 !important'>Branch Code</HeadingMaster2>
                </Grid>
                <CustomGrid item xs={6}>
                  :
                  &nbsp;
                  <span>{summaryData.branch_code}</span>
                </CustomGrid>
              </Grid>
              <Grid item xs={12} display='flex' alignItems='center'>
                <Grid item xs={6}>
                  <HeadingMaster2 padding='0 !important'>Current Packet Balance</HeadingMaster2>
                </Grid>
                <CustomGrid item xs={6}>
                  :
                  &nbsp;
                  <span>{numberFormat(summaryData?.closing_packets)}</span>
                </CustomGrid>
              </Grid>
            </Grid>
            <Grid container padding='10px 0px'>
              <Grid item xs={6}>
                {eventTypeRender()}
              </Grid>
            </Grid>
            <Grid container padding='10px 0px'>
              <Grid item xs={12} display='flex'>
                {startDateFieldRender()}
                <div style={{ width: '100%', paddingLeft: '10px' }}>
                  {endDateFieldRender()}
                </div>
              </Grid>
            </Grid>
          </>
        )
          : (
            <>
              <Grid container padding='10px 0px' display='flex' justifyContent='space-between'>
                <Grid item xs={12} sm={4} md={6} lg={6} xl={6} display='flex' alignItems='center'>
                  <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                    <HeadingMaster2 padding='0 !important'>Branch Code</HeadingMaster2>
                  </Grid>
                  <CustomGrid item xs={12} sm={12} md={6} lg={8} xl={8}>
                    :
                    &nbsp;
                    <span>{summaryData.branch_code}</span>
                  </CustomGrid>
                </Grid>
                <Grid item xs={12} sm={8} md={6} lg={4} xl={4} padding='10px 0px 0px' display='flex'>
                  {startDateFieldRender()}
                  <div style={{ width: '100%', paddingLeft: '10px' }}>
                    {endDateFieldRender()}
                  </div>
                </Grid>
              </Grid>
              <Grid container padding='10px 0px' display='flex' justifyContent='space-between'>
                <Grid item xs={12} sm={4} md={6} lg={6} xl={6} display='flex' alignItems='center'>
                  <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                    <HeadingMaster2 padding='0 !important'>Current Packet Balance</HeadingMaster2>
                  </Grid>
                  <CustomGrid item xs={12} sm={12} md={6} lg={8} xl={8}>
                    :
                    &nbsp;
                    <span>{numberFormat(summaryData?.closing_packets)}</span>
                  </CustomGrid>
                </Grid>
                <Grid item xs={12} sm={4} md={3} lg={2} xl={2} padding='0 0 0 10px' display='flex' justifyContent='end'>
                  {eventTypeRender()}
                </Grid>
              </Grid>
            </>
          )
}
      <TransactionTable
        rows={tableData}
        columns={detailedPacketTransactionsTableColumn}
        selectionOnClick={false}
        clientPaginationMode={false}
        loading={loading.loader && loading.name === 'onFetchDetails'}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        rowCount={totalRowCount}
        pageSizeNumber={pageInfo.pageSize}
      />
    </>
  );
};
export default DetailedPacketTransactions;
