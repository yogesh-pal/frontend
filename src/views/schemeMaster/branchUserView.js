/* eslint-disable no-unreachable */
/* eslint-disable max-len */
import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { Grid, Typography } from '@mui/material';
import { Service } from '../../service/index';
import SchemeTable from '../../components/table';
import { NAVIGATION } from '../../constants';
import {
  DialogBox, MenuNavigation, ToastMessage, TableComponent
} from '../../components';
import {
  CustomContainerStyled, BreadcrumbsContainerStyled,
  BreadcrumbsWrapperContainerStyled, HeadingMaster, HeaderContainer, TextFieldStyled, ButtonPrimary
} from '../../components/styledComponents';
import {
  rebateSlabTableColumns, foreClosureChargesTableColumns, schemeMasterBranchUserColumnFields, repaymentFrequencyToLabelMapper
} from './constant';

const CustomForm = styled.form`
  padding: 20px 0px;
`;

const HeadingMaster2 = styled(Typography)`
 font-size: 20px;
 color: #502A74;
 font-weight: 550;
`;

const SchemeMasterBranchUsers = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });

  // Scheme detail dialog and Rebate slab dialog related state variables
  const [dialogOpen, setDialogOpen] = useState(false);
  const [nestedDialogOpen, setNestedDialogOpen] = useState(false);

  // Selected/Clicked row, Rebate slab table data and Forclose table data related state variables
  const [selectedRow, setSelectedRow] = useState(null);
  const [rebateRows, setRebateRows] = useState([]);
  const [forclosureRows, setForeclosureRows] = useState([]);

  let schemaRebateSlabs = [];
  let foreclosureCharges = [];

  const navigationDetails = [
    { name: 'Dashboard', url: NAVIGATION.dashboard },
    { name: 'Scheme Master', url: NAVIGATION.scheme }
  ];

  const schemeDetailsModalHandler = (currRow) => {
    try {
      setDialogOpen(true);

      if (['REB', 'RSU'].includes(currRow.type)) {
        try {
          schemaRebateSlabs = JSON.parse(currRow.rebate).map((item, idx) => ({
            ...item,
            _id: idx + 1
          }));
          setRebateRows(schemaRebateSlabs);
        } catch (rebateError) {
          console.error('Error parsing rebate slabs data:', rebateError);
          setRebateRows([]);
        }
      }

      if (currRow.prepayment_allowed === true) {
        try {
          foreclosureCharges = JSON.parse(currRow.prepayment_charges).map((item, idx) => ({
            ...item,
            _id: idx + 1,
            slab: `${item.slab} Days`
          }));
          setForeclosureRows(foreclosureCharges);
        } catch (prepaymentError) {
          console.error('Error parsing foreclosure/prepayment charges:', prepaymentError);
          setForeclosureRows([]);
        }
      }

      currRow.processing_fee = 'NA';
      if (currRow.fee) {
        try {
          JSON.parse(currRow.fee).forEach((item) => {
            if (item.name === 'PROCESSING') {
              if (item.type === 'flat_value') currRow.processing_fee = item.value;
              else currRow.processing_fee = `${item.value}%`;
            }
          });
        } catch (feeError) {
          console.error('Error parsing processing fee data:', feeError);
          currRow.processing_fee = 'NA';
        }
      }

      setSelectedRow(currRow);
    } catch (error) {
      console.error('Error handling scheme details modal:', error);
    }
  };

  // Fetching data from the scheme API
  const fetchData = async (pNo, pSize) => {
    try {
      if (pNo && pSize) {
        setLoading(true);
        const requestBody = {
          branches_code: [],
          is_active: true
        };
        const { data } = await Service.post(`${process.env.REACT_APP_SCHEME_LIST}?page_size=${pSize}&page=${pNo}`, requestBody);

        if (data?.results?.length > 0) {
          const res = [];
          data?.results.forEach((item) => {
            res.push({
              _id: item.scheme.code,
              Scheme_Name: item.scheme.name,
              Scheme_Code: item.scheme.code,
              Scheme_Type: item.scheme.type,
              Scheme_RPG_LTV: item.scheme.rpg_ltv,
              fullData: item
            },);
          });
          setRows(res);
          setRowCount(data.count);
        } else {
          setRows([]);
          setRowCount(0);
        }
      }
    } catch (e) {
      console.error(e);
      const errorMessage = 'Schemes could not be fetched!';
      setAlertShow({ open: true, msg: errorMessage, alertType: 'error' });
    } finally {
      setLoading(false);
    }
  };

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

  const buttonLabel = {
    REB: 'Click here for Rebate Slab',
    RSU: 'Click here for Rebate Step Up Slab'
  };

  useEffect(() => {
    fetchData(page, pageSize);
  }, [page, pageSize]);

  return (
    <>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={navigationDetails} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      <ToastMessage
        alertShow={alertShow}
        setAlertShow={setAlertShow}
      />
      <CustomContainerStyled padding='0 !important'>
        <HeaderContainer item xs={12} padding='20px 20px 0px 20px'>
          <HeadingMaster>
            Scheme Master
          </HeadingMaster>
        </HeaderContainer>

        <SchemeTable
          rows={rows}
          columns={schemeMasterBranchUserColumnFields(schemeDetailsModalHandler)}
          checkboxAllowed={false}
          clientPaginationMode={false}
          loading={loading}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          rowCount={rowCount}
          page={page}
          pageSize={pageSize}
        />
        <DialogBox
          isOpen={dialogOpen}
          handleClose={() => setDialogOpen(false)}
          padding='0px'
          title='Scheme Details'
        >
          { (dialogOpen && selectedRow)
            && (
            <CustomForm>
              <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
                <Grid item xs={12} sm={6} md={5} lg={5} xl={5} padding='10px'>
                  <HeadingMaster2>Scheme Name</HeadingMaster2>
                </Grid>
                <Grid item xs={12} sm={6} md={5} lg={5} xl={5} padding='10px'>
                  <TextFieldStyled
                    label=''
                    multiline
                    maxRows={2}
                    defaultValue={selectedRow.name}
                    disabled
                  />
                </Grid>
              </Grid>
              <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
                <Grid item xs={12} sm={6} md={5} lg={5} xl={5} padding='10px'>
                  <HeadingMaster2>Scheme Type</HeadingMaster2>
                </Grid>
                <Grid item xs={12} sm={6} md={5} lg={5} xl={5} padding='10px'>
                  <TextFieldStyled
                    label=''
                    multiline
                    maxRows={2}
                    defaultValue={selectedRow.type}
                    disabled
                  />
                </Grid>
              </Grid>
              <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
                <Grid item xs={12} sm={6} md={5} lg={5} xl={5} padding='10px'>
                  <HeadingMaster2>Min Loan Amt</HeadingMaster2>
                </Grid>
                <Grid item xs={12} sm={6} md={5} lg={5} xl={5} padding='10px'>
                  <TextFieldStyled
                    label=''
                    multiline
                    maxRows={2}
                    defaultValue={selectedRow.min_loan_amount}
                    disabled
                  />
                </Grid>
              </Grid>
              <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
                <Grid item xs={12} sm={6} md={5} lg={5} xl={5} padding='10px'>
                  <HeadingMaster2>Max Loan Amt</HeadingMaster2>
                </Grid>
                <Grid item xs={12} sm={6} md={5} lg={5} xl={5} padding='10px'>
                  <TextFieldStyled
                    label=''
                    multiline
                    maxRows={2}
                    defaultValue={selectedRow.max_loan_amount}
                    disabled
                  />
                </Grid>
              </Grid>
              <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
                <Grid item xs={12} sm={6} md={5} lg={5} xl={5} padding='10px'>
                  <HeadingMaster2>Tenure</HeadingMaster2>
                </Grid>
                <Grid item xs={12} sm={6} md={5} lg={5} xl={5} padding='10px'>
                  <TextFieldStyled
                    label=''
                    multiline
                    maxRows={2}
                    defaultValue={`${selectedRow.loan_tenure} Months`}
                    disabled
                  />
                </Grid>
              </Grid>
              <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
                <Grid item xs={12} sm={6} md={5} lg={5} xl={5} padding='10px'>
                  <HeadingMaster2>ROI per annum</HeadingMaster2>
                </Grid>
                <Grid item xs={12} sm={6} md={5} lg={5} xl={5} padding='10px'>
                  <TextFieldStyled
                    label=''
                    multiline
                    maxRows={2}
                    defaultValue={`${selectedRow.roi}%`}
                    disabled
                  />
                </Grid>
              </Grid>
              <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
                <Grid item xs={12} sm={6} md={5} lg={5} xl={5} padding='10px'>
                  <HeadingMaster2>Processing Fee</HeadingMaster2>
                </Grid>
                <Grid item xs={12} sm={6} md={5} lg={5} xl={5} padding='10px'>
                  <TextFieldStyled
                    label=''
                    multiline
                    maxRows={2}
                    defaultValue={selectedRow.processing_fee}
                    disabled
                  />
                </Grid>
              </Grid>
              <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
                <Grid item xs={12} sm={6} md={5} lg={5} xl={5} padding='10px'>
                  <HeadingMaster2>RPG</HeadingMaster2>
                </Grid>
                <Grid item xs={12} sm={6} md={5} lg={5} xl={5} padding='10px'>
                  <TextFieldStyled
                    label=''
                    multiline
                    maxRows={2}
                    defaultValue={`${selectedRow.rpg_ltv}%`}
                    disabled
                  />
                </Grid>
              </Grid>
              <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
                <Grid item xs={12} sm={6} md={5} lg={5} xl={5} padding='10px'>
                  <HeadingMaster2>Frequency</HeadingMaster2>
                </Grid>
                <Grid item xs={12} sm={6} md={5} lg={5} xl={5} padding='10px'>
                  <TextFieldStyled
                    label=''
                    multiline
                    maxRows={2}
                    defaultValue={repaymentFrequencyToLabelMapper[selectedRow.repayment_frequency]}
                    disabled
                  />
                </Grid>
              </Grid>
              <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
                <Grid item xs={12} sm={6} md={5} lg={5} xl={5} padding='10px'>
                  <HeadingMaster2>Reserve amount</HeadingMaster2>
                </Grid>
                <Grid item xs={12} sm={6} md={5} lg={5} xl={5} padding='10px'>
                  <TextFieldStyled
                    label=''
                    multiline
                    maxRows={2}
                    defaultValue={selectedRow.reserve_amount}
                    disabled
                  />
                </Grid>
              </Grid>
              <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
                <Grid item xs={12} sm={6} md={5} lg={5} xl={5} padding='10px'>
                  <HeadingMaster2>Foreclose Charges</HeadingMaster2>
                </Grid>
                <Grid item xs={12} sm={6} md={5} lg={5} xl={5} padding='10px'>
                  { !selectedRow.prepayment_allowed
                    ? (
                      <TextFieldStyled
                        label=''
                        multiline
                        maxRows={2}
                        defaultValue='There are no forelcosure charges.'
                        disabled
                      />
                    )
                    : (
                      <TableComponent
                        rows={forclosureRows}
                        columns={foreClosureChargesTableColumns}
                        clientPaginationMode
                        pageSizeNumber={forclosureRows.length}
                        rowsPerPageOptions={[forclosureRows.length]}
                      />
                    )}
                </Grid>
              </Grid>
              <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
                <Grid item xs={12} sm={6} md={5} lg={5} xl={5} padding='10px'>
                  <HeadingMaster2>Penal charges on Overdue amount</HeadingMaster2>
                </Grid>
                <Grid item xs={12} sm={6} md={5} lg={5} xl={5} padding='10px'>
                  <TextFieldStyled
                    label=''
                    multiline
                    maxRows={2}
                    defaultValue='3% per month + GST'
                    disabled
                  />
                </Grid>
              </Grid>
              {['REB', 'RSU'].includes(selectedRow.type) && (
              <Grid container display='flex' alignItems='center' justifyContent='center'>
                <ButtonPrimary onClick={() => { setNestedDialogOpen(true); setDialogOpen(false); }}>{buttonLabel[selectedRow.type]}</ButtonPrimary>
              </Grid>
              )}
            </CustomForm>
            )}
        </DialogBox>
        { (nestedDialogOpen && selectedRow)
            && (
            <DialogBox
              isOpen={nestedDialogOpen}
              handleClose={() => { setNestedDialogOpen(false); setDialogOpen(true); }}
              padding='0px'
              title={`${selectedRow.name}'s Rebate Slabs`}
            >
              <Grid container display='flex' padding='0px 10px'>
                <Grid item xs={12} sm={4} md={4} lg={4} xl={4} padding='10px'>
                  <TextFieldStyled
                    label='Rate Chart Code'
                    multiline
                    maxRows={2}
                    defaultValue={selectedRow.fc_rebate_rate_chart_code}
                    disabled
                  />
                </Grid>
                <Grid item xs={12}>
                  <TableComponent
                    rows={rebateRows}
                    columns={rebateSlabTableColumns}
                    clientPaginationMode
                    pageSizeNumber={rebateRows.length}
                    rowsPerPageOptions={[rebateRows.length]}
                  />
                </Grid>
              </Grid>
            </DialogBox>
            )}
      </CustomContainerStyled>
    </>
  );
};

export default SchemeMasterBranchUsers;
