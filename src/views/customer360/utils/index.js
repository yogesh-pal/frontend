import { SERVICEURL } from '../../../constants';
import { Service } from '../../../service';

export const panAadharLinkStatus = async (payload, setAlertShow) => {
  const panAadhardata = await Service.post(`${SERVICEURL.CUSTOMER.VALIDATE_PAN_AADHAR_LINK}`, payload);
  const {
    statusCode,
    result
  } = panAadhardata.data.data.data;
  if (statusCode === 101 && result?.linked === true) {
    setAlertShow({
      open: true,
      msg: result?.message,
      alertType: 'success'
    });
    return { status: 'VALID' };
  }
  setAlertShow({
    open: true,
    msg: result?.message || 'Invalid Input',
    alertType: 'error'
  });
  return { status: 'INVALID', panCustomerNumber: '' };
};

export const checkPanValidity = async (values, bodyDetails, setAlertShow) => {
  const pancardObj = {};
  bodyDetails.forEach((item) => {
    pancardObj.number = values[item];
  });
  pancardObj.type = 'pan';
  // const res = await existingCheckHandler('pan_no', pancardObj?.number);
  // if (!res?.success) {
  //   setLoader(false);
  //   return;
  // }
  const { data } = await Service.post(`${process.env.REACT_APP_VALIDATE_PAN_DOCUMENT}`, pancardObj);
  if (data?.data?.status?.toUpperCase() === 'VALID') {
    return (data.data);
  }
  setAlertShow({
    open: true,
    msg: 'Invalid pancard number.',
    alertType: 'error'
  });
  return ({ status: 'INVALID', panCustomerNumber: '' });
};

export const customerConfigHandler = async () => {
  const config = {
    ocr: false,
    biometric: false,
    aadhaarPanlinking: false,
    aml: false,
    offline: false,
    liveliness: {
      default: {
        stop: false,
        retry_count: 5
      }
    }
  };
  try {
    const { data } = await Service.get(SERVICEURL.CUSTOMER.CUSTOMERCONFIGDETAILS);
    config.ocr = data?.ekyc?.ocr?.enable;
    config.biometric = data?.ekyc?.biometric?.enable;
    config.aadhaarPanlinking = data?.pan_aadhaar_link?.enable;
    config.aml = data?.aml?.enable;
    config.offline = data?.ekyc?.offline?.enable;
    config.liveliness = data?.liveliness;
    return config;
  } catch (e) {
    console.log('Error', e);
    return config;
  }
};

export const occupationMapping = {
  'Self Employed': 'annual_income_self_salaried',
  Salaried: 'annual_income_salaried',
  Agriculturist: 'annual_income_agriculturist',
  Homemaker: 'annual_income_homemaker',
  Student: 'annual_income_student',
  Unemployed: 'annual_income_unemployed',
};

export const getAnnualIncome = (fD) => {
  const { customer_occupation: occupation } = fD;
  return fD?.[occupationMapping?.[occupation]];
};
