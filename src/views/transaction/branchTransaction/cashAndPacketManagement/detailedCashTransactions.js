/* eslint-disable max-len */
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Grid, FormControl, OutlinedInput } from '@mui/material';
import TransactionTable from '../../table';
import { useScreenSize } from '../../../../customHooks';
import { Service } from '../../../../service';
import { ToastMessage } from '../../../../components';
import { getDecodedToken } from '../../../../utils/getUserPermissions';
import {
  SelectLabelStyled, SelectStyled, SelectMenuStyle
} from '../../../../components/styledComponents';
import {
  detailedTransactionsTableColumn, HeadingMaster2, CustomGrid, transactionCategoryType
} from '../../helper';

const amountFormat = Intl.NumberFormat('en-IN');

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: '300px',
      width: 250,
    }
  }
};

const DetailedCashTransactions = (props) => {
  const [allData, setAllData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [loading, setLoading] = useState({ loader: false, name: null });
  const [branch, setBranch] = useState();
  const screen = useScreenSize();
  const { summaryData } = props;

  const searchDetailsHandler = async () => {
    try {
      setLoading({ loader: true, name: 'onFetchDetails' });
      const { data, status } = await Service.get(`${process.env.REACT_APP_CASH_SERVICE}/cashandpacketsummary/cashtrxn`);
      if (status === 200) {
        const tableDataArray = [];
        data.data.forEach((item, ind) => {
          let narration = '';
          if (item?.application_no) {
            narration = item.application_no;
          }
          if (item?.ref_no) {
            narration += narration.length ? ` - ${item.ref_no}` : item.ref_no;
          }
          if (item?.maker_branch) {
            narration += narration.length ? ` - ${item.maker_branch}` : item.maker_branch;
          }
          if (item?.category === 'CUST') {
            narration += narration.length ? ' - ' : '';
            narration += `${item.activity === 'OUT' ? 'Disb' : 'Coll'}`;
          }
          tableDataArray.push({
            id: ind,
            date: moment(item?.submit_date).format('Do MMMM YYYY, h:mm A'),
            eventType: transactionCategoryType[item?.category],
            narration,
            debit: item?.activity === 'OUT' ? amountFormat.format(item?.amount) : '_',
            credit: item?.activity === 'IN' ? amountFormat.format(item?.amount) : '_',
            netBalance: amountFormat.format(item?.net_balance),
            activity: item?.activity,
            category: item?.category
          });
        });
        setTotalRowCount(tableDataArray.length);
        setTableData(tableDataArray);
        setAllData(tableDataArray);
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
    const userInfo = getDecodedToken();
    setBranch(userInfo.rm1_branch_code);
  }, []);

  const eventTypeChangeHandler = (value) => {
    if (value === 'all_all') {
      setTotalRowCount(allData.length);
      setTableData(allData);
    } else {
      const valuesArray = value.split('_');
      const filteredData = allData.filter((ele) => ele.activity === valuesArray[0] && ele.category === valuesArray[1]);
      setTotalRowCount(filteredData.length);
      setTableData(filteredData);
    }
  };

  const eventTypeRender = () => (
    <FormControl sx={{ width: '100%' }}>
      <SelectLabelStyled>Event Type*</SelectLabelStyled>
      <SelectStyled
        input={<OutlinedInput label='Event Type*' />}
        defaultValue='all_all'
        onChange={(e) => eventTypeChangeHandler(e.target.value)}
        MenuProps={MenuProps}
      >
        <SelectMenuStyle value='all_all'>ALL</SelectMenuStyle>
        <SelectMenuStyle value='OUT_FINO'>Cash Out to FINO</SelectMenuStyle>
        <SelectMenuStyle value='OUT_PNEY'>Cash Out to PayNearby</SelectMenuStyle>
        <SelectMenuStyle value='OUT_RECL'>Cash Out to Reli-collect</SelectMenuStyle>
        <SelectMenuStyle value='OUT_YESB'>Cash Out to Yes Bank</SelectMenuStyle>
        <SelectMenuStyle value='OUT_HDFC'>Cash Out to HDFC Bank</SelectMenuStyle>
        <SelectMenuStyle value='OUT_CUST'>Cash Out to Customer</SelectMenuStyle>
        <SelectMenuStyle value='OUT_OTBA'>Cash Out to Other Bank</SelectMenuStyle>
        <SelectMenuStyle value='OUT_OTHR'>Cash Out Others</SelectMenuStyle>
        <SelectMenuStyle value='OUT_IBCT'>Cash Out IBCT</SelectMenuStyle>
        <SelectMenuStyle value='IN_FINO'>Cash In from FINO</SelectMenuStyle>
        <SelectMenuStyle value='IN_PNEY'>Cash In from PayNearby</SelectMenuStyle>
        <SelectMenuStyle value='IN_RECL'>Cash In from Reli-collect</SelectMenuStyle>
        <SelectMenuStyle value='IN_VEEF'>Cash In from Veefin</SelectMenuStyle>
        <SelectMenuStyle value='IN_CUST'>Cash In from Customer</SelectMenuStyle>
        <SelectMenuStyle value='IN_OTBA'>Cash In from Other Bank</SelectMenuStyle>
        <SelectMenuStyle value='IN_OTHR'>Cash In Others</SelectMenuStyle>
        <SelectMenuStyle value='IN_IBCT'>Cash In IBCT</SelectMenuStyle>
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
                  <span>{branch}</span>
                </CustomGrid>
              </Grid>
              <Grid item xs={12} display='flex' alignItems='center'>
                <Grid item xs={6}>
                  <HeadingMaster2 padding='0 !important'>
                    Current Balance
                    {' '}
                    (₹)
                  </HeadingMaster2>
                </Grid>
                <CustomGrid item xs={6}>
                  :
                  &nbsp;
                  <span>{amountFormat.format(summaryData.closing_balance)}</span>
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
            <>
              <Grid container padding='10px 0px' display='flex' justifyContent='space-between'>
                <Grid item xs={12} sm={6} md={6} lg={6} xl={6} display='flex' alignItems='center'>
                  <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                    <HeadingMaster2 padding='0 !important'>Branch Code</HeadingMaster2>
                  </Grid>
                  <CustomGrid item xs={12} sm={12} md={6} lg={8} xl={8}>
                    :
                    &nbsp;
                    <span>{summaryData.branch_code}</span>
                  </CustomGrid>
                </Grid>
                <Grid item xs={12} sm={4} md={3} lg={2} xl={2} padding='0 0 0 10px' display='flex' justifyContent='end'>
                  {eventTypeRender()}
                </Grid>
              </Grid>
              <Grid container padding='10px 0px' display='flex' justifyContent='space-between'>
                <Grid item xs={12} sm={6} md={6} lg={6} xl={6} display='flex' alignItems='center'>
                  <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                    <HeadingMaster2 padding='0 !important'>
                      Current Balance
                      {' '}
                      (₹)
                    </HeadingMaster2>
                  </Grid>
                  <CustomGrid item xs={12} sm={12} md={6} lg={8} xl={8}>
                    :
                    &nbsp;
                    <span>{amountFormat.format(summaryData.closing_balance)}</span>
                  </CustomGrid>
                </Grid>
              </Grid>
            </>
          )
}
      <TransactionTable
        rows={tableData}
        columns={detailedTransactionsTableColumn}
        selectionOnClick={false}
        clientPaginationMode
        loading={loading.loader && loading.name === 'onFetchDetails'}
        onPageChange={() => null}
        onPageSizeChange={(size) => setPageSize(size)}
        rowCount={totalRowCount}
        pageSizeNumber={pageSize}
      />
    </>
  );
};
export default DetailedCashTransactions;
