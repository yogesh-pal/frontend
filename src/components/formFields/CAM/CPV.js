/* eslint-disable no-nested-ternary */
import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Grid } from '@mui/material';
import BoxFormat from './BoxFormat';
import { Service } from '../../../service';
import CustomToaster from '../../mesaageToaster';
import PageLoader from '../../PageLoader';

const CustomP = styled.p`
padding: 4px 0;
margin: 0;
text-decoration: underline;
cursor: pointer;
color: #502A74;
`;

const CPV = ({ camData }) => {
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [loading, setLoading] = useState(false);

  const fileHandler = async (docPath) => {
    try {
      setLoading(true);
      const { data } = await Service.getAPI(`${process.env.REACT_APP_GET_S3_URL}?module=GOLD&doc=${docPath}`);
      const base64URL = data?.data?.full_path;
      const fileURL = `/file-preview?url=${btoa(base64URL)}&type=${btoa('image/jpeg')}`;
      window.open(fileURL, '_blank');
    } catch (err) {
      setAlertShow({
        open: true,
        msg: 'Something went wrong while fetching S3 URL. Please try again.',
        alertType: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  const atagProvider = (ele) => (
    <CustomP onClick={() => fileHandler(ele.path)}>
      {ele.label}
    </CustomP>
  );
  const customerData = [
    {
      label: 'Customer Name',
      value: camData?.customer_name || 'N/A',
      style: { xs: 12, md: 6 }
    },
    {
      label: 'Customer ID',
      value: camData?.customer_id || 'N/A',
      style: { xs: 12, md: 6 }
    },
    {
      label: 'Permanent Address',
      value: camData?.permanent_add || 'N/A',
      style: { xs: 12 }
    },
    {
      label: 'Current Address',
      value: camData?.curr_add || 'N/A',
      style: { xs: 12 }
    },
    {
      label: 'Occupation Address',
      value: camData?.occ_add || 'N/A',
      style: { xs: 12 }
    },
    {
      label: 'Is the Customer Address same as Current address/occupation address',
      value: camData.is_add_same ? 'Yes' : 'No',
      style: { xs: 12, md: 6 }
    },
    {
      label: 'CPV Remarks',
      value: camData?.cpv_remark || 'N/A',
      style: { xs: 12, md: 6 }
    },
    {
      label: 'Visit Remarks',
      value: camData?.visit_remarks || 'N/A',
      style: { xs: 12 }
    },
  ];
  const hourseImages = [
    {
      value: camData.house_url,
      func: atagProvider,
      style: { xs: 12 }
    }
  ];
  const customerImages = [
    {
      value: camData.customer_pic,
      func: atagProvider,
      style: { xs: 12 }
    }
  ];
  const surveyorImages = [
    {
      value: camData.surveyor_pic,
      func: atagProvider,
      style: { xs: 12 }
    }
  ];
  return (
    <>
      <CustomToaster
        alertShow={alertShow}
        setAlertShow={setAlertShow}
      />
      {loading && <PageLoader />}
      <div>
        <Grid container className='border-div parent'>
          <BoxFormat header='Customer Details' data={customerData} />
          <BoxFormat header='House/Locality Images' data={hourseImages} />
          <BoxFormat header='Customer Images' data={customerImages} />
          <BoxFormat header='Surveyor with Customer Images' data={surveyorImages} />
        </Grid>
      </div>
    </>

  );
};

export default CPV;
