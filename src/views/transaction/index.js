/* eslint-disable max-len */
import styled from '@emotion/styled';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import TransferWithinAStationIcon from '@mui/icons-material/TransferWithinAStation';
import {
  ROUTENAME, NAVIGATION, MODULE_PERMISSION, PERMISSION
} from '../../constants';
import { DashboardTiles, MenuNavigation } from '../../components';
import { BreadcrumbsWrapperContainerStyled, BreadcrumbsContainerStyled } from '../../components/styledComponents';
import { checkUserPermission } from '../../utils';

const CustomBox = styled(Box)`
display: flex;
flex-wrap: wrap;
justify-content: center;
`;
const tabData = [
  {
    name: 'Branch Transaction',
    route: ROUTENAME.branchTransaction,
    icon: <TransferWithinAStationIcon />,
    permission: [
      MODULE_PERMISSION.deputation,
      MODULE_PERMISSION.cashAndPacket
    ]
  },
  {
    name: 'Customer Transaction',
    route: ROUTENAME.customerTransaction,
    icon: <TransferWithinAStationIcon />,
    permission: [
      [PERMISSION.receiptView, PERMISSION.receiptMaker],
      [PERMISSION.receiptView, PERMISSION.receiptChecker],
      [PERMISSION.collateralView, PERMISSION.collateralMaker],
      [PERMISSION.collateralView, PERMISSION.collateralChecker],
      MODULE_PERMISSION.partRelease,
      MODULE_PERMISSION.onlinePayment,
      [PERMISSION.eCollectInvoiceCreate]
    ]
  },
];

const Transaction = () => {
  const navigate = useNavigate();
  const navigationDetails = [
    { name: 'Dashboard', url: NAVIGATION.dashboard },
    { name: 'Transaction', url: NAVIGATION.transaction }
  ];
  const handleClick = (route) => {
    if (route) {
      navigate(route);
    }
  };
  return (
    <>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={navigationDetails} />
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
export default Transaction;
