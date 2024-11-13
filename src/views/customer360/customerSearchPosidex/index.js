/* eslint-disable no-unused-vars */
import { useMemo, useState } from 'react';
import { Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import {
  useSelector
} from 'react-redux';
import FormGenerator from '../../../components/formGenerator';
import {
  HeaderSearchContainer,
  HeadingSearch,
  BreadcrumbsWrapperContainerStyled,
  BreadcrumbsContainerStyled,
  CustomContainerStyled,
  ButtonPrimary
} from '../../../components/styledComponents';
import {
  IDENTIFIER,
  REGEX,
  NAVIGATION
} from '../../../constants';
import { Service } from '../../../service';
import {
  MenuNavigation,
  TableComponent,
  ToastMessage
} from '../../../components';
import { columnFields } from './helper';

const CustomerSearchPosidex = () => {
  const [isDedupeDone, setIsDedupeDone] = useState(false);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [searchDetails, setSearchDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const userDetails = useSelector((state) => state.user.userDetails);
  const navigate = useNavigate();
  const navigationDetails = useMemo(() => [
    {
      name: 'Dashboard',
      url: NAVIGATION.dashboard
    },
    {
      name: 'Customer 360',
      url: NAVIGATION.customerDashboard
    },
    {
      name: 'Customer Search',
      url: NAVIGATION.customerSearch
    },
    {
      name: 'Customer Dedupe',
      url: NAVIGATION.customerSearchPosidex
    }
  ], [NAVIGATION]);
  const formConfiguration = {
    form: [
      {
        title: '',
        variant: 'outlined',
        input: [
          {
            name: 'firstName',
            label: 'First Name',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            validation: {
              isRequired: true,
              requiredMsg: 'Please enter first name',
              pattern: REGEX.SPACESTARTEND,
              patternMsg: 'Please enter valid first name',
              maxLength: 50,
              maxLenMsg: 'First name should not more than 50 characters.',
            },
          },
          {
            name: 'lastName',
            label: 'Last Name',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            validation: {
              isRequired: true,
              requiredMsg: 'Please enter last name',
              pattern: REGEX.SPACESTARTEND,
              patternMsg: 'Please enter valid last name',
              maxLength: 50,
              maxLenMsg: 'Last name should not more than 50 characters.',
            },
          },
          {
            name: 'fatherName',
            label: 'Father Name',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            validation: {
              isRequired: true,
              requiredMsg: 'Please enter father name',
              pattern: REGEX.SPACESTARTEND,
              patternMsg: 'Please enter valid father name',
              maxLength: 150,
              maxLenMsg: 'Father name should not more than 150 characters.',
            },
          },
          {
            name: 'dob',
            label: 'DOB',
            type: 'date',
            identifier: IDENTIFIER.DATEPICKER,
            validation: {
              isRequired: true,
              requiredMsg: 'Please choose date of birth'
            },
            isFutureDateDisable: true,
            isPastDateDisable: false,
            readonly: true,
            greaterDateDisable: moment().subtract(18, 'years'),
            lesserDateDisable: moment().subtract(80, 'years'),
            disableYears: (currentDate) => moment().diff(moment(currentDate), 'years') > 80 || moment().diff(moment(currentDate), 'years') < 18,
            format: 'MM-DD-YYYY',
          },
          {
            name: 'pan',
            label: 'PAN',
            type: 'text',
            isUpperCase: true,
            identifier: IDENTIFIER.INPUTTEXT,
            validation: {
              pattern: REGEX.PANCARD,
              patternMsg: 'Please enter valid pan number',
              maxLength: 10,
              maxLenMsg: 'PAN card number should not more than 10 characters.',
            },
          },
          {
            name: 'mobileNumber',
            label: 'Mobile No.',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            validation: {
              isRequired: true,
              requiredMsg: 'Please enter mobile number',
              pattern: REGEX.MOBILENUMBER,
              patternMsg: 'Please enter valid mobile number',
              maxLength: 10,
              maxLenMsg: 'Mobile number should not be more than 10 digits.',
            },
          },
        ],
        buttonDetails: {
          name: 'Customer De-dupe',
          type: 'submit',
          nameReset: 'Reset',
          resetDetails: {
            firstName: null,
            lastName: null,
            fatherName: null,
            dob: null,
            pan: null,
            mobileNumber: null,
          }
        },
        alignment: {
          xs: 12,
          sm: 12,
          md: 6,
          lg: 4,
          xl: 4
        }
      }
    ],
    dataFomat: 'SINGLE'
  };

  const formHandler = async (formValues) => {
    try {
      setIsLoading(true);
      const currentTime = new Date();
      const uniquiId = currentTime.getTime().toString().slice(-10);
      const fatherNameArr = formValues.fatherName.split(' ');
      const { data } = await Service.post(process.env.REACT_APP_SEARCH_POSIDEX, {
        ASSIGN_UCIC: 'N',
        SOURCE_APPLICATION_ID: uniquiId,
        SOURCE_CUSTOMER_ID: uniquiId,
        DEMOGRAPHIC_INFORMATION: {
          DOB: moment(formValues?.dob).format('DD-MM-YYYY'),
          FATHER_FIRST_NAME: fatherNameArr.slice(0, 1).toString(),
          FATHER_LAST_NAME: fatherNameArr.slice(1).join(' '),
          FIRST_NAME: formValues?.firstName,
          LAST_NAME: formValues?.lastName,
          PAN_NO: formValues?.pan,
          MIDDLE_NAME: '',
          AADHAR_NO: '',
          ACCOUNT_STATUS: '',
          CASTE: '',
          CIBIL_SCORE: '',
          CINNO: '',
          CUSTOMER_TYPE_CODE: '',
          CYC_NO: '',
          DINNO: '',
          DOI: '',
          DRIVING_LICENSE_NO: '',
          GENDER: '',
          GSTIN: '',
          HIGHEST_EDUCATION: '',
          LAN: '',
          MARTIAL_STATUS: '',
          MOTHER_NAME: '',
          PASSPORT_NO: '',
          PRIMARY_OCCUPATION: '',
          PRODUCT: '',
          RELIGION: '',
          RESIDENCE_STATUS: '',
          SPOUSE_NAME: '',
          TAN_NO: '',
          TAX_ID: '',
          TITLE: '',
          UID: 1,
          VOTER_ID: ''
        },
        CONTACT_INFORMATION: {
          CUSTOMER_CONTACT_0: formValues?.mobileNumber,
          CUSTOMER_CONTACT_1: '',
          CUSTOMER_CONTACT_TYPE_0: '',
          CUSTOMER_CONTACT_TYPE_1: '',
          CUSTOMER_LANDLINE_0: '',
          CUSTOMER_LANDLINE_1: '',
          CUSTOMER_LANDLINE_TYPE_0: '',
          CUSTOMER_LANDLINE_TYPE_1: ''
        },
      });

      if (data?.STATUS.toUpperCase() === 'FAILURE') {
        setAlertShow({
          alertType: 'error',
          open: true,
          msg: data.DESCRIPTION
        });
        setIsLoading(false);
        setIsDedupeDone(true);
        return;
      }

      const customerDetails = [];
      data.CUSTOMER_MATCHES.forEach((item, index) => customerDetails.push({
        _id: index,
        ...item,
        match: 'POSITIVE',
        CITY: item?.CITY_0 ?? 'NA',
        DOB: item?.DOB && moment(item.DOB, 'YYYY-MM-DD').format('DD/MM/YYYY'),
        selected: false
      }));

      data.NEGATIVE_MATCHES.forEach((item) => {
        const name = item.CUSTOMER_NAME.split(' ');
        customerDetails.push({
          _id: customerDetails.length + 1,
          ...item,
          FIRST_NAME: name.length && name[0],
          LAST_NAME: name.length > 1 && name.slice(1).join(' '),
          CITY: 'NA',
          match: 'NEGATIVE',
          DOB: item?.DOB && moment(item.DOB, 'YYYY-MM-DD').format('DD/MM/YYYY'),
          selected: false
        });
      });
      if (!customerDetails.length) {
        setAlertShow({
          alertType: 'error',
          open: true,
          msg: 'Customer De-dupe Not Found.'
        });
        setIsDedupeDone(true);
      }
      if (customerDetails.length && userDetails?.branchCodes.length === 1) {
        customerDetails.push({
          _id: customerDetails.length + 1,
          FIRST_NAME: 'Create New Customer',
          selected: false
        });
      }

      setSearchDetails(customerDetails);
      setIsLoading(false);
    } catch (e) {
      setAlertShow({
        alertType: 'error',
        open: true,
        msg: 'Customer Not Found.'
      });
      setIsLoading(false);
      setIsDedupeDone(true);
      console.log('Error', e);
    }
  };

  const handleCellClick = (field, row) => {
    try {
      if (row.match === 'NEGATIVE') {
        setAlertShow({
          alertType: 'error',
          open: true,
          msg: 'Please contact admin to proceed further'
        });
        return;
      }
      const updatedCustomerDeatils = [...searchDetails];
      updatedCustomerDeatils.forEach((ele) => { ele.selected = false; });
      setSearchDetails(updatedCustomerDeatils);
      row.selected = true;
    } catch (e) {
      console.log('Error', e);
    }
  };

  const onProceedButtonClick = () => {
    const selectedRow = searchDetails.filter((ele) => ele.selected);
    if (selectedRow.length) {
      if (selectedRow[0]?.UCIC) {
        navigate(`${NAVIGATION.customerCreation}/${selectedRow[0].UCIC}`);
        return;
      }
      navigate(NAVIGATION.customerCreation);
    } else {
      setAlertShow({ alertType: 'error', open: true, msg: 'Please select one customer to proceed' });
    }
  };

  return (
    <>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={navigationDetails} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      <ToastMessage
        setAlertShow={setAlertShow}
        alertShow={alertShow}
      />
      <CustomContainerStyled padding='0 !important'>
        <HeaderSearchContainer item xs={12} padding='20px 40px 0px 20px'>
          <HeadingSearch>
            Customer Dedupe
          </HeadingSearch>
          {
            userDetails?.branchCodes?.length === 1 && isDedupeDone
              ? (
                <ButtonPrimary
                  onClick={() => navigate(NAVIGATION.customerCreation)}
                >
                  Create Customer
                </ButtonPrimary>
              ) : null
          }
        </HeaderSearchContainer>
        <FormGenerator
          isLoading={isLoading}
          formDetails={formConfiguration}
          formHandler={formHandler}
        />
        {
          searchDetails.length > 0 && (
            <>
              <TableComponent
                cursor='pointer'
                clientPaginationMode
                rows={searchDetails}
                columns={columnFields}
                checkboxAllowed={false}
                loading={false}
                rowCount={searchDetails.length}
                handleCellClick={handleCellClick}
              />
              <Grid item xs={12} display='flex' justifyContent='center' padding='10px 0px'>
                <ButtonPrimary onClick={onProceedButtonClick}>
                  Proceed
                </ButtonPrimary>
              </Grid>
            </>
          )
        }
      </CustomContainerStyled>
    </>
  );
};

export default CustomerSearchPosidex;
