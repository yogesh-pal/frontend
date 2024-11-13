/* eslint-disable max-len */
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Box, CircularProgress, Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useScreenSize } from '../../../../../customHooks';
import {
  FormViewer, MenuNavigation, ToastMessage, DialogBox
} from '../../../../../components';
import {
  HeaderContainer, CustomContainerStyled, BreadcrumbsContainerStyled, TextFieldStyled,
  BreadcrumbsWrapperContainerStyled, HeadingMaster, SelectMenuStyle
} from '../../../../../components/styledComponents';
import { deputationCasesColumnFields, deputationStatus } from '../constant';
import { Service } from '../../../../../service';
import CheckerUserDetails from '../checkerUserDetails';
import { deputationCasesNavigation } from '../../../helper';

const DeputationCases = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [clickedRow, setClickedRow] = useState(null);
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [endDate, setEndDate] = useState(moment().format('MM/DD/YYYY'));
  const [isLoading, setIsLoading] = useState({ loader: false, name: null });
  const [pageInfo, setPageInfo] = useState({ pageNumber: 1, pageSize: 10 });
  const [startDate, setStartDate] = useState(moment().subtract(6, 'days').format('MM/DD/YYYY'));

  const screen = useScreenSize();

  const getDeputationCasesCount = async (params) => {
    try {
      const requestBody = {};
      if (params?.status && params.status !== 'ALL') {
        requestBody.status = params.status;
      }
      if (params?.startDate && params?.endDate && moment(params.startDate, 'dd/mm/yyyy').isValid() && moment(params.endDate, 'dd/mm/yyyy').isValid()) {
        requestBody.from_date = params.startDate;
        requestBody.to_date = params.endDate;
      }
      const { data } = await Service.post(`${process.env.REACT_APP_USER_SERVICE}/deputation/listcount`, requestBody);
      setTotalRowCount(data?.deputation_count);
    } catch (err) {
      if (err?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong. Please try again.', alertType: 'error' });
      }
    }
  };

  const getDeputationCases = async (pageNumber, pageSize, params) => {
    try {
      const requestBody = {};
      if (params?.status && params.status !== 'ALL') {
        requestBody.status = params.status;
      }
      if (params?.startDate && params?.endDate && moment(params.startDate, 'dd/mm/yyyy').isValid() && moment(params.endDate, 'dd/mm/yyyy').isValid()) {
        requestBody.from_date = params.startDate;
        requestBody.to_date = params.endDate;
      }
      const { data } = await Service.post(`${process.env.REACT_APP_USER_SERVICE}/deputation/list?page=${pageNumber}&page_size=${pageSize}`, requestBody);
      if (data?.results) {
        data.results.forEach((item, ind) => {
          const [{ label }] = (deputationStatus.filter((ele) => ele.value === item.status));
          if (label) {
            item.status = label;
          }
          if (item.type === 'DEPUT') {
            item.type = 'Deputation';
          }
          if (item.type === 'DETAC') {
            item.type = 'Detachment';
          }
          item.current_branch_code = item.uid.branch_code;
          // eslint-disable-next-line no-underscore-dangle
          item._id = ind;
        });
        setTableData(data.results);
      }
    } catch (err) {
      if (err?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong. Please try again.', alertType: 'error' });
      }
    } finally {
      setIsLoading({ loader: false, name: null });
    }
  };

  useEffect(() => {
    getDeputationCasesCount({
      startDate: moment(startDate).format('DD/MM/YYYY'),
      endDate: moment(endDate).format('DD/MM/YYYY')
    });
    setIsLoading({ loader: true, name: 'onLoad' });
    getDeputationCases(1, 10, {
      startDate: moment(startDate).format('DD/MM/YYYY'),
      endDate: moment(endDate).format('DD/MM/YYYY')
    });
  }, []);

  const onPageChange = async (pageNumber) => {
    setPageInfo({ pageNumber, pageSize: pageInfo.pageSize });
    setIsLoading({ loader: true, name: 'onPageSizeChange' });
    await getDeputationCases(pageNumber, pageInfo.pageSize, {
      status: selectedStatus,
      startDate: moment(startDate).format('DD/MM/YYYY'),
      endDate: moment(endDate).format('DD/MM/YYYY')
    });
  };
  const onPageSizeChange = async (pageSize) => {
    setPageInfo({ pageNumber: pageInfo.pageNumber, pageSize });
    setIsLoading({ loader: true, name: 'onPageChange' });
    await getDeputationCases(pageInfo.pageNumber, pageSize, {
      status: selectedStatus,
      startDate: moment(startDate).format('DD/MM/YYYY'),
      endDate: moment(endDate).format('DD/MM/YYYY')
    });
  };

  const statusChangeHandler = (event) => {
    setSelectedStatus(event.target.value);
    getDeputationCasesCount({
      status: event.target.value,
      startDate: moment(startDate).format('DD/MM/YYYY'),
      endDate: moment(endDate).format('DD/MM/YYYY')
    });
    getDeputationCases(1, 10, {
      status: event.target.value,
      startDate: moment(startDate).format('DD/MM/YYYY'),
      endDate: moment(endDate).format('DD/MM/YYYY')
    });
  };

  const handleEndDateChange = (newEndDate) => {
    if (startDate) {
      setEndDate(newEndDate);
      getDeputationCasesCount({
        status: selectedStatus,
        startDate: moment(startDate).format('DD/MM/YYYY'),
        endDate: moment(newEndDate).format('DD/MM/YYYY')
      });
      getDeputationCases(pageInfo.pageNumber, pageInfo.pageSize, {
        status: selectedStatus,
        startDate: moment(startDate).format('DD/MM/YYYY'),
        endDate: moment(newEndDate).format('DD/MM/YYYY')
      });
    } else {
      setAlertShow({ open: true, msg: 'Please select start date.', alertType: 'error' });
    }
  };

  const handleClose = (event, reason) => {
    if (reason && ['escapeKeyDown', 'backdropClick'].includes(reason)) {
      return;
    }
    setIsOpen(false);
  };

  const onSuccessClose = async (msg) => {
    setIsOpen(false);
    setAlertShow({ open: true, msg, alertType: 'success' });
    await getDeputationCases(pageInfo.pageNumber, pageInfo.pageSize, {
      status: selectedStatus,
      startDate: moment(startDate).format('DD/MM/YYYY'),
      endDate: moment(endDate).format('DD/MM/YYYY')
    });
  };

  const disableEndDates = (currentDate) => moment(currentDate).isAfter(moment(startDate).add(7, 'days'), 'day') || moment(currentDate).isBefore(moment(startDate), 'day');

  return (
    <>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={deputationCasesNavigation} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      <CustomContainerStyled padding='0 !important'>
        <ToastMessage
          alertShow={alertShow}
          setAlertShow={setAlertShow}
        />
        <HeaderContainer item xs={12}>
          <HeadingMaster>Deputation Cases</HeadingMaster>
        </HeaderContainer>
        {
           isLoading.loader && isLoading.name === 'onLoad' ? (
             <Box sx={{
               display: 'flex', height: '100px', justifyContent: 'center', alignItems: 'center'
             }}
             >
               <CircularProgress style={{ color: '#502A74' }} />
             </Box>
           )
             : (
               <>
                 <Grid container padding='0 20px' display='flex' justifyContent='space-between'>
                   <Grid item xs={12} sm={5} md={3} lg={2} xl={2}>
                     <TextFieldStyled
                       label='Deputation Status'
                       defaultValue='ALL'
                       onChange={statusChangeHandler}
                       select
                     >
                       {deputationStatus.map((option) => (
                         <SelectMenuStyle
                           key={option.value}
                           value={option.value}
                         >
                           {option.label}
                         </SelectMenuStyle>
                       ))}
                     </TextFieldStyled>
                   </Grid>
                   <Grid item xs={12} sm={8} md={6} lg={4} xl={4} display='flex' padding={['xs', 'sm'].includes(screen) ? '20px 0 0' : '0'}>
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
                 <FormViewer
                   loading={isLoading.loader && isLoading.name !== 'onUpdate'}
                   formMode={{ show: false }}
                   rows={tableData}
                   columns={deputationCasesColumnFields}
                   checkboxAllowed={false}
                   onPageSizeChange={onPageSizeChange}
                   onPageChange={onPageChange}
                   alertShow={alertShow}
                   setAlertShow={setAlertShow}
                   rowCount={totalRowCount}
                   handleCellClick={(cellValue, rowData) => {
                     setClickedRow(rowData);
                     setIsOpen(true);
                   }}
                 />
               </>
             )
}
        <DialogBox
          isOpen={isOpen}
          fullScreen
          title='User Details'
          width='100%'
          handleClose={handleClose}
        >
          <CheckerUserDetails
            rowData={clickedRow}
            onSuccessClose={onSuccessClose}
          />
        </DialogBox>
      </CustomContainerStyled>
    </>
  );
};

export default DeputationCases;
