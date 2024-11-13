/* eslint-disable no-nested-ternary */
/* eslint-disable max-len */
import { useState, useEffect } from 'react';
import { Grid, CircularProgress } from '@mui/material';
import styled from '@emotion/styled';
import { useSelector } from 'react-redux';
import AutocompleteComponent from '../autoComplete';
import {
  ToastMessage,
  MenuNavigation,
  TableComponent,
  DialogBox,
  FormGenerator
} from '../../../../components';
import {
  CustomContainerStyled,
  BreadcrumbsWrapperContainerStyled,
  BreadcrumbsContainerStyled,
  HeadingMaster,
  HeaderContainer,
  CenterContainerStyled,
  ContainerStyled,
  LoadingButtonSecondaryPrimary,
  ButtonPrimary
} from '../../../../components/styledComponents';
import {
  columnFields, navigationDetails, formJsonDetails
} from './helper';
import { Service } from '../../../../service';
import { useScreenSize } from '../../../../customHooks';
import { errorMessageHandler } from '../../../../utils';

const CustomForm = styled('form')(({ width }) => ({
  width: width || '300px',
  display: 'flex'
}));

const VendorMaster = () => {
  const { userPermission } = useSelector((state) => state?.user?.userDetails);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [isOpen, setIsOpen] = useState(false);
  const [confirmationModel, setConfirmationModel] = useState('CLOSE');
  const [loading, setLoading] = useState({
    loader: true,
    name: ''
  });
  const [formConfiguration, setFormConfiguration] = useState();
  const [vendorList, setVendorList] = useState([]);
  const [selectedRow, setSelectedRow] = useState();
  const [formDetails, setFormDetails] = useState();
  const [searchDetails, setSearchDetails] = useState({
    data: [],
    rowCount: 0,
  });
  const message = {
    SUBMIT: 'Are you sure you want to create Vendor User?',
    CANCEL: 'Are you sure you want to cancel the user creation?',
  };
  const screen = useScreenSize();

  const vendorListHandler = async () => {
    try {
      const { data, status } = await Service.get(process.env.REACT_APP_VENDOR_MASTER_LIST);
      if (status === 200) {
        const sortedData = data.data.sort((a, b) => ((a.vendor_name.toLowerCase() > b.vendor_name.toLowerCase()) ? 1 : ((b.vendor_name.toLowerCase() > a.vendor_name.toLowerCase()) ? -1 : 0)));
        setVendorList(sortedData || []);
      }
    } catch (e) {
      const { data, status } = e.response;
      let msg = '';
      if (status === 403) {
        msg = errorMessageHandler(data.error);
      } else {
        msg = errorMessageHandler(data.errors);
      }
      setAlertShow({
        open: true,
        msg: msg || 'User detail API failed. Try again.',
        alertType: 'error'
      });
      console.log(e);
    }
  };

  const searchDetailsHandler = async (value) => {
    try {
      setLoading({
        loader: true,
        name: 'SEARCH'
      });
      const { data, status } = await Service.get(`${process.env.REACT_APP_VENDOR_MASTER_LIST}?vendor_code=${value.vendor_code}`);
      if (status === 200) {
        const tempMasterDetails = data.data.map((item, index) => ({
          _id: index + 1,
          ...item,
        }));
        setSearchDetails((prev) => ({
          ...prev,
          data: tempMasterDetails || [],
          rowCount: tempMasterDetails?.length || 0
        }));
        if (tempMasterDetails?.length === 0) {
          setAlertShow({
            open: true,
            msg: 'No record found.',
            alertType: 'error'
          });
        }
      }
      setLoading({
        loader: false,
        name: ''
      });
    } catch (e) {
      console.log('Error', e);
      setLoading({
        loader: false,
        name: ''
      });
    }
  };

  const selectValueHandler = async (value, val) => {
    try {
      if (val) {
        searchDetailsHandler(val, 'SEARCH');
        return;
      }

      setSearchDetails((prev) => ({
        ...prev,
        data: [],
        rowCount: 0
      }));
    } catch (e) {
      console.log('Error', e);
    }
  };

  const onPageSizeChange = (pageSize) => {
    try {
      console.log(pageSize);
    } catch (e) {
      console.log(e);
    }
  };

  const onPageChange = (pageNumber) => {
    try {
      console.log(pageNumber);
    } catch (e) {
      console.log(e);
    }
  };

  const handleClose = () => {
    try {
      setIsOpen(false);
      setFormConfiguration('');
    } catch (e) {
      console.log('Error', e);
    }
  };

  const onCancelHandler = () => {
    try {
      setConfirmationModel('CANCEL');
    } catch (e) {
      console.log('Error', e);
    }
  };

  const viewVendorDetailsHandler = async (cellValues) => {
    try {
      const { row } = cellValues;
      setSelectedRow(row);
      setFormConfiguration(formJsonDetails({ onCancelHandler, row }));
      setIsOpen(true);
    } catch (e) {
      console.log('Error', e);
    }
  };

  const formHandler = (values) => {
    try {
      const obj = {
        vendor_code: selectedRow?.vendor_code,
        emp_code: values?.user_id,
        salutation: values?.user_salutation,
        emp_name: values?.user_name,
        mobile: values?.mobile,
        email: values?.email,
        goldloan_status: values?.status === 'Active'
      };
      setFormDetails(obj);
      setConfirmationModel('SUBMIT');
    } catch (e) {
      console.log('Error', e);
    }
  };

  const formConfirmationHandler = async () => {
    try {
      if (confirmationModel === 'CANCEL') {
        setIsOpen(false);
        setConfirmationModel('CLOSE');
        return;
      }
      setLoading({
        loader: true,
        name: 'SUBMIT'
      });
      const { status } = await Service.post(process.env.REACT_APP_VENDOR_CREATE_USER, formDetails);
      if (status === 201) {
        setAlertShow({
          open: true,
          msg: 'Vendor user created successfully.',
          alertType: 'success'
        });
        setConfirmationModel('CLOSE');
        setIsOpen(false);
        setLoading({
          loader: false,
          name: ''
        });
      }
    } catch (e) {
      const { data, status } = e.response;
      let msg = '';
      if (status === 403) {
        msg = errorMessageHandler(data.error);
      } else {
        msg = errorMessageHandler(data.errors);
      }
      setConfirmationModel('CLOSE');
      setAlertShow({
        open: true,
        msg: msg || 'Vendor user creation API failed. Try again.',
        alertType: 'error'
      });
      setLoading({
        loader: false,
        name: ''
      });
    }
  };

  useEffect(() => {
    vendorListHandler();
  }, []);

  return (
    <>
      <ToastMessage
        alertShow={alertShow}
        setAlertShow={setAlertShow}
      />
      <DialogBox
        isOpen={confirmationModel !== 'CLOSE'}
        title=''
        handleClose={() => setConfirmationModel('CLOSE')}
        width='auto'
        padding='40px'
      >
        {
          message[confirmationModel]
        }

        <CenterContainerStyled flexDirection='row' padding='20px 0 0 0'>
          <LoadingButtonSecondaryPrimary
            variant='contained'
            onClick={formConfirmationHandler}
            loading={loading?.loader === true && loading?.name === 'SUBMIT'}
          >
            Yes
          </LoadingButtonSecondaryPrimary>
          <ButtonPrimary disabled={loading?.loader === true && loading?.name === 'SUBMIT'} onClick={() => setConfirmationModel('CLOSE')}>No</ButtonPrimary>
        </CenterContainerStyled>
      </DialogBox>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={navigationDetails} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      <CustomContainerStyled padding='0 !important'>
        <ToastMessage
          alertShow={alertShow}
          setAlertShow={setAlertShow}
        />
        <HeaderContainer item xs={12}>
          <HeadingMaster>
            Vendor Listing
          </HeadingMaster>
        </HeaderContainer>
        <HeaderContainer
          item
          xs={12}
          padding='0 20px 20px 20px'
        >
          <CustomForm
            width={['xs'].includes(screen) ? '100%' : ''}
          >
            <AutocompleteComponent
              options={vendorList || []}
              label='Vendor Name'
              selectValueHandler={selectValueHandler}
            />
          </CustomForm>
        </HeaderContainer>
        {
          searchDetails?.data?.length ? (
            <>
              <DialogBox
                isOpen={isOpen}
                fullScreen
                title='Add Vendor User'
                width='100%'
                handleClose={handleClose}
              >
                <ContainerStyled>

                  {
                  formConfiguration ? (
                    <FormGenerator
                      formDetails={formConfiguration}
                      formHandler={formHandler}
                    />
                  ) : (
                    <CenterContainerStyled padding='40px'>
                      <CircularProgress color='secondary' />
                    </CenterContainerStyled>
                  )
                  }
                </ContainerStyled>
              </DialogBox>
              <Grid item xs={12}>
                <TableComponent
                  rows={searchDetails?.data}
                  columns={columnFields({ viewVendorDetailsHandler, userPermission })}
                  checkboxAllowed={false}
                  clientPaginationMode
                  loading={loading?.loader && loading?.name === 'SEARCH'}
                  onPageChange={onPageChange}
                  onPageSizeChange={onPageSizeChange}
                  rowCount={searchDetails?.rowCount}
                />
              </Grid>
            </>
          ) : null
        }
      </CustomContainerStyled>
    </>
  );
};
export default VendorMaster;
