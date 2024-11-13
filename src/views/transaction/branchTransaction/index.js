/* eslint-disable max-len */
import styled from '@emotion/styled';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import TransferWithinAStationIcon from '@mui/icons-material/TransferWithinAStation';
import { MODULE_PERMISSION, ROUTENAME } from '../../../constants';
import { DashboardTiles, MenuNavigation } from '../../../components';
import { BreadcrumbsWrapperContainerStyled, BreadcrumbsContainerStyled } from '../../../components/styledComponents';
import { branchTransactionNavigation } from '../helper';
import { checkUserPermission } from '../../../utils';

const CustomBox = styled(Box)`
display: flex;
flex-wrap: wrap;
justify-content: center;
`;
const tabData = [
  {
    name: 'Deputation',
    route: ROUTENAME.deputation,
    icon: <TransferWithinAStationIcon />,
    permission: [
      MODULE_PERMISSION.deputation
    ]
  },
  {
    name: 'Cash & Packet Management',
    route: ROUTENAME.cashAndPacketManagement,
    icon: <TransferWithinAStationIcon />,
    permission: [
      MODULE_PERMISSION.cashAndPacket
    ]
  }
];

const BranchTransaction = () => {
  const navigate = useNavigate();
  const handleClick = (route) => {
    if (route) {
      navigate(route);
    }
  };
  return (
    <>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={branchTransactionNavigation} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      <CustomBox>
        {tabData.map((tab) => {
          if (tab.permission.length && Array.isArray(tab.permission[0]) && tab.permission.some((ele) => checkUserPermission(ele))) {
            return <DashboardTiles key={tab.name} tab={tab} handleClick={handleClick} />;
          }
          return null;
        })}
      </CustomBox>
    </>
  );
};
export default BranchTransaction;
