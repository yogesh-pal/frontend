export const posidexObject = (values, key) => {
  const currentTime = new Date();
  const uniquiId = currentTime.getTime().toString().slice(-10);
  const fatherNameArr = values.father_or_spouse_name.split(' ');
  let lincenseNumber = '';
  let passportNumber = '';
  let voterId = '';

  if (values.id_proof_name === 'Voter ID') {
    voterId = values.id_proof_number;
  }

  if (values.address_proof_name === 'Voter ID') {
    voterId = values.address_proof_number;
  }

  if (values.id_proof_name === 'Passport') {
    passportNumber = values.id_proof_number;
  }

  if (values.address_proof_name === 'Passport') {
    passportNumber = values.address_proof_number;
  }

  if (values.id_proof_name === 'Driving License') {
    lincenseNumber = values.id_proof_number;
  }

  if (values.address_proof_name === 'Driving License') {
    lincenseNumber = values.id_proof_number;
  }
  return {
    ASSIGN_UCIC: 'Y',
    SOURCE_APPLICATION_ID: uniquiId || '',
    SOURCE_CUSTOMER_ID: uniquiId || '',
    CUSTOMER_CATEGORY: 'I',
    MATCHING_RULE_PROFILE: '1',
    SOURCE_APPLICATION_NO: 'AP123',
    SOURCE_AUTHENTICATION_TOKEN: '100',
    SOURCE_SYSTEM_NAME: 'CGCL',
    DEMOGRAPHIC_INFORMATION: {
      AADHAR_NO: values.aadhaar_no || '',
      ACCOUNT_STATUS: '',
      CASTE: '',
      CIBIL_SCORE: '',
      CINNO: '',
      CUSTOMER_TYPE_CODE: '',
      CYC_NO: values.ckyc || '',
      DINNO: '',
      DOB: values.dob || '',
      DOI: '',
      DRIVING_LICENSE_NO: lincenseNumber || '',
      FATHER_FIRST_NAME: key === 'fatherName' ? fatherNameArr.slice(0, 1).toString() || '' : '',
      FATHER_LAST_NAME: key === 'fatherName' ? fatherNameArr.slice(1).join(' ') || '' : '',
      FIRST_NAME: values.first_name || '',
      GENDER: values.gender === 'Male' ? 0 : 1,
      GSTIN: '',
      HIGHEST_EDUCATION: values.education || '',
      LAN: '',
      LAST_NAME: values.last_name || '',
      MARTIAL_STATUS: values.marital_status || '',
      MIDDLE_NAME: values.middle_name || '',
      MOTHER_NAME: '',
      PAN_NO: values.pan_no || '',
      PASSPORT_NO: passportNumber || '',
      PRIMARY_OCCUPATION: '',
      PRODUCT: '',
      RELIGION: '',
      RESIDENCE_STATUS: '',
      SPOUSE_NAME: key === 'fatherName' ? '' : values.father_or_spouse_name || '',
      TAN_NO: '',
      TAX_ID: '',
      TITLE: '',
      UID: 0,
      VOTER_ID: voterId || ''
    },
    ADDRESS_INFORMATION: {
      ADDRESS_0: values.current_address_same_as_permanent === 'Yes' ? `${values.address_1} ${values.address_2}` || '' : `${values.current_address_1} ${values.current_address_2}` || '',
      ADDRESS_ID_0: 0,
      ADDRESS_TYPE_0: 'Permanent',
      CITY_0: values.current_address_same_as_permanent === 'Yes' ? values.city || '' : values.current_city || '',
      PINCODE_0: values.current_address_same_as_permanent === 'Yes' ? values.pincode || '' : values.current_pincode || '',
      STATE_0: values.current_address_same_as_permanent === 'Yes' ? values.state || '' : values.current_state || '',
      ADDRESS_1: `${values.address_1} ${values.address_2}`,
      ADDRESS_ID_1: 0,
      ADDRESS_TYPE_1: 'Current',
      CITY_1: values.city || '',
      PINCODE_1: values.pincode || '',
      STATE_1: values.state || '',
      ADDRESS_2: '',
      ADDRESS_ID_2: 0,
      ADDRESS_TYPE_2: 'Resident',
      CITY_2: '',
      PINCODE_2: '',
      STATE_2: '',
      ADDRESS_3: values.occupation_address === 'Yes' ? `${values.occupation_address_1} ${values.occupation_address_2}` || '' : '',
      ADDRESS_ID_3: 0,
      ADDRESS_TYPE_3: 'Employee',
      CITY_3: values.occupation_address === 'Yes' ? values.occupation_city || '' : '',
      PINCODE_3: values.occupation_address === 'Yes' ? values.occupation_pincode || '' : '',
      STATE_3: values.occupation_address === 'Yes' ? values.occupation_state || '' : '',
    },
    CONTACT_INFORMATION: {
      CUSTOMER_CONTACT_0: values.primary_mobile_number || '',
      CUSTOMER_CONTACT_1: values.secondary_mobile_number || '',
      CUSTOMER_CONTACT_TYPE_0: '',
      CUSTOMER_CONTACT_TYPE_1: '',
      CUSTOMER_LANDLINE_0: '',
      CUSTOMER_LANDLINE_1: '',
      CUSTOMER_LANDLINE_TYPE_0: '',
      CUSTOMER_LANDLINE_TYPE_1: ''
    },
    EMAIL_INFORMATION: {
      EMAIL_ID_0: values.email_id || '',
      EMAIL_ID_1: '',
      EMAIL_TYPE_0: '',
      EMAIL_TYPE_1: ''
    }
  };
};
