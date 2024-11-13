/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import { CircularProgress } from '@mui/material';
import { ToastMessage, FormGenerator } from '../../../../components';
import { CenterContainerStyled } from '../../../../components/styledComponents';
import { detailsCorrectFormConfig, CustomText } from '../../helper';

const DetailsCorrectModal = ({ data, source, areDetailsSubmitHandler }) => {
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [formConfig, setFormConfig] = useState(detailsCorrectFormConfig(data));

  return (
    <>
      <ToastMessage
        alertShow={alertShow}
        setAlertShow={setAlertShow}
      />
      {formConfig ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '10px' }}>
            <CustomText>Collateral Photo</CustomText>
            {
              data?.item_pic ? (
                <a
                  href={`/file-viewer?path=${btoa(data?.item_pic)}&source=${source}`}
                  target='_blank'
                  rel='noreferrer'
                  style={{ color: '#502A74', paddingLeft: '20px' }}
                >
                  View
                </a>
              ) : 'NA'
            }
          </div>
          <FormGenerator
            formDetails={formConfig}
            setFormDetails={setFormConfig}
            formHandler={areDetailsSubmitHandler}
            alertShow={alertShow}
            setAlertShow={setAlertShow}
            isLoading={false}
          />
        </>
      ) : (
        <CenterContainerStyled padding='40px'>
          <CircularProgress color='secondary' />
        </CenterContainerStyled>
      )}
    </>
  );
};
export default React.memo(DetailsCorrectModal);
