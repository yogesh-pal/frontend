/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Service } from '../../service';
import PageLoader from '../../components/PageLoader';
import CustomToaster from '../../components/mesaageToaster';

const LeadershipDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });

  const navigate = useNavigate();

  const getLeadershipUrl = async () => {
    try {
      setIsLoading(true);
      const { data } = await Service.get(process.env.REACT_APP_DASHBOARD_REDIRECT);
      console.log('data is', data);
      if (data?.url) {
        window.open(data.url, '_blank');
        navigate('/dashboard');
      } else {
        setAlertShow({
          open: true,
          msg: data?.message || 'Unable to open the website at the moment',
          alertType: 'error'
        });
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (e) {
      console.log('error is', e?.response?.data);
      setAlertShow({
        open: true,
        msg: 'Something went wrong',
        alertType: 'error'
      });
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getLeadershipUrl();
  }, []);
  return (
    <>
      <CustomToaster
        alertShow={alertShow}
        setAlertShow={setAlertShow}
      />
      {isLoading
        ? (
          <PageLoader />
        )
        : <div> </div>}
    </>
  );
};
export default LeadershipDashboard;
