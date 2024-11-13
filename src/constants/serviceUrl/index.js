const COLENDER_SERVICE_URL = process.env.REACT_APP_BOB_COLENDER_SERVICE;
const CUSTOMER_SERVICE_URL = process.env.REACT_APP_CUSTOMER_SERVICE;
const CIRCULAR_SERVICE_URL = process.env.REACT_APP_BASE_URL_CIRCULAR_SERVICE;
const CONFIG_SERVICE = process.env.REACT_APP_LOS_CONFIG_SERVICE;
const ALB_BASE_URL = process.env.REACT_APP_ALB_BASE_URL;

const SERVICEURL = {
  COLENDER: {
    VALIDATEAMOUNT: `${COLENDER_SERVICE_URL}/validate_amount`
  },
  CUSTOMER: {
    UPIINITIATE: `${CUSTOMER_SERVICE_URL}/api/upi/initiate`,
    UPISTATUS: `${CUSTOMER_SERVICE_URL}/api/upi/status`,
    UPIWEBHOOKSTATUS: `${CUSTOMER_SERVICE_URL}/api/upi/webhook/status`,
    BIOMETRICINITIATE: `${CUSTOMER_SERVICE_URL}/api/ekyc/biometric`,
    BIOMETRICINITIATESTATUS: `${CUSTOMER_SERVICE_URL}/api/ekyc/biometric/status`,
    VALIDATE_PAN_AADHAR_LINK: `${CUSTOMER_SERVICE_URL}/api/pan-aadhar-link`,
    VALIDATE_AADHAR_DECODE: `${CUSTOMER_SERVICE_URL}/api/aadhar-vault-decode`,
    CUSTOMERCONFIGDETAILS: `${CONFIG_SERVICE}?key=customer_config`,
    CUSTOMERSEARCHDETAILS: `${CUSTOMER_SERVICE_URL}/api/customer/v1/search`,
    CUSTOMER_AML: `${ALB_BASE_URL}/api/customer/aml/status`
  },
  CIRCULAR: {
    METABASEREPORT: `${CIRCULAR_SERVICE_URL}/api/v1/metabase/iframeURL`,
    METABASEREPORTCONFIG: `${CONFIG_SERVICE}?key=metabase_config`,
    LEAD_SEND_OTP: `${CIRCULAR_SERVICE_URL}/api/lead/otp/send`,
    LEAD_VERIFY_OTP: `${CIRCULAR_SERVICE_URL}/api/lead/otp/verify`,
    LEAD_CREATE_LEAD: `${CIRCULAR_SERVICE_URL}/api/lead/create`,
    LEAD_BRANCHES: `${CIRCULAR_SERVICE_URL}/api/lead`,
    LEAD_DASHBOARD: `${CIRCULAR_SERVICE_URL}/api/lead/list`,
    LEAD_INSURANCE: `${CIRCULAR_SERVICE_URL}/api/v1/insurancedekho/url`,
    LEAD_UPDATE: `${CIRCULAR_SERVICE_URL}/api/lead/update`,
    LEAD_CALL_SLASH_RTC: `${CIRCULAR_SERVICE_URL}/api/slash_rtc/call_initiate`,
    LEAD_GLOBAL_ASSURE: `${CIRCULAR_SERVICE_URL}/api/v1/globalassure/url`,
    ASSIGNED_COLLECTION_LEAD: `${CIRCULAR_SERVICE_URL}/api/collection/login`
  },
  CORE: {
    OCR: `${ALB_BASE_URL}/alb/aadhaar/ocr`
  }
};

export {
  SERVICEURL
};
