/* eslint-disable max-len */
/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import Box from '@mui/material/Box';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import FaceIcon from '@mui/icons-material/Face';
import { useNavigate } from 'react-router-dom';
import { DashboardTiles, MenuNavigation } from '../../components';
import { checkUserPermission } from '../../utils';
import { ROUTENAME, MODULE_PERMISSION } from '../../constants';
import { useScreenSize } from '../../customHooks';
import { auditDashboardNavigation } from './helper';
import { BreadcrumbsWrapperContainerStyled, BreadcrumbsContainerStyled } from '../../components/styledComponents';

const CustomBox = styled(Box)`
display: flex;
flex-wrap: wrap;
justify-content: center;
`;

const AuditManagement = () => {
  const [tabData, setTabData] = useState([]);
  const navigate = useNavigate();
  const screen = useScreenSize();
  const handleClick = (route) => {
    if (route) {
      navigate(route);
    }
  };

  useEffect(() => {
    const tilesToShow = [];
    if (checkUserPermission(MODULE_PERMISSION.auditAssignment) || checkUserPermission(MODULE_PERMISSION.auditCase)) {
      tilesToShow.push({ name: 'Gold Audit', route: ROUTENAME.goldAudit, icon: <PersonAddIcon /> });
    }
    if (checkUserPermission(MODULE_PERMISSION.processAudit)) {
      tilesToShow.push({ name: 'Process Audit', route: ROUTENAME.processAudit, icon: <AssignmentIcon /> });
    }
    if (checkUserPermission(MODULE_PERMISSION.vendorUser)) {
      tilesToShow.push({ name: 'Vendor', route: ROUTENAME.vendor, icon: <FaceIcon /> });
    }
    if (checkUserPermission(MODULE_PERMISSION.cashAudit || MODULE_PERMISSION.packetAudit)) {
      tilesToShow.push({ name: 'Cash And Packet Audit', route: ROUTENAME.cashAndPacketAudit, icon: <ManageAccountsIcon /> });
    }
    setTabData(tilesToShow);
  }, []);

  return (
    <>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={auditDashboardNavigation} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      <CustomBox>
        {tabData.map((tab) => (
          <DashboardTiles key={tab?.name} tab={tab} handleClick={handleClick} fontSize={(screen === 'sm' || screen === 'xs') ? '15px' : '25px'} />
        ))}
      </CustomBox>
    </>
  );
};

export default AuditManagement;
