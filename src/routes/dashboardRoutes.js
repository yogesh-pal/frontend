/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import { lazy } from 'react';
import { ROUTENAME, MODULE_PERMISSION, PERMISSION } from '../constants';
import { Insurance } from '../views/leadManagement/insurance';
import { GlobalAssure } from '../views/leadManagement/globalAssure';

const LoanCreationCustomerSearch = lazy(() => import('../views/loanDisbursal/searchCustomer'));
const LoanCreationMaker = lazy(() => import('../views/loanDisbursal/loanCreation/loanCreationMaker'));
const LoanCreationMakerEdit = lazy(() => import('../views/loanDisbursal/loanCreation/loanCreationMakerEdit'));

const CustomerCreation = lazy(() => import('../views/customer360/customerCreation'));
const ChargeMaster = lazy(() => import('../views/chargeMaster'));
const Dashboard = lazy(() => import('../views/dashboard'));
const Circulars = lazy(() => import('../views/circulars'));
const SchemeMaster = lazy(() => import('../views/schemeMaster'));
const LeadershipDashboard = lazy(() => import('../views/leadershipDashboard'));
const DocumentPreview = lazy(() => import('../components/documentPreview'));
const FilePreview = lazy(() => import('../components/filePreview'));
const RateMaster = lazy(() => import('../views/rateMaster'));
const UserManagement = lazy(() => import('../views/userManagement'));
const UserDetail = lazy(() => import('../views/userManagement/userDetail'));
const CustomerSearchPosidex = lazy(() => import('../views/customer360/customerSearchPosidex'));
const Customer360Dashboard = lazy(() => import('../views/customer360/dashboard'));
const CustomerSearch = lazy(() => import('../views/customer360/customerSearch'));
const FunctionalDesignation = lazy(() => import('../views/userManagement/functionalDesignation'));
const Permissions = lazy(() => import('../views/userManagement/functionalDesignation/permissions'));
const CustomerCreationQueue = lazy(() => import('../views/customer360/customerCreationQueue'));
const Deputation = lazy(() => import('../views/transaction/branchTransaction/deputation'));
const CustomerSummary = lazy(() => import('../views/customer360/customerSummary'));
const DeputationCases = lazy(() => import('../views/transaction/branchTransaction/deputation/deputtaionCases'));
const AuditManagement = lazy(() => import('../views/auditManagement'));
const GoldAudit = lazy(() => import('../views/auditManagement/goldAudit'));
const ProcessAudit = lazy(() => import('../views/auditManagement/processAudit'));
const AuditAssignment = lazy(() => import('../views/auditManagement/goldAudit/auditAssignment'));
const AuditCase = lazy(() => import('../views/auditManagement/goldAudit/auditCase'));
const CashAndPacketAudit = lazy(() => import('../views/auditManagement/cashAndPacketAudit'));
const CashAudit = lazy(() => import('../views/auditManagement/cashAndPacketAudit/cashAudit'));
const PacketAudit = lazy(() => import('../views/auditManagement/cashAndPacketAudit/packetAudit'));
const Vendor = lazy(() => import('../views/auditManagement/vendor'));
const VendorMaster = lazy(() => import('../views/auditManagement/vendor/vendorMaster'));
const VendorUser = lazy(() => import('../views/auditManagement/vendor/vendorUser'));
const NotFoundPage = lazy(() => import('../components/notFoundPage'));
const Transaction = lazy(() => import('../views/transaction'));
const BranchTransaction = lazy(() => import('../views/transaction/branchTransaction'));
const CustomerTransaction = lazy(() => import('../views/transaction/customerTransaction'));
const ReceiptMaker = lazy(() => import('../views/transaction/customerTransaction/receiptMaker'));
const ReceiptChecker = lazy(() => import('../views/transaction/customerTransaction/receiptChecker'));
const CollateralRelease = lazy(() => import('../views/transaction/customerTransaction/collateralRelease'));
const CollateralReleaseMaker = lazy(() => import('../views/transaction/customerTransaction/collateralRelease/collateralReleaseMaker'));
const CollateralReleaseChecker = lazy(() => import('../views/transaction/customerTransaction/collateralRelease/collateralReleaseChecker'));
const CashAndPacketManagement = lazy(() => import('../views/transaction/branchTransaction/cashAndPacketManagement'));
const InitiateCashTransaction = lazy(() => import('../views/transaction/branchTransaction/cashAndPacketManagement/initiateCashTransaction'));
const InitiatePacketTransaction = lazy(() => import('../views/transaction/branchTransaction/cashAndPacketManagement/initiatePacketTransaction'));
const PartRelease = lazy(() => import('../views/transaction/customerTransaction/partRelease'));
const GenerateECollectInvoice = lazy(() => import('../views/transaction/customerTransaction/generateECollectInvoice'));
const ContactPointVerification = lazy(() => import('../views/customer360/contactPointVerification'));
const InitiatePayment = lazy(() => import('../views/Payment/paymentInitiate'));
const BankingPartnershipUploader = lazy(() => import('../views/uploader/BankingPartnership'));
const RekycUploader = lazy(() => import('../views/uploader/RekycUploader'));
const BranchGroupUploader = lazy(() => import('../views/uploader/BranchGroupUploader'));
const BranchGroupChecker = lazy(() => import('../views/uploader/BranchGroupChecker'));
const Uploader = lazy(() => import('../views/uploader'));
const Reports = lazy(() => import('../views/reports'));
const MetabaseReport = lazy(() => import('../views/reports/metabase'));
const LeadManagementDashboard = lazy(() => import('../views/leadManagement/dashboard'));
const NewLead = lazy(() => import('../views/leadManagement/newLead'));
const LeadDashboard = lazy(() => import('../views/leadManagement/leadDashboard'));
const AssignedLead = lazy(() => import('../views/leadManagement/assignedLead'));
const SelectBranch = lazy(() => import('../views/selectBranch'));
const LoanCreationList = lazy(() => import('../views/loanDisbursal/list'));
const LoanTopUp = lazy(() => import('../views/loanDisbursal/loanTopUp'));
const AssignedCollectionLead = lazy(() => import('../views/assignedLeadCollection'));

