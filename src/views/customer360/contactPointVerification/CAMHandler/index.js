import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CircularProgress, Container, Alert } from '@mui/material';
import CAM from '../../../../components/formFields/CAM/CPV';
// import PublicRouteHeader from '../../../../components/header/publicRouteHeader';
import Layout from '../../../../layout/publicDashboard';
import { CenterContainerStyled } from '../../../../components/styledComponents';
import { Service } from '../../../../service';
import { addressProvider } from '../constants';

const ContainerStyled = styled(Container)(({ theme }) => ({
  boxShadow: `${theme?.boxShadow?.primary} 0px 2px 8px`,
  padding: '20px !important',
  marginTop: '20px',
  overflow: 'auto'
}));

const CamReport = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [camData, setCamData] = useState(null);
  const { custCPVId } = useParams();
  const labelProvider = (arr, label) => arr.map((ele) => ({
    label,
    path: ele
  }));

  const fetchData = async () => {
    try {
      const [custId, cpvId] = custCPVId.split('-');
      const { data } = await Service.get(`${process.env.REACT_APP_GET_CPV_DETAILS}?customer_id=${custId}&cpv_id=${cpvId}`);
      const apiRes = data.data;
      const firstName = apiRes?.first_name ?? '';
      const lastName = apiRes?.last_name ?? '';
      const customerName = `${firstName} ${lastName}`;
      const permanentAddress = addressProvider(
        apiRes.address_1,
        apiRes.address_2,
        apiRes.city,
        apiRes.state,
        apiRes.pincode
      );
      const currentAddress = addressProvider(
        apiRes.current_address_1,
        apiRes.current_address_2,

        apiRes.current_city,

        apiRes.current_state,

        apiRes.current_pincode
      );
      const occupationalAddress = addressProvider(
        apiRes.occupation_address_1,
        apiRes.occupation_address_2,

        apiRes.occupation_city,

        apiRes.occupation_state,

        apiRes.occupation_state
      );
      const dataToShow = {};
      dataToShow.customer_name = customerName;
      dataToShow.customer_id = apiRes.customer_id;
      dataToShow.permanent_add = permanentAddress;
      dataToShow.curr_add = currentAddress;
      dataToShow.occ_add = occupationalAddress;
      dataToShow.is_add_same = apiRes.is_address_confirmed;
      dataToShow.cpv_remark = apiRes.cpv_status;
      dataToShow.visit_remarks = apiRes.visit_remarks;
      dataToShow.house_url = labelProvider(apiRes.house_locality_pic, 'House-Locality Image') ?? [];
      dataToShow.customer_pic = labelProvider(apiRes.house_locality_pic, 'Customer Image') ?? [];
      dataToShow.surveyor_pic = labelProvider(apiRes.house_locality_pic, 'Surveyor with Customer Image') ?? [];
      setCamData(dataToShow);
    } catch (err) {
      console.log('Error', err);
      setError('Something went wrong while fetching CAM details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Layout>
      {/* <PublicRouteHeader /> */}
      <ContainerStyled>
        {isLoading ? (
          <CenterContainerStyled padding='40px'>
            <CircularProgress color='secondary' />
          </CenterContainerStyled>
        ) : null}
        {
            !isLoading && !error ? <CAM camData={camData} /> : null
        }
        {
         error ? (
           <CenterContainerStyled padding='40px'>
             <Alert severity='error'>{error}</Alert>
           </CenterContainerStyled>
         ) : null
        }
      </ContainerStyled>
    </Layout>
  );
};
export default CamReport;
