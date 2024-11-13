/* eslint-disable no-unused-vars */
/* eslint-disable no-nested-ternary */
/* eslint-disable max-len */
import { useEffect, useState } from 'react';
import moment from 'moment';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Grid, TableHead, TableBody, TableRow, TableCell, CircularProgress, DialogContentText, Alert
} from '@mui/material';
import { Service } from '../../../../service';
import { ROUTENAME, VARIABLE } from '../../../../constants';
import DetailedCashTransactions from './detailedCashTransactions';
import DetailedPacketTransactions from './detailedPacketTransations';
import DetailedBankTransactions from './detailedBankTransactions';
import { MenuNavigation, ToastMessage, DialogBox } from '../../../../components';
import {
  ButtonPrimary, HeaderContainer, CustomContainerStyled, LoadingButtonPrimary, HeadingMaster,
  BreadcrumbsWrapperContainerStyled, BreadcrumbsContainerStyled, CenterContainerStyled
} from '../../../../components/styledComponents';
import {
  cashPacketManageNavigation, HeadingMaster2, CustomTableCell, CustomTable2, CustomGrid,
  transactionCategoryType
} from '../../helper';
import { useScreenSize } from '../../../../customHooks';

const amountFormat = Intl.NumberFormat('en-IN');

const TableWrapper = styled('div')(() => ({
  overflow: 'auto',
  width: '100%'
}));

const StyledTableRow = styled(TableRow)(() => ({
  backgroundColor: '#f5f5f5 !important',
  color: 'black'
}));

const StyledTableCell = styled(TableCell)(() => ({
  color: '#502A74 !important',
  fontSize: '16px',
  fontWeight: 700,
}));

