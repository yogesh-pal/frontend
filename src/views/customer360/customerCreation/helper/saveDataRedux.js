const saveCustomerDetailsRedux = (dispatch, saveFormData, customerInfo, data) => {
  const dataToSaveInRedux = {};
  dataToSaveInRedux.first_name = customerInfo?.first_name;
  dataToSaveInRedux.middle_name = customerInfo?.middle_name;
  dataToSaveInRedux.last_name = customerInfo?.last_name;
  if (customerInfo?.middle_name) {
    dataToSaveInRedux.full_name = `${customerInfo?.first_name} ${customerInfo?.middle_name} ${customerInfo?.last_name}`;
  } else if (customerInfo?.first_name) {
    dataToSaveInRedux.full_name = `${customerInfo?.first_name} ${customerInfo?.last_name}`;
  }
  dataToSaveInRedux.customer_id = data?.data?.customer_id;
  dataToSaveInRedux.dob = customerInfo?.dob;
  dataToSaveInRedux.primary_mobile_number = customerInfo?.primary_mobile_number;
  dataToSaveInRedux.customer_pan_no = customerInfo?.pan_no;
  dataToSaveInRedux.total_loan = 0;
  dataToSaveInRedux.active_loans = 0;
  dataToSaveInRedux.closed_loans = 0;
  dataToSaveInRedux.total_pos = 0;
  dataToSaveInRedux.total_interest_overdue = 0;
  dataToSaveInRedux.npa_status = 0;
  dataToSaveInRedux.count_of_default_account = 0;
  dataToSaveInRedux.count_of_npa_account = 0;
  dataToSaveInRedux.count_of_auctioned_account = 0;
  dataToSaveInRedux.count_of_spurious_account = 0;
  dataToSaveInRedux.lien_status = 'No';
  dataToSaveInRedux.legal_status = 'No';
  dataToSaveInRedux.loan_detail = [];
  dataToSaveInRedux.total_disbursed_amount = 0;
  dataToSaveInRedux.activeLoanAccounts = [{ label: 'No Active Loan', value: null, disabled: true }];
  dataToSaveInRedux.cust_dt = null;
  dataToSaveInRedux.customerFullDetails = {
    id_proof_name: customerInfo?.id_proof_name,
    id_proof_number: customerInfo?.id_proof_number,
    address_proof_name: customerInfo?.address_proof_name,
    address_proof_number: customerInfo?.address_proof_number,
    address_1: customerInfo?.address_1,
    address_2: customerInfo?.address_2,
    pincode: customerInfo?.pincode,
    state: customerInfo?.state,
    city: customerInfo?.city,
    occupation_address_1: customerInfo?.occupation_address_1,
    occupation_address_2: customerInfo?.occupation_address_1,
    occupation_pincode: customerInfo?.occupation_pincode,
    occupation_city: customerInfo?.occupation_city,
    occupation_state: customerInfo?.occupation_state,
    aadhaar_no: customerInfo?.aadhaar_no,
    aadhaar_osv_done: customerInfo?.aadhaar_osv_done,
    pan_no: customerInfo?.pan_no,
    id_proof_osv_done: customerInfo?.id_proof_osv_done,
    address_proof_osv_done: customerInfo?.address_proof_osv_done,
    education: customerInfo?.education,
    no_years_current_residence: customerInfo?.no_years_current_residence,
    primary_mobile_number: customerInfo?.primary_mobile_number,
    secondary_mobile_number: customerInfo?.secondary_mobile_number,
    email_id: customerInfo?.email_id,
    marital_status: customerInfo?.marital_status,
    gender: customerInfo?.gender,
    customer_occupation: customerInfo?.customer_occupation,
    annual_income: customerInfo?.annual_income,
    occupation_address: customerInfo?.occupation_address,
    psl_status: customerInfo?.psl_status,
    psl_category: customerInfo?.psl_category,
    nominee_relationship: customerInfo?.nominee_relationship,
    nominee_name: customerInfo?.nominee_name,
    nominee_mobile: customerInfo?.nominee_mobile,
    nominee_dob: customerInfo?.nominee_dob,
    risk_rating: customerInfo?.risk_rating,
    id_proof_url: customerInfo?.id_proof_url,
    address_proof_url: customerInfo?.address_proof_url,
    pan_url: customerInfo?.pan_url,
  };
  dispatch(saveFormData(dataToSaveInRedux));
};

export {
  saveCustomerDetailsRedux
};
