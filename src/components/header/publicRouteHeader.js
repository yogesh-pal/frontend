/* eslint-disable max-len */
import React from 'react';
import styled from '@emotion/styled';
import capriLogo from '../../assets/CGCL_logo.png';
import shivalikLogo from '../../assets/shivalik_logo.png';

const WrapperRow = styled.div(({ colender }) => ({
  height: '120px',
  width: '100%',
  position: 'sticky',
  top: 0,
  zIndex: 50,
  backgroundColor: '#ffffff',
  boxShadow: '0 2px 10px -1px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  justifyContent: colender === 'SHIVALIK' ? 'space-between' : 'end',
  alignItems: 'center',
}));

const ImageContainer = styled.img`
  width: 40%;
`;

const CustomDiv = styled.div`
 margin-left: 10px;
 font-family: "Roboto","Helvetica","Arial","sans-serif";
`;

const CustomDiv2 = styled.div`
 display: flex;
 justify-content: end;
`;

const PublicRouteHeader = ({ colender = 'CAPRI' }) => (
  <WrapperRow colender={colender}>
    {
        colender === 'SHIVALIK' ? (
          <CustomDiv>
            <ImageContainer
              src={shivalikLogo}
              alt=''
            />
            <div>
              Registered office at 501, Salcon Aurum, Jasola District Centre, New Delhi, South Delhi -110 025.
              <br />
              GST No: 09ABDCS9427Q1ZF ; CIN: U65900DL2020PLC 366 027 www.shivalikbank.com
            </div>
          </CustomDiv>
        ) : null
      }
    <CustomDiv>
      <CustomDiv2>
        <img
          src={capriLogo}
          alt=''
          style={{ width: '70%' }}
        />
      </CustomDiv2>
      {colender === 'SHIVALIK' ? <div>Serviced by Capri(Under BC Arrangement)</div> : null }
    </CustomDiv>
  </WrapperRow>
);
export default PublicRouteHeader;