const CashAndPacketManagement = () => {
  const [tableData, setTableData] = useState([[]]);
  const [summaryData, setSummaryData] = useState(null);
  const [packetData, setPacketData] = useState(null);
  const [bankTransactionData, setBankTransactionData] = useState(null);
  const [bankTransactionStatus, setBankTransactionStatus] = useState(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(null);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [loading, setLoading] = useState({ loader: false, name: null });
  const [open, setOpen] = useState({ cashTransaction: false, packetTransaction: false, bankTransaction: false });
  const navigate = useNavigate();
  const { selectedBranch, branchCodes } = useSelector((state) => state.user.userDetails);
  const screen = useScreenSize();

  const fetchInitialDetails = async () => {
    try {
      setLoading({ loader: true, name: 'onFetchInitialDetails' });
      const request1 = Service.get(`${process.env.REACT_APP_CASH_SERVICE}/cashandpacketsummary/cashpos`);
      const request2 = Service.get(`${process.env.REACT_APP_CASH_SERVICE}/cashandpacketsummary/cashposdetail`);
      const request3 = Service.get(`${process.env.REACT_APP_CASH_SERVICE}/cashandpacketsummary/details`);
      await Promise.all([request1, request2, request3]).then(([response1, response2, response3]) => {
        setTableData([response2.data?.data?.cash_in, response2.data?.data?.cash_out]);
        setSummaryData(response1.data?.data);
        if (response3.data?.data) {
          setPacketData(response3.data.data);
        } else {
          setAlertShow({ open: true, msg: `Packet summary not found for the branch ${selectedBranch === VARIABLE.BRANCHALL ? branchCodes[0] : selectedBranch}`, alertType: 'error' });
        }
      }).catch((err) => {
        console.log('err', err);
        setAlertShow({ open: true, msg: 'Something went wrong, While fetching cash details.', alertType: 'error' });
      });
      await Service.post(`${process.env.REACT_APP_CASH_SERVICE}/banktransactions/details`, { fetch_listing_data: false }).then((res) => {
        setBankTransactionStatus(res.status);
        setBankTransactionData(res?.data?.data);
      }).catch((err) => {
        console.log('err', err);
        setAlertShow({ open: true, msg: `Bank Transactions summary not found for the branch ${selectedBranch === VARIABLE.BRANCHALL ? branchCodes[0] : selectedBranch}`, alertType: 'error' });
      });
    } catch (err) {
      console.log('err', err);
      setAlertShow({ open: true, msg: 'Something went wrong, While fetching cash details.', alertType: 'error' });
    } finally {
      setLoading({ loader: false, name: null });
    }
  };

  const handleSave = async () => {
    try {
      setIsConfirmationOpen(false);
      setLoading({ loader: true, name: 'onSave' });
      setAlertShow({ open: true, msg: 'Cash & Packet balance saved for the day.', alertType: 'success' });
      // const { status } = await Service.post(`${process.env.REACT_APP_CASH_SERVICE}/cashandpacketsummary/close`, {});
      // if (status === 200) {
      //   setAlertShow({ open: true, msg: 'Cash & Packet balance saved for the day.', alertType: 'success' });
      // } else {
      //   setAlertShow({ open: true, msg: 'Something went wrong, Please try again.', alertType: 'error' });
      // }
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
    fetchInitialDetails();
  }, []);

  const handleClose = (event, reason) => {
    if (reason && ['escapeKeyDown', 'backdropClick'].includes(reason)) {
      return;
    }
    setOpen({ cashTransaction: false, packetTransaction: false, bankTransaction: false });
  };

  const handleConfirmationClose = (event, reason) => {
    if (reason && ['escapeKeyDown', 'backdropClick'].includes(reason)) {
      return;
    }
    setIsConfirmationOpen(false);
  };

  return (
    <>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={cashPacketManageNavigation} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      <ToastMessage
        alertShow={alertShow}
        setAlertShow={setAlertShow}
      />
      <CustomContainerStyled padding='0 !important'>
        {
          loading.loader && loading.name === 'onFetchInitialDetails' ? (
            <CenterContainerStyled padding='40px'>
              <CircularProgress color='secondary' />
            </CenterContainerStyled>
          ) : (
            <>
              <HeaderContainer
                item
                xs={12}
                width={['xs', 'sm'].includes(screen) ? '100%' : 'auto'}
                flexDirection={['xs', 'sm'].includes(screen) ? 'column' : 'row'}
                justifyItems={['xs', 'sm'].includes(screen) ? 'space-between' : 'space-between'}
              >
                <HeadingMaster>Cash Management</HeadingMaster>
                <div style={{ display: 'flex', flexDirection: ['xs', 'sm'].includes(screen) ? 'row' : 'row', justifyContent: ['xs', 'sm'].includes(screen) ? 'space-between' : 'space-between' }}>
                  <ButtonPrimary margin='5px 5px 5px 0px' disabled={!summaryData} onClick={() => setOpen({ cashTransaction: true, packetTransaction: false, bankTransaction: false })}>Cash Transactions</ButtonPrimary>
                  <ButtonPrimary onClick={() => navigate(ROUTENAME.initiateCashTransaction)}>Initiate Cash Transactions</ButtonPrimary>
                </div>
              </HeaderContainer>
              {
                summaryData
                  ? (
                    <>
                      <Grid container padding='0px 20px 20px' display='flex'>
                        <Grid item xs={12} sm={12} md={6} lg={6} xl={6} display='flex'>
                          <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                            <HeadingMaster2 padding='0 !important'>Branch Code</HeadingMaster2>
                          </Grid>
                          <CustomGrid item xs={12} sm={12} md={6} lg={8} xl={8}>
                            :
                            &nbsp;
                            <span>{selectedBranch === VARIABLE.BRANCHALL ? branchCodes[0] : selectedBranch}</span>
                          </CustomGrid>
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={6} xl={6} display='flex'>
                          <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                            <HeadingMaster2 padding='0 !important'>Date</HeadingMaster2>
                          </Grid>
                          <CustomGrid item xs={12} sm={12} md={6} lg={8} xl={8}>
                            :
                            &nbsp;
                            <span>{moment(summaryData?.submit_date).format('Do MMMM YYYY')}</span>
                          </CustomGrid>
                        </Grid>
                      </Grid>
                      <Grid container padding='0px 20px 20px' display='flex'>
                        <Grid item xs={12} sm={12} md={6} lg={6} xl={6} display='flex'>
                          <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                            <HeadingMaster2 padding='0 !important'>
                              Opening Balance
                              {' '}
                              (₹)
                            </HeadingMaster2>
                          </Grid>
                          <CustomGrid item xs={12} sm={12} md={6} lg={8} xl={8}>
                            :
                            &nbsp;
                            <span>{amountFormat.format(summaryData?.opening_balance)}</span>
                          </CustomGrid>
                        </Grid>
                      </Grid>
                      <Grid container padding='0px 20px 20px' display='flex' justifyContent='center'>
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                          <TableWrapper>
                            <CustomTable2>
                              <TableHead>
                                <TableRow>
                                  <TableCell align='center' colSpan={2}>Cash In</TableCell>
                                  <TableCell align='center' colSpan={2}>Cash Out</TableCell>
                                </TableRow>
                                <StyledTableRow>
                                  <StyledTableCell align='center'>Category</StyledTableCell>
                                  <StyledTableCell align='center'>
                                    Amount
                                    {' '}
                                    (₹)
                                  </StyledTableCell>
                                  <StyledTableCell align='center'>Category</StyledTableCell>
                                  <StyledTableCell align='center'>
                                    Amount
                                    {' '}
                                    (₹)
                                  </StyledTableCell>
                                </StyledTableRow>
                              </TableHead>
                              <TableBody>
                                {tableData[0].map((item, index) => (
                                  <TableRow colSpan={2}>
                                    <CustomTableCell align='center'>{transactionCategoryType[item.category]}</CustomTableCell>
                                    <TableCell align='center'>{amountFormat.format(item.amount)}</TableCell>
                                    <CustomTableCell align='center'>{transactionCategoryType[tableData[1][index].category]}</CustomTableCell>
                                    <TableCell align='center'>{amountFormat.format(tableData[1][index].amount)}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </CustomTable2>
                          </TableWrapper>
                        </Grid>
                      </Grid>
                      <Grid container padding='0px 20px 20px' display='flex'>
                        <Grid item xs={12} sm={12} md={6} lg={6} xl={6} display='flex'>
                          <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                            <HeadingMaster2 padding='0 !important'>
                              Closing Balance
                              {' '}
                              (₹)
                            </HeadingMaster2>
                          </Grid>
                          <CustomGrid item xs={12} sm={12} md={6} lg={8} xl={8}>
                            :
                            &nbsp;
                            <span>{amountFormat.format(summaryData?.closing_balance)}</span>
                          </CustomGrid>
                        </Grid>
                      </Grid>
                    </>
                  )
                  : (
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12} padding='40px 0px' display='flex' justifyContent='center'>
                      <Alert severity='error'>{`No data found for the branch ${selectedBranch === VARIABLE.BRANCHALL ? branchCodes[0] : selectedBranch}`}</Alert>
                    </Grid>
                  )
}
            </>
          )
      }
      </CustomContainerStyled>
      <CustomContainerStyled padding='0 !important' style={{ marginTop: '20px' }}>
        {
          loading.loader && loading.name === 'onFetchInitialDetails' ? (
            <CenterContainerStyled padding='40px'>
              <CircularProgress color='secondary' />
            </CenterContainerStyled>
          ) : (
            <>
              <HeaderContainer item xs={12}>
                <HeadingMaster>Bank Transaction Management</HeadingMaster>
                <ButtonPrimary onClick={() => setOpen({ cashTransaction: false, packetTransaction: false, bankTransaction: true })}>Bank Transactions</ButtonPrimary>
              </HeaderContainer>
              {bankTransactionStatus === 200 ? (
                <Grid container padding='0px 20px 10px' display='flex'>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <TableWrapper>
                      <CustomTable2>
                        <TableHead>
                          <TableRow>
                            <TableCell align='center'>Bank In</TableCell>
                            <TableCell align='center'>Bank Out</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <CustomTableCell align='center'>
                              Online Repayment :  &nbsp;  &nbsp;
                              {bankTransactionData?.bank_in ? amountFormat.format(bankTransactionData?.bank_in) : '0'}
                            </CustomTableCell>

                            <CustomTableCell align='center'>
                              Online Disbursal :  &nbsp;  &nbsp;
                              {bankTransactionData?.bank_out ? amountFormat.format(bankTransactionData?.bank_out) : '0'}
                            </CustomTableCell>
                          </TableRow>
                        </TableBody>
                      </CustomTable2>
                    </TableWrapper>
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={6} xl={6} display='flex'>
                    <Grid item xs={12} sm={12} md={6} lg={5} xl={5}>
                      <HeadingMaster2 padding='0 !important'>Count of LAN</HeadingMaster2>
                    </Grid>
                    <CustomGrid item xs={6} sm={6} md={6} lg={7} xl={7}>
                      :
                      &nbsp;
                      <span>{bankTransactionData?.loan_count ?? 'NA'}</span>
                    </CustomGrid>
                  </Grid>
                </Grid>
              ) : (
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12} padding='40px 0px' display='flex' justifyContent='center'>
                  <Alert severity='error'>{`No data found for the branch ${selectedBranch === VARIABLE.BRANCHALL ? branchCodes[0] : selectedBranch}`}</Alert>
                </Grid>
              )}
            </>
          )
        }
      </CustomContainerStyled>
      { summaryData
        ? (
          <>
            <CustomContainerStyled padding='0 !important' style={{ marginTop: '20px' }}>
              <HeaderContainer item xs={12}>
                <HeadingMaster>Packet Management</HeadingMaster>
                <div style={{ display: 'flex', flexDirection: ['xs', 'sm'].includes(screen) ? 'row' : 'row', justifyContent: ['xs', 'sm'].includes(screen) ? 'space-between' : 'space-between' }}>
                  <ButtonPrimary onClick={() => setOpen({ cashTransaction: false, packetTransaction: true, bankTransaction: false, })} disabled={!packetData}>Packet Transactions</ButtonPrimary>
                  <ButtonPrimary onClick={() => navigate(ROUTENAME.initiatePacketTransaction)}>Initiate Packet Transactions</ButtonPrimary>
                </div>
              </HeaderContainer>
              <Grid container padding='0px 20px 10px' display='flex'>
                <Grid item xs={12} sm={12} md={6} lg={6} xl={6} display='flex'>
                  <Grid item xs={12} sm={12} md={6} lg={5} xl={5}>
                    <HeadingMaster2 padding='0 !important'>Opening Packet Balance</HeadingMaster2>
                  </Grid>
                  <CustomGrid item xs={6} sm={6} md={6} lg={7} xl={7}>
                    :
                    &nbsp;
                    <span>{packetData?.opening_packets ?? 'NA'}</span>
                  </CustomGrid>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6} xl={6} display='flex'>
                  <Grid item xs={12} sm={12} md={6} lg={5} xl={5}>
                    <HeadingMaster2 padding='0 !important'>Packets Added For The Day</HeadingMaster2>
                  </Grid>
                  <CustomGrid item xs={6} sm={6} md={6} lg={7} xl={7}>
                    :
                    &nbsp;
                    <span>{packetData?.packets_in ?? 'NA'}</span>
                  </CustomGrid>
                </Grid>
              </Grid>
              <Grid container padding='0px 20px 10px' display='flex'>
                <Grid item xs={12} sm={12} md={6} lg={6} xl={6} display='flex'>
                  <Grid item xs={12} sm={12} md={6} lg={5} xl={5}>
                    <HeadingMaster2 padding='0 !important'>Closing Packet Balance</HeadingMaster2>
                  </Grid>
                  <CustomGrid item xs={6} sm={6} md={6} lg={7} xl={7}>
                    :
                    &nbsp;
                    <span>{packetData?.closing_packets ?? 'NA'}</span>
                  </CustomGrid>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6} xl={6} display='flex'>
                  <Grid item xs={12} sm={12} md={6} lg={5} xl={5}>
                    <HeadingMaster2 padding='0 !important'>Packets Removed For The Day</HeadingMaster2>
                  </Grid>
                  <CustomGrid item xs={6} sm={6} md={6} lg={7} xl={7}>
                    :
                    &nbsp;
                    <span>{packetData?.packets_out ?? 'NA'}</span>
                  </CustomGrid>
                </Grid>
              </Grid>
            </CustomContainerStyled>
            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} padding='20px 0px' display='flex' justifyContent='center'>
              <LoadingButtonPrimary
                loading={loading.loader && loading.name === 'onSave'}
                onClick={() => setIsConfirmationOpen(true)}
              >
                Save for the day
              </LoadingButtonPrimary>
            </Grid>
            <DialogBox
              isOpen={open.cashTransaction || open.packetTransaction}
              fullScreen
              title={open.cashTransaction ? 'Detailed Cash Transactions' : 'Detailed Packet Transactions'}
              width='100%'
              handleClose={handleClose}
            >
              <CustomContainerStyled padding='20px !important'>
                {
                open.cashTransaction ? (
                  <DetailedCashTransactions summaryData={{
                    branch_code: selectedBranch === VARIABLE.BRANCHALL ? branchCodes[0] : selectedBranch,
                    closing_balance: summaryData?.closing_balance
                  }}
                  />
                ) : null
                }
                {
                open.packetTransaction ? (
                  <DetailedPacketTransactions summaryData={{
                    branch_code: selectedBranch === VARIABLE.BRANCHALL ? branchCodes[0] : selectedBranch,
                    closing_packets: packetData?.closing_packets
                  }}
                  />
                ) : null
                }
              </CustomContainerStyled>
            </DialogBox>
            <DialogBox
              isOpen={isConfirmationOpen}
              title=''
              handleClose={handleConfirmationClose}
              width='460px'
              padding='30px'
            >
              <DialogContentText style={{ textAlign: 'center' }}>
                Are you sure you want to save Cash & Packet balance for the day?
              </DialogContentText>
              <CenterContainerStyled flexDirection='row' padding='20px 0 0 0'>
                <ButtonPrimary onClick={handleSave}>Yes</ButtonPrimary>
                <ButtonPrimary onClick={() => setIsConfirmationOpen(false)}>No</ButtonPrimary>
              </CenterContainerStyled>
            </DialogBox>
          </>
        )
        : null}
      <DialogBox
        isOpen={open.bankTransaction}
        fullScreen
        title='Detailed Bank Transactions'
        width='100%'
        handleClose={handleClose}
      >
        <CustomContainerStyled padding='20px !important'>
          <DetailedBankTransactions summaryData={{
            branch_code: selectedBranch === VARIABLE.BRANCHALL ? branchCodes[0] : selectedBranch,
          }}
          />
        </CustomContainerStyled>
      </DialogBox>
    </>
  );
};

export default CashAndPacketManagement;
