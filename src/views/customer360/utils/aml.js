/* eslint-disable camelcase */
import axios from 'axios';
import { Service } from '../../../service';
import { MODULE, SERVICEURL } from '../../../constants';
import {
  ID_PROOF_LIST,
  KARZAGENDER,
  AADHAARVERFICATIONMODE
} from '../customerCreation/helper/constant';

const amlPayloadHandler = (obj, unmaskedAadhar) => {
  try {
    console.log(obj);
    const payload = {
      success: true,
      first_name: '',
      middle_name: '',
      last_name: '',
      dateOfBirth: '',
      gender: '',
      aadhaarNo: null,
      panNo: null,
      voterIdNo: null,
      passportNo: null,
      vaultId: null
    };
    payload.first_name = obj?.first_name;
    payload.middle_name = obj?.middle_name;
    payload.last_name = obj?.last_name;
    payload.dateOfBirth = obj?.dob;

    if (ID_PROOF_LIST.PASSPORT === obj.id_proof_name) {
      payload.passportNo = obj.id_proof_number;
    }

    if (ID_PROOF_LIST.PASSPORT === obj.address_proof_name) {
      payload.passportNo = obj.address_proof_number;
    }

    if (ID_PROOF_LIST.VOTERID === obj.id_proof_name) {
      payload.voterIdNo = obj.id_proof_number;
    }

    if (ID_PROOF_LIST.VOTERID === obj.address_proof_name) {
      payload.voterIdNo = obj.address_proof_number;
    }

    if (obj.pan_no) {
      payload.panNo = obj.pan_no;
    }

    if (obj.gender) {
      payload.gender = KARZAGENDER[obj.gender];
    }

    if ([
      AADHAARVERFICATIONMODE.ONLINE,
      AADHAARVERFICATIONMODE.OFFLINE
    ].includes(obj?.aadhaar_verification_mode)
    ) {
      payload.aadhaarNo = unmaskedAadhar;
    } else {
      payload.vaultId = obj.aadhaar_reference_number;
    }
    return payload;
  } catch (err) {
    console.log('Error', err);
    return {
      success: false
    };
  }
};

const amlHandler = async (obj, unmaskedAadhar) => {
  try {
    const payload = amlPayloadHandler(obj, unmaskedAadhar);

    const { data } = await Service.post(SERVICEURL.CUSTOMER.CUSTOMER_AML, payload);
    const { aml_resp_details_token, message } = data?.data || {};
    return {
      isSuccess: true,
      token: aml_resp_details_token,
      message: message || 'Something went wrong!'
    };
  } catch (err) {
    console.log('Error', err);
    return {
      isSuccess: false,
      message: 'AML validation failed for the customer'
    };
  }
};

const uploadFileHandler = async (pdfPath) => {
  try {
    const { CUSTOMER } = MODULE;
    const filePath = `${CUSTOMER.name}/${CUSTOMER.details.amlReport}`;
    const fileName = 'aml.pdf';
    const res = await axios({
      method: 'get',
      url: pdfPath,
      headers: {
        'Content-Type': 'application/json',
      },
      responseType: 'arraybuffer'
    });
    const URL = `${process.env.REACT_APP_GENERATE_S3_URL}?module=GOLD&doc=${fileName}&path=${filePath}`;
    const { data } = await Service.get(URL);
    const { path, put } = data.data;

    await Service.putWithFile(put, res?.data, {
      headers: {
        'Content-Type': 'image/pdf'
      }
    });
    return {
      path,
      isSuccess: true,
      message: 'Success'
    };
  } catch (err) {
    return {
      isSuccess: false,
      message: 'Failed to upload AML pdf'
    };
  }
};

export {
  uploadFileHandler,
  amlHandler
};
