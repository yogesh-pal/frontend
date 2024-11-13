import moment from 'moment';
import { useEffect, useState } from 'react';
import { Grid, FormControl, OutlinedInput } from '@mui/material';
import TransactionTable from '../../table';
import { useScreenSize } from '../../../../customHooks';
import { Service } from '../../../../service';
import { ToastMessage } from '../../../../components';
import {
  SelectLabelStyled, SelectStyled, SelectMenuStyle
} from '../../../../components/styledComponents';
import {
  detailedBankTransactionsTableColumn, HeadingMaster2, CustomGrid, bankTransactionEventType
} from '../../helper';

const amountFormat = Intl.NumberFormat('en-IN');

const DetailedBankTransactions = (props) => {
  const [tableData, setTableData] = useState([]);
  const [eventType, setEventType] = useState('all');
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [loading, setLoading] = useState({ loader: false, name: null });
  const [pageInfo, setPageInfo] = useState({ pageNumber: 1, pageSize: 15 });
  const screen = useScreenSize();
  const { summaryData } = props;

  const searchDetailsHandler = async (pageNumber, pageSize, params) => {
    try {
      setLoading({ loader: true, name: 'onFetchDetails' });

      const reqBody = {
        fetch_listing_data: true
      };
      if (pageNumber) {
        reqBody.page = pageNumber;
      }
      if (pageSize) {
        reqBody.page_size = pageSize;
      }
      if (params?.eventType && params?.eventType !== 'all') {
        reqBody.event_type = params?.eventType;
      }
      if (params?.startDate) {
        reqBody.from_date = params?.startDate;
      }
      if (params?.endDate) {
        reqBody.to_date = params?.endDate;
      }

      const { data, status } = await Service.post(`${process.env.REACT_APP_CASH_SERVICE}/banktransactions/details`, reqBody);
      if (status === 200) {
        const tableDataArray = [];
        data?.data?.transactions.forEach((item, ind) => {
          tableDataArray.push({
            id: ind,
            date: moment(item?.date).format('Do MMMM YYYY, h:mm A'),
            eventType: bankTransactionEventType[item?.event_type],
            narration: item?.narration,
            lan: item?.lan ? item?.lan : '_',
            debit: item?.debit ? amountFormat.format(item?.debit) : '_',
            credit: item?.credit ? amountFormat.format(item?.credit) : '_',
          });
        });
        setTableData(tableDataArray);
        setTotalRowCount(data?.data?.total_count);
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
    searchDetailsHandler(1, 15, {
      endDate: moment().format('DD-MM-YYYY'),
      startDate: moment().subtract(7, 'days').format('DD-MM-YYYY'),
    });
  }, []);

  const eventTypeChangeHandler = (value) => {
    setEventType(value);
    searchDetailsHandler(1, 15, {
      eventType: value,
      endDate: moment().format('DD-MM-YYYY'),
      startDate: moment().subtract(7, 'days').format('DD-MM-YYYY'),
    });
  };

  const onPageSizeChange = (pageSize) => {
    setPageInfo({ pageNumber: pageInfo.pageNumber, pageSize });
    searchDetailsHandler(pageInfo.pageNumber, pageSize, {
      eventType,
      endDate: moment().format('DD-MM-YYYY'),
      startDate: moment().subtract(7, 'days').format('DD-MM-YYYY'),
    });
  };

  const onPageChange = (pageNumber) => {
    setPageInfo({ pageNumber, pageSize: pageInfo.pageSize });
    searchDetailsHandler(pageNumber, pageInfo.pageSize, {
      eventType,
      endDate: moment().format('DD-MM-YYYY'),
      startDate: moment().subtract(7, 'days').format('DD-MM-YYYY'),
    });
  };

  const eventTypeRender = () => (
    <FormControl sx={{ width: '100%' }}>
      <SelectLabelStyled>Event Type*</SelectLabelStyled>
      <SelectStyled
        input={<OutlinedInput label='Event Type*' />}
        defaultValue='all'
        onChange={(e) => eventTypeChangeHandler(e.target.value)}
      >
        <SelectMenuStyle value='all'>All</SelectMenuStyle>
        <SelectMenuStyle value='DISBURSEMENT'>Disbursement</SelectMenuStyle>
        <SelectMenuStyle value='COLLECTION'>Collection</SelectMenuStyle>
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
            </Grid>
            <Grid container padding='10px 0px'>
              <Grid item xs={6}>
                {eventTypeRender()}
              </Grid>
            </Grid>
          </>
        )
          : (
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
              <Grid itemxs={12} sm={4} md={3} lg={2} xl={2} padding='10px 0px 0px' display='flex' justifyContent='end'>
                {eventTypeRender()}
              </Grid>
            </Grid>
          )
}
      <TransactionTable
        rows={tableData}
        columns={detailedBankTransactionsTableColumn}
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
export default DetailedBankTransactions;