export const dashboardRoutes = [
  {
    path: ROUTENAME.selectBranch,
    component: <SelectBranch />
  },
  {
    path: ROUTENAME.goldLoanDashboard,
    component: <Dashboard />
  },
  {
    path: ROUTENAME.filePreview,
    component: <FilePreview />
  },
  {
    path: ROUTENAME.fileViewer,
    component: <DocumentPreview />
  },
  {
    path: ROUTENAME.customerDashboard,
    component: <Customer360Dashboard />,
    children: [
      {
        path: ROUTENAME.customerSearch,
        component: <CustomerSearch />,
        permission: [
          [PERMISSION.customerCreate],
          [PERMISSION.customerMaker],
          [PERMISSION.customerUpdate]
        ]
      },
      {
        path: ROUTENAME.customerSearchPosidex,
        component: <CustomerSearchPosidex />,
        permission: [
          [PERMISSION.customerCreate],
          [PERMISSION.customerMaker]
        ]
      },
      {
        path: ROUTENAME.customerCreation,
        component: <CustomerCreation />,
        permission: [
          [PERMISSION.customerCreate],
          [PERMISSION.customerMaker]
        ]
      },
      {
        path: `${ROUTENAME.customerCreation}/:ucic`,
        component: <CustomerCreation />,
        permission: [
          [PERMISSION.customerCreate],
          [PERMISSION.customerMaker]
        ]
      },
      {
        path: `${ROUTENAME.customerCreation}/update/:customerID`,
        component: <CustomerCreation />,
        permission: [
          [PERMISSION.customerCreate],
          [PERMISSION.customerMaker]
        ]
      },
      {
        path: ROUTENAME.customerCreationQueue,
        component: <CustomerCreationQueue />,
        permission: [PERMISSION.customerChecker]
      },
      {
        path: ROUTENAME.contactPointVerification,
        component: <ContactPointVerification />,
        permission: [
          [PERMISSION.cpvView],
          [PERMISSION.cpvUpdate],
          [PERMISSION.cpvChecker]
        ]
      },
      {
        path: ROUTENAME.customerSummary,
        component: <CustomerSummary />,
        permission: [PERMISSION.customerView]
      }]
  },
  {
    path: ROUTENAME.chargeMaster,
    component: <ChargeMaster />,
    permission: MODULE_PERMISSION.charge
  },
  {
    path: ROUTENAME.schemeMaster,
    component: <SchemeMaster />,
    permission: [MODULE_PERMISSION.scheme, [PERMISSION.schemeView]]
  },
  {
    path: ROUTENAME.circulars,
    component: <Circulars />,
    permission: MODULE_PERMISSION.circular
  },
  {
    path: ROUTENAME.rateMaster,
    component: <RateMaster />,
    permission: MODULE_PERMISSION.rate
  },
  {
    path: ROUTENAME.userManagement,
    component: <UserManagement />,
    children: [
      {
        path: ROUTENAME.userDetail,
        component: <UserDetail />,
        permission: [...MODULE_PERMISSION.user, ...MODULE_PERMISSION.role, ...MODULE_PERMISSION.permission]
      },
      {
        path: ROUTENAME.functionalDesignation,
        component: <FunctionalDesignation />,
        permission: [...MODULE_PERMISSION.user, ...MODULE_PERMISSION.role, ...MODULE_PERMISSION.permission]
      },
      {
        path: ROUTENAME.permission,
        component: <Permissions />,
        permission: [...MODULE_PERMISSION.user, ...MODULE_PERMISSION.role, ...MODULE_PERMISSION.permission]
      }
    ]
  },
  {
    path: ROUTENAME.transaction,
    component: <Transaction />,
    children: [
      {
        path: ROUTENAME.branchTransaction,
        component: <BranchTransaction />,
        children: [
          { path: ROUTENAME.deputation, component: <Deputation />, permission: MODULE_PERMISSION.deputation },
          { path: ROUTENAME.deputationCases, component: <DeputationCases />, permission: MODULE_PERMISSION.deputation },
          { path: ROUTENAME.cashAndPacketManagement, component: <CashAndPacketManagement />, permission: MODULE_PERMISSION.cashAndPacket },
          { path: ROUTENAME.initiateCashTransaction, component: <InitiateCashTransaction />, permission: MODULE_PERMISSION.cashAndPacket },
          { path: ROUTENAME.initiatePacketTransaction, component: <InitiatePacketTransaction />, permission: MODULE_PERMISSION.cashAndPacket }
        ]
      },
      {
        path: ROUTENAME.customerTransaction,
        component: <CustomerTransaction />,
        children: [
          { path: ROUTENAME.receiptMaker, component: <ReceiptMaker />, permission: [PERMISSION.receiptView, PERMISSION.receiptMaker] },
          { path: ROUTENAME.receiptChecker, component: <ReceiptChecker />, permission: [PERMISSION.receiptView] },
          { path: ROUTENAME.partRelease, component: <PartRelease />, permission: MODULE_PERMISSION.partRelease },
          { path: ROUTENAME.onlinePayment, component: <InitiatePayment />, permission: MODULE_PERMISSION.onlinePayment },
          { path: ROUTENAME.generateECollectInvoice, component: <GenerateECollectInvoice />, permission: [PERMISSION.eCollectInvoiceCreate] },

          {
            path: ROUTENAME.collateralRelease,
            component: <CollateralRelease />,
            children: [
              { path: ROUTENAME.collateralReleaseMaker, component: <CollateralReleaseMaker />, permission: [PERMISSION.collateralView, PERMISSION.collateralMaker] },
              { path: ROUTENAME.collateralReleaseChecker, component: <CollateralReleaseChecker />, permission: [PERMISSION.collateralView] }
            ]
          }
        ]
      }
    ]
  },
  {
    children: [
      {
        path: ROUTENAME.loanCreationList,
        component: <LoanCreationList />,
        permission: MODULE_PERMISSION.los
      },
      {
        path: ROUTENAME.loanCreationCustomerSearch,
        component: <LoanCreationCustomerSearch />,
        permission: MODULE_PERMISSION.los
      },
      {
        path: ROUTENAME.loanCreationMaker,
        component: <LoanCreationMaker />,
        permission: MODULE_PERMISSION.los
      },
      {
        path: `${ROUTENAME.loanCreationMaker}/:appNo`,
        component: <LoanCreationMakerEdit />,
        permission: MODULE_PERMISSION.los
      },
      {
        path: ROUTENAME.loanTopUp,
        component: <LoanTopUp />,
        permission: [...MODULE_PERMISSION.los, PERMISSION.topUpMaker]
      }
    ]
  },
  {
    path: ROUTENAME.auditManagement,
    component: <AuditManagement />,
    children: [
      {
        path: ROUTENAME.goldAudit,
        component: <GoldAudit />,
        children: [
          {
            path: ROUTENAME.auditAssignment,
            component: <AuditAssignment />,
            permission: MODULE_PERMISSION.auditAssignment
          },
          {
            path: ROUTENAME.auditCase,
            component: <AuditCase />,
            permission: MODULE_PERMISSION.auditCase
          }
        ]
      },
      {
        path: ROUTENAME.processAudit,
        component: <ProcessAudit />,
        permission: MODULE_PERMISSION.processAudit
      },
      {
        path: ROUTENAME.cashAndPacketAudit,
        component: <CashAndPacketAudit />,
        children: [
          {
            path: ROUTENAME.cashAudit,
            component: <CashAudit />,
            permission: MODULE_PERMISSION.cashAudit
          },
          {
            path: ROUTENAME.packetAudit,
            component: <PacketAudit />,
            permission: MODULE_PERMISSION.packetAudit
          }
        ]
      },
      {
        path: ROUTENAME.vendor,
        component: <Vendor />,
        permission: MODULE_PERMISSION.vendorUser
      },
      {
        path: ROUTENAME.vendorMaster,
        component: <VendorMaster />,
        permission: MODULE_PERMISSION.vendorUser
      },
      {
        path: ROUTENAME.vendorUser,
        component: <VendorUser />,
        permission: MODULE_PERMISSION.vendorUser
      }
    ]
  },
  {
    path: ROUTENAME.uploader,
    component: <Uploader />,
    children: [
      {
        path: ROUTENAME.bankingpartnershipUploader,
        component: <BankingPartnershipUploader />,
        permission: MODULE_PERMISSION.bankingPartnership
      },
      {
        path: ROUTENAME.rekycUpload,
        component: <RekycUploader />,
        permission: MODULE_PERMISSION.rekycUploader
      },
      {
        path: ROUTENAME.branchGroupUpload,
        component: <BranchGroupUploader />,
        permission: [PERMISSION.branchgroupingmaker]
      },
      {
        path: ROUTENAME.branchGroupCheck,
        component: <BranchGroupChecker />,
        permission: [PERMISSION.branchgroupingchecker]
      },
    ]
  },
  {
    path: ROUTENAME.reports,
    component: <Reports />,
    children: [
      {
        path: ROUTENAME.metabase,
        component: <MetabaseReport />,
        permission: MODULE_PERMISSION.metaBase
      },
    ]
  },
  {
    path: ROUTENAME.leadManagement,
    component: <LeadManagementDashboard />,
    permission: [[PERMISSION.leadCreate], [PERMISSION.leadView], [PERMISSION.insuranceView], [PERMISSION.globalAssureView]],
    children: [
      {
        path: ROUTENAME.newLead,
        component: <NewLead />,
        permission: [PERMISSION.leadCreate]
      },
      {
        path: ROUTENAME.leadDashboard,
        component: <LeadDashboard />,
        permission: [PERMISSION.leadView]
      },
      {
        path: ROUTENAME.leadInsurance,
        component: <Insurance />,
        permission: [PERMISSION.insuranceView]
      },
      {
        path: ROUTENAME.assignedLead,
        component: <AssignedLead />,
        permission: [[PERMISSION.leadView], [PERMISSION.leadUpdate]]
      },
      {
        path: ROUTENAME.globalAssure,
        component: <GlobalAssure />,
        permission: [PERMISSION.globalAssureView]
      }
    ]
  },
  {
    path: ROUTENAME.leadershipDashboard,
    component: <LeadershipDashboard />,
    permission: [PERMISSION.leadershipdashboardView]
  },
  {
    path: ROUTENAME.assignedCollectionLead,
    component: <AssignedCollectionLead />,
    permission: MODULE_PERMISSION.assignedCollectionLead
  },
  {
    path: ROUTENAME.error,
    component: <NotFoundPage />
  }
];
