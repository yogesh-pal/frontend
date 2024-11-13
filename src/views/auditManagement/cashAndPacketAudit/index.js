/* eslint-disable camelcase */
import React, { useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import Box from '@mui/material/Box';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useNavigate } from 'react-router-dom';
import { DashboardTiles, MenuNavigation } from '../../../components';
import { NAVIGATION, ROUTENAME, MODULE_PERMISSION } from '../../../constants';
import { checkUserPermission } from '../../../utils';
import { useScreenSize } from '../../../customHooks';
import { BreadcrumbsWrapperContainerStyled, BreadcrumbsContainerStyled } from '../../../components/styledComponents';

const CustomBox = styled(Box)`
display: flex;
flex-wrap: wrap;
justify-content: center;
`;

const CashAndPacketAudit = () => {
  const [tabData, setTabData] = useState([]);
  const navigate = useNavigate();
  const screen = useScreenSize();
  const handleClick = (route) => {
    if (route) {
      navigate(route);
    }
  };

  const cashAndPacketnavigationDetails = useMemo(() => [
    { name: 'Dashboard', url: NAVIGATION.dashboard },
    { name: 'Audit Management', url: NAVIGATION.auditManagement },
    { name: 'Cash And Packet Audit', url: NAVIGATION.CashAndPacketAudit },
  ], [NAVIGATION]);

  useEffect(() => {
    const tilesToShow = [];
    if (checkUserPermission(MODULE_PERMISSION.cashAudit)) {
      tilesToShow.push({ name: 'Cash Audit', route: ROUTENAME.cashAudit, icon: <AssignmentIcon /> });
    }
    if (checkUserPermission(MODULE_PERMISSION.packetAudit)) {
      tilesToShow.push({ name: 'Packet Audit', route: ROUTENAME.packetAudit, icon: <AssignmentIcon /> });
    }
    setTabData(tilesToShow);
  }, []);

  return (
    <>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={cashAndPacketnavigationDetails} />
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

export default CashAndPacketAudit;
