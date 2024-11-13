import moment from 'moment';
import { useSelector } from 'react-redux';
import React, {
  useMemo, useState, useEffect, useCallback
} from 'react';
import styled from '@emotion/styled';
import { Grid, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  HeaderContainer, CustomContainerStyled, BreadcrumbsContainerStyled,
  BreadcrumbsWrapperContainerStyled, HeadingMaster, TextFieldStyled, ButtonPrimary,
  ContainerPrimary, AutoCompleteStyled
} from '../../../components/styledComponents';
import { MenuNavigation, ToastMessage, TableComponent } from '../../../components';
import { NAVIGATION, VARIABLE } from '../../../constants';
import { Service } from '../../../service';
import {
  icons
} from '../../../components/icons';
import DialogBox from '../../../components/dialogBox';
import { useScreenSize } from '../../../customHooks';

const DownloadIcon = icons.CloudDownloadIcon;

const Li = styled.li`
      color: #502a74;
      &:hover{
        background-color: #502a741a !important;
      }
    `;

const BranchGroupingChecker = () => {
  // State variables related to Table Component
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rowCount, setRowCount] = useState(500);
  const [loading, setLoading] = useState(false);

  const [alertShow, setAlertShow] = useState({ open: false, msg: '' }); // Toaster state variable

  const [dialogOpen, setDialogOpen] = useState(false); // Dialog box state variable

  // State variables related to Branch selector
  const [branchOption, setBranchOption] = useState([]);
  const { branchCodes, selectedBranch } = useSelector((state) => state.user.userDetails);
  const [branch, setBranch] = useState(selectedBranch === VARIABLE.BRANCHALL ? '' : selectedBranch);

  // State variables related to start date and end date
  const [endDate, setEndDate] = useState(moment().format('MM-DD-YYYY'));
  const [startDate, setStartDate] = useState(moment().subtract(2, 'days').format('MM-DD-YYYY'));

  const [selectedRow, setSelectedRow] = useState(null);

  const [isDownloadForPreviewVisible, setIsDownloadForPreviewVisible] = useState(true);
  const [isModerationSectionVisible, setIsModerationSectionVisible] = useState(false);

  // State variables meant for remark textfield and it's validation
  const [remarkValue, setRemarkValue] = useState('');
  const [remarkError, setRemarkError] = useState('');
  const [isRemarkValid, setIsRemarkValid] = useState(false);

  const screen = useScreenSize();

  const downloadFileForPreviewHelperText = 'Download and view file to approve/decline accordingly.';

  // Download temp file from S3 to preview
  const downloadPreview = async (targetRow) => {
    try {
      if (!targetRow) return;
      const response = await Service.get(`${process.env.REACT_APP_GET_S3_URL}?module=GOLD&doc=${targetRow.s3_temp_file_path}`);
      window.open(response?.data?.data?.full_path, '_blank', 'noopener,noreferrer');
      setIsDownloadForPreviewVisible(false);
      setIsModerationSectionVisible(true);
    } catch (error) {
      console.error('Error downloading preview:', error);
    }
  };

  // Defining table columns
  const columns = [
    {
      field: 'maker', headerName: 'Maker', minWidth: 100, sortable: false, flex: 1
    },
    {
      field: 'maker_email', headerName: 'Maker Email', minWidth: 100, sortable: false, flex: 1
    },
    {
      field: 'maker_role', headerName: 'Maker Role', minWidth: 100, sortable: false, flex: 1
    },
    {
      field: 'maker_branch', headerName: 'Maker Branch', minWidth: 100, sortable: false, flex: 1
    },
    {
      field: 'created_on', headerName: 'Created on', minWidth: 100, sortable: false, flex: 1
    },
    {
      field: 'action',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      align: 'center',
      renderCell: (params) => (
        <DownloadIcon onClick={() => { setSelectedRow(params.row); setDialogOpen(true); setIsDownloadForPreviewVisible(true); setIsModerationSectionVisible(false); setRemarkValue(''); setRemarkError(''); setIsRemarkValid(false); }} />
      )
    }
  ];

  // Fetching data from the listing API
  const fetchData = useCallback(async (pNo, pSize, userBranch, sDate, eDate) => {
    try {
      if (pNo && pSize && userBranch && sDate && eDate) {
        setLoading(true);
        const URL = `${process.env.REACT_APP_BRANCH_GROUPING_CHECKER_LIST}?page=${pNo}&pageSize=${pSize}&selectedBranch=${userBranch}&startDate=${moment(sDate).format('DD-MM-YYYY')}&endDate=${moment(eDate).format('DD-MM-YYYY')}`;
        const { data, status } = await Service.get(URL);
        if (data?.success && status === 201) {
          const dataWithIds = data.data.map((item, idx) => ({
            ...item,
            _id: idx + 1
          }));
          setRows(dataWithIds);
          setRowCount(data.totalCount);
          setAlertShow({ open: true, msg: 'Branch grouping requests fetched successfully.' });
        } else {
          setAlertShow({ open: true, msg: 'Branch grouping requests data couldn\'t be fetched. Please try again', alertType: 'error' });
        }
      }
    } catch (err) {
      console.error(err);
      const errorMessage = 'Branch grouping requests data couldn\'t be fetched';
      setAlertShow({ open: true, msg: errorMessage, alertType: 'error' });
    } finally {
      setLoading(false);
    }
  }, [branch, endDate, startDate, page, pageSize]);

  // Handle table page change
  const onPageChange = (newPage) => {
    try {
      setPage(newPage);
    } catch (e) {
      console.log('Error handling table component page change', e);
    }
  };

  // Handle table page size change
  const onPageSizeChange = (newPageSize) => {
    try {
      setPageSize(newPageSize);
    } catch (e) {
      console.log('Error handling table component page size change', e);
    }
  };

  // Handle branch change (Option available for admins)
  const branchSelectHandler = (event, value) => {
    try {
      setBranch(value);
      setPage(1);
    } catch (e) {
      console.log('Error handling branch change', e);
    }
  };

  // Handler for end date change
  const handleEndDateChange = (newEndDate) => {
    try {
      if (startDate) {
        setEndDate(newEndDate);
        setPage(1);
      } else {
        setAlertShow({ open: true, msg: 'Please select start date.', alertType: 'error' });
      }
    } catch (error) {
      console.error('Error handling end date change:', error);
    }
  };

  const approveRow = async () => {
    try {
      if (isRemarkValid && selectedRow) {
        await Service.patch(`${process.env.REACT_APP_BRANCH_GROUPING_CHECKER_UPDATE}`, {
          id: selectedRow.id,
          status: 'APPROVED',
          remarks: remarkValue
        });
        setDialogOpen(false);
        setAlertShow({ open: true, msg: 'Branch grouping request submitted for approval.' });
      } else {
        setRemarkError('Invalid remark');
        setIsRemarkValid(false);
      }
    } catch (error) {
      console.error('Error approving row:', error);
    }
  };

  const declineRow = async () => {
    try {
      if (isRemarkValid && selectedRow) {
        await Service.patch(`${process.env.REACT_APP_BRANCH_GROUPING_CHECKER_UPDATE}`, {
          id: selectedRow.id,
          status: 'DECLINED',
          remarks: remarkValue
        });
        setDialogOpen(false);
        setAlertShow({ open: true, msg: 'Branch grouping request submitted for declining.' });
      } else {
        setRemarkError('Invalid remark');
        setIsRemarkValid(false);
      }
    } catch (error) {
      console.error('Error declining row:', error);
    }
  };

  // Validate the remark textfield input
  const validateInput = (newValue) => {
    try {
      if (newValue.trim() === '') {
        setRemarkError('This field is required');
        setIsRemarkValid(false);
      } else if (!/^[a-zA-Z0-9 ]*$/.test(newValue)) {
        setRemarkError('Only alphanumeric values and space are allowed');
        setIsRemarkValid(false);
      } else {
        setRemarkError('');
        setIsRemarkValid(true);
      }
    } catch (error) {
      console.error('Error validating remark input:', error);
    }
  };

  // Handle remark field's value change
  const handleRemarkChange = (event) => {
    try {
      const newValue = event.target.value;
      setRemarkValue(newValue);
      validateInput(newValue);
    } catch (error) {
      console.error('Error handling remark change :', error);
    }
  };

  // Handle remark field's blur event
  const handleRemarkBlur = () => {
    try {
      validateInput(remarkValue);
    } catch (error) {
      console.error('Error handling remark blur :', error);
    }
  };

  // Disable furture dates
  const disableEndDates = (currentDate) => moment(currentDate).isAfter(moment(startDate).add(7, 'days'), 'day') || moment(currentDate).isBefore(moment(startDate), 'day');

  useEffect(() => {
    if (branchCodes.length) {
      setBranchOption(branchCodes);
    }
    fetchData(page, pageSize, branch, startDate, endDate);
  }, [fetchData]);

  // Navigation breadcrumb
  const navigationDetails = useMemo(() => [
    { name: 'Dashboard', url: NAVIGATION.dashboard },
    { name: 'Uploader', url: NAVIGATION.uploader },
    { name: 'Branch Group Checker', url: NAVIGATION.branchGroupChecker }
  ], [NAVIGATION]);

  return (
    <>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={navigationDetails} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      <CustomContainerStyled padding='0px 20px 0px !important'>
        <ToastMessage
          alertShow={alertShow}
          setAlertShow={setAlertShow}
        />
        <HeaderContainer item xs={12}>
          <HeadingMaster>
            Branch Grouping Checker
          </HeadingMaster>
        </HeaderContainer>
        <HeaderContainer item xs={12} display={['xs', 'sm'].includes(screen) ? 'block' : 'flex'} justifyContent='space-between'>
          <div>
            <Grid item xs={12} sm={branchCodes.length <= 1 ? 8 : 12} md={branchCodes.length <= 1 ? 6 : 12} lg={branchCodes.length <= 1 ? 4 : 8} xl={branchCodes.length <= 1 ? 4 : 8} display='flex' justifyContent={['xs', 'sm'].includes(screen) ? 'space-between' : 'end'} margin='0px 0px 15px 0px' style={{ justifyContent: 'flex-start', marginLeft: '-10px' }}>
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
                  inputFormat='dd-MM-yyyy'
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
                    inputFormat='dd-MM-yyyy'
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
          <div />
        </HeaderContainer>
        <DialogBox
          isOpen={dialogOpen}
          handleClose={() => setDialogOpen(false)}
          title='Branch Grouping Checker - Approve/Decline'
          padding='0px'
        >
          <ContainerPrimary padding='40px'>
            { isDownloadForPreviewVisible && (
            <ContainerPrimary padding='20px' style={{ paddingTop: '0px', textAlign: 'center' }}>
              <Typography variant='body2' color='red'>
                <h4>
                  {downloadFileForPreviewHelperText}
                </h4>
              </Typography>
              <ButtonPrimary onClick={() => downloadPreview(selectedRow)} style={{ marginTop: '10px' }}>Download</ButtonPrimary>
            </ContainerPrimary>
            )}
            {isModerationSectionVisible && (
            <>
              <TextFieldStyled
                id='branch-checker-remarks'
                label='Remarks*'
                value={remarkValue}
                defaultValue=''
                isDisabled={false}
                maxRows={5}
                minRows={2}
                multiline
                onChange={handleRemarkChange}
                onBlur={handleRemarkBlur}
                helperText={remarkError}
                error={!!remarkError}
              />
              <Grid container spacing={2} marginTop={1}>
                <Grid item>
                  <ButtonPrimary onClick={approveRow}>Approve</ButtonPrimary>
                </Grid>
                <Grid item>
                  <ButtonPrimary onClick={declineRow}>Decline</ButtonPrimary>
                </Grid>
              </Grid>
            </>
            )}
          </ContainerPrimary>
        </DialogBox>
        <Grid item xs={12}>
          <TableComponent
            rows={rows}
            columns={columns}
            checkboxAllowed={false}
            clientPaginationMode={false}
            loading={loading}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            rowCount={rowCount}
            page={page}
            pageSize={pageSize}
          />
        </Grid>
      </CustomContainerStyled>
    </>
  );
};

export default BranchGroupingChecker;
