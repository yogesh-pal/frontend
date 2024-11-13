/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Service } from '../../../service';
import PageLoader from '../../../components/PageLoader';
import CustomToaster from '../../../components/mesaageToaster';
import { ROUTENAME, SERVICEURL } from '../../../constants';

export const GlobalAssure = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });

  const navigate = useNavigate();

  const getGlobalAssure = async () => {
    try {
      setIsLoading(true);
      const { data } = await Service.get(SERVICEURL.CIRCULAR.LEAD_GLOBAL_ASSURE);
      if (data?.success) {
        window.open(data?.data?.global_assure_url, '_blank');
        navigate(ROUTENAME.leadManagement);
      } else {
        setAlertShow({
          open: true,
          msg: data?.message || 'Unable to open the website at the moment',
          alertType: 'error'
        });
        setTimeout(() => {
          navigate(ROUTENAME.leadManagement);
        }, 1000);
      }
    } catch (e) {
      console.log('error is', e?.response?.data);
      setAlertShow({
        open: true,
        msg: e?.response?.data?.message || 'Something went wrong',
        alertType: 'error'
      });
      setTimeout(() => {
        navigate(ROUTENAME.leadManagement);
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getGlobalAssure();
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
