/* eslint-disable max-len */
import React from 'react';
import styled from '@emotion/styled';
import Alert from '@mui/material/Alert';
import { Box } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import MarkUnreadChatAltIcon from '@mui/icons-material/MarkUnreadChatAlt';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import TransferWithinAStationIcon from '@mui/icons-material/TransferWithinAStation';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import MedicalInformationOutlinedIcon from '@mui/icons-material/MedicalInformationOutlined';
import SummarizeIcon from '@mui/icons-material/Summarize';
import PortraitOutlinedIcon from '@mui/icons-material/PortraitOutlined';
import { useNavigate } from 'react-router-dom';
import { DashboardTiles } from '../../components';
import {
  ROUTENAME, MODULE_PERMISSION, PERMISSION
} from '../../constants';
import { checkUserPermission } from '../../utils';

const CustomBox = styled(Box)`
display: flex;
flex-wrap: wrap;
justify-content: center;
`;

const CustomDivWithMargin = styled.div`
margin-top: 30px;
`;

const tabData = [
  {
    name: 'Customer 360',
    route: ROUTENAME.customerDashboard,
    icon: <AccountCircleIcon />,
    permission: [
      [PERMISSION.customerView],
      [PERMISSION.customerCreate],
      [PERMISSION.customerUpdate],
      [PERMISSION.customerMaker],
      [PERMISSION.customerChecker],
      [PERMISSION.cpvView],
      [PERMISSION.cpvUpdate],
      [PERMISSION.cpvChecker]
    ],
  },
  {
    name: 'Loan Disbursal',
    route: ROUTENAME.loanCreationList,
    icon: <AssignmentIndIcon />,
    permission: MODULE_PERMISSION.los
  },
  {
    name: 'Charge Master',
    route: ROUTENAME.chargeMaster,
    icon: <AttachMoneyIcon />,
    permission: MODULE_PERMISSION.charge
  },
  {
    name: 'Scheme Master',
    route: ROUTENAME.schemeMaster,
    icon: <ArticleOutlinedIcon />,
    permission: [MODULE_PERMISSION.scheme, [PERMISSION.schemeView]]
  },
  {
    name: 'Circulars',
    route: ROUTENAME.circulars,
    icon: <MarkUnreadChatAltIcon />,
    permission: MODULE_PERMISSION.circular
  },
  {
    name: 'Rate Master',
    route: ROUTENAME.rateMaster,
    icon: <PriceChangeIcon />,
    permission: MODULE_PERMISSION.rate
  },
  {
    name: 'User Management',
    route: ROUTENAME.userManagement,
    icon: <ManageAccountsIcon />,
    permission: [...MODULE_PERMISSION.user, ...MODULE_PERMISSION.role, ...MODULE_PERMISSION.permission]
  },
  {
    name: 'Transaction',
    route: ROUTENAME.transaction,
    icon: <TransferWithinAStationIcon />,
    permission: [
      MODULE_PERMISSION.deputation,
      MODULE_PERMISSION.cashAndPacket,
      MODULE_PERMISSION.partRelease,
      [PERMISSION.receiptView, PERMISSION.receiptMaker],
      [PERMISSION.receiptView, PERMISSION.receiptChecker],
      [PERMISSION.collateralView, PERMISSION.collateralMaker],
      [PERMISSION.collateralView, PERMISSION.collateralChecker],
      MODULE_PERMISSION.onlinePayment,
      [PERMISSION.eCollectInvoiceCreate]
    ]
  },
  {
    name: 'Audit Management',
    route: ROUTENAME.auditManagement,
    icon: <ManageAccountsIcon />,
    permission: [
      MODULE_PERMISSION.auditAssignment,
      MODULE_PERMISSION.auditCase,
      MODULE_PERMISSION.processAudit,
      MODULE_PERMISSION.vendorUser
    ]
  },
  {
    name: 'Uploader',
    route: ROUTENAME.uploader,
    icon: <FileUploadIcon />,
    permission: [MODULE_PERMISSION.bankingPartnership, MODULE_PERMISSION.rekycUploader, [PERMISSION.branchgroupingmaker], [PERMISSION.branchgroupingchecker]]
  },
  {
    name: 'Reports',
    route: ROUTENAME.reports,
    icon: <SummarizeIcon />,
    permission: MODULE_PERMISSION.metaBase
  },
  {
    name: 'Leadership Dashboard',
    route: ROUTENAME.leadershipDashboard,
    icon: <SummarizeIcon />,
    permission: MODULE_PERMISSION.leadershipDashboard
  },
  {
    name: 'Cross Sell',
    route: ROUTENAME.leadManagement,
    icon: <PortraitOutlinedIcon />,
    permission: [[PERMISSION.leadView], [PERMISSION.leadCreate], [PERMISSION.insuranceView]]
  },
  {
    name: 'Assigned Collection Leads',
    route: ROUTENAME.assignedCollectionLead,
    icon: <MedicalInformationOutlinedIcon />,
    permission: MODULE_PERMISSION.assignedCollectionLead
  },
];
const index = () => {
  const navigate = useNavigate();
  let isDoNotHaveAnyPermission = true;

  const handleClick = (route) => {
    if (route) {
      navigate(route);
    }
  };

  return (
    <CustomBox>
      {tabData.map((tab) => {
        if (tab.permission.length && Array.isArray(tab.permission[0]) && tab.permission.some((ele) => checkUserPermission(ele))) {
          isDoNotHaveAnyPermission = false;
          return <DashboardTiles key={tab.name} tab={tab} handleClick={handleClick} />;
        }
        if (checkUserPermission(tab.permission)) {
          isDoNotHaveAnyPermission = false;
          return <DashboardTiles key={tab.name} tab={tab} handleClick={handleClick} />;
        }
        return null;
      })}
      {
            isDoNotHaveAnyPermission ? (
              <CustomDivWithMargin>
                <Alert severity='error'>You do not have any permission, Please connect with administrator!</Alert>
              </CustomDivWithMargin>
            ) : null
          }
    </CustomBox>
  );
};

export default index;
