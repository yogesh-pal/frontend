/* eslint-disable max-len */
import styled from '@emotion/styled';
import Box from '@mui/material/Box';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useNavigate } from 'react-router-dom';
import DescriptionIcon from '@mui/icons-material/Description';
import { ROUTENAME, PERMISSION, MODULE_PERMISSION } from '../../../constants';
import { DashboardTiles, MenuNavigation } from '../../../components';
import { customerTransactionNavigation } from '../helper';
import { BreadcrumbsWrapperContainerStyled, BreadcrumbsContainerStyled } from '../../../components/styledComponents';
import { checkUserPermission } from '../../../utils';
import { Service } from '../../../service';

const CustomBox = styled(Box)`
display: flex;
flex-wrap: wrap;
justify-content: center;
`;
const tabData = [
  {
    name: 'Customer Cash Deposit',
    route: ROUTENAME.receiptMaker,
    icon: <DescriptionIcon />,
    permission: [
      [PERMISSION.receiptView, PERMISSION.receiptMaker]
    ]
  },
  {
    name: 'Collateral Release',
    route: ROUTENAME.collateralRelease,
    icon: <DescriptionIcon />,
    permission: [
      [PERMISSION.collateralView, PERMISSION.collateralMaker],
      [PERMISSION.collateralView, PERMISSION.collateralChecker]
    ]
  },
  {
    name: 'Part Release',
    route: ROUTENAME.partRelease,
    icon: <DescriptionIcon />,
    permission: [
      MODULE_PERMISSION.partRelease
    ]
  },
  {
    name: 'Online Payment',
    route: ROUTENAME.onlinePayment,
    icon: <CurrencyRupeeIcon />,
    permission: [
      MODULE_PERMISSION.onlinePayment
    ]
  },
  {
    name: 'Generate E-Collect Invoice',
    route: ROUTENAME.generateECollectInvoice,
    icon: <AccountBalanceIcon />,
    permission: [
      [PERMISSION.eCollectInvoiceCreate]
    ]
  }
];

const fetchOnlinePaymentToken = async () => {
  try {
    const URL = `${process.env.REACT_APP_FLEXCUBE_INITIATE_PAYMENT_TOKEN}`;
    const { data, status } = await Service.get(URL);
    if (data?.success && status === 200 && data?.data) {
      return data?.data?.token;
    }
    console.error('Error generating payment token. Unexpected Response');
  } catch (err) {
    console.error('Error generating payment token:', err);
  }
};

const CustomerTransaction = () => {
  const navigate = useNavigate();
  const handleClick = async (route) => {
    if (route) {
      if (route === ROUTENAME.onlinePayment) {
        const onlinePaymentToken = await fetchOnlinePaymentToken();
        route += `?token=${onlinePaymentToken}`;
        localStorage.setItem('onlinePaymentToken', onlinePaymentToken);
      }
      navigate(route);
    }
  };
  return (
    <>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={customerTransactionNavigation} />
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
export default CustomerTransaction;
