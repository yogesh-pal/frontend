/* eslint-disable max-len */
export const VARIABLE = {
  BRANCHALL: 'All Branches'
};

export const ROLE = {
  RM: 'Regional Manager',
  AOM: 'Area Manager',
  BM: 'Branch Manager',
  GV: 'Gold Valuer',
  RO: 'Relationship Officer',
  BC: 'Business Coordinator',
  ABM: 'Assistant Branch Manager',
  SRO: 'Senior Relationship Officer',
  BH: 'Business Head'
};

export const PERMISSION = {
  customerView: 'customer_view',
  customerCreate: 'customer_create',
  customerUpdate: 'customer_update',
  customerMaker: 'customer_maker',
  customerChecker: 'customer_checker',
  chargeView: 'charge_view',
  chargeCreate: 'charge_create',
  chargeUpdate: 'charge_update',
  chargeMaker: 'charge_maker',
  chargeChecker: 'charge_checker',
  schemeView: 'scheme_view',
  schemeCreate: 'scheme_create',
  schemeUpdate: 'scheme_update',
  schemeMaker: 'scheme_maker',
  schemeChecker: 'scheme_checker',
  circularView: 'circular_view',
  circularCreate: 'circular_create',
  circularUpdate: 'circular_update',
  circularMaker: 'circular_maker',
  circularChecker: 'circular_checker',
  rateView: 'rate_view',
  rateCreate: 'rate_create',
  rateUpdate: 'rate_update',
  rateMaker: 'rate_maker',
  rateChecker: 'rate_checker',
  userView: 'user_view',
  userCreate: 'user_create',
  userUpdate: 'user_update',
  userMaker: 'user_maker',
  userChecker: 'user_checker',
  deputationView: 'deputation_view',
  deputationCreate: 'deputation_create',
  deputationUpdate: 'deputation_update',
  deputationMaker: 'deputation_maker',
  deputationChecker: 'deputation_checker',
  losView: 'los_view',
  losCreate: 'los_create',
  losUpdate: 'los_update',
  losMaker: 'los_maker',
  losChecker: 'los_checker',
  auditassignmentView: 'auditassignment_view',
  auditassignmentCreate: 'auditassignment_create',
  auditassignmentUpdate: 'auditassignment_update',
  auditassignmentMaker: 'auditassignment_maker',
  auditassignmentChecker: 'auditassignment_checker',
  auditcaseView: 'auditcase_view',
  auditcaseCreate: 'auditcase_create',
  auditcaseUpdate: 'auditcase_update',
  auditcaseMaker: 'auditcase_maker',
  auditcaseChecker: 'auditcase_checker',
  processAuditView: 'processaudit_view',
  processAuditCreate: 'processaudit_create',
  processAuditUpdate: 'processaudit_update',
  processAuditMaker: 'processaudit_maker',
  processAuditChecker: 'processaudit_checker',
  vendorUserView: 'vendoruser_view',
  vendorUserCreate: 'vendoruser_create',
  vendorUserUpdate: 'vendoruser_update',
  vendorUserMaker: 'vendoruser_maker',
  vendorUserChecker: 'vendoruser_checker',
  permissionView: 'permission_view',
  permissionCreate: 'permission_create',
  permissionUpdate: 'permission_update',
  permissionMaker: 'permission_maker',
  permissionChecker: 'permission_checker',
  roleView: 'role_view',
  roleCreate: 'role_create',
  roleUpdate: 'role_update',
  roleMaker: 'role_maker',
  roleChecker: 'role_checker',
  receiptView: 'receipt_view',
  receiptCreate: 'receipt_create',
  receiptUpdate: 'receipt_update',
  receiptMaker: 'receipt_maker',
  receiptChecker: 'receipt_checker',
  collateralView: 'collateral_view',
  collateralCreate: 'collateral_create',
  collateralUpdate: 'collateral_update',
  collateralMaker: 'collateral_maker',
  collateralChecker: 'collateral_checker',
  cashPacketView: 'cashpacket_view',
  cashPacketCreate: 'cashpacket_create',
  cashPacketUpdate: 'cashpacket_update',
  cashPacketMaker: 'cashpacket_maker',
  cashPacketChecker: 'cashpacket_checker',
  partReleaseView: 'partres_view',
  partReleaseCreate: 'partres_create',
  partReleaseUpdate: 'partres_update',
  partReleaseMaker: 'partres_maker',
  partReleaseChecker: 'partres_checker',
  topUpView: 'top_up_view',
  topUpCreate: 'top_up_create',
  topUpUpdate: 'top_up_update',
  topUpMaker: 'top_up_maker',
  topUpChecker: 'top_up_checker',
  repaymentView: 'repayment_view',
  repaymentCreate: 'repayment_create',
  repaymentUpdate: 'repayment_update',
  repaymentMaker: 'repayment_maker',
  repaymentChecker: 'repayment_checker',
  cpvView: 'customer_cpv_view',
  cpvUpdate: 'customer_cpv_update',
  cpvChecker: 'customer_cpv_checker',
  cashAuditCreate: 'cash_audit_create',
  packetAuditCreate: 'packet_audit_create',
  onlinePaymentView: 'online_payment_view',
  onlinePaymentCreate: 'online_payment_create',
  bankingpartnershipuploaderView: 'uploader_view',
  bankingpartnershipuploaderCreate: 'uploader_create',
  rekycuploaderView: 'customer_re_kyc_view',
  rekycuploaderCreate: 'customer_re_kyc_create',
  branchgroupingmaker: 'bg_maker',
  branchgroupingchecker: 'bg_checker',
  metabaseView: 'metabase_view',
  leadCreate: 'lead_create',
  leadView: 'lead_view',
  leadershipdashboardView: 'leadership_dashboard_view',
  leadUpdate: 'lead_update',
  insuranceView: 'insurance_dekho_view',
  globalAssureView: 'global_assure_view',
  assignedCollectionLeadView: 'collection_dpd_view',
  eCollectInvoiceView: 'e_collect_invoice_view',
  eCollectInvoiceCreate: 'e_collect_invoice_create',
  bankDetailsView: 'bank_details_view',
  mfaView: 'mfa_otp_view',
  mfaCreate: 'mfa_otp_create'
};

export const MODULE_PERMISSION = {
  customer: [PERMISSION.customerView, PERMISSION.customerCreate, PERMISSION.customerUpdate, PERMISSION.customerMaker, PERMISSION.customerChecker],
  charge: [PERMISSION.chargeView, PERMISSION.chargeCreate, PERMISSION.chargeUpdate, PERMISSION.chargeMaker, PERMISSION.chargeChecker],
  scheme: [PERMISSION.schemeView, PERMISSION.schemeCreate, PERMISSION.schemeUpdate, PERMISSION.schemeMaker, PERMISSION.schemeChecker],
  circular: [PERMISSION.circularView, PERMISSION.circularCreate, PERMISSION.circularUpdate, PERMISSION.circularMaker, PERMISSION.circularChecker],
  rate: [PERMISSION.rateView, PERMISSION.rateCreate, PERMISSION.rateUpdate, PERMISSION.rateMaker, PERMISSION.rateChecker],
  user: [PERMISSION.userView, PERMISSION.userCreate, PERMISSION.userUpdate, PERMISSION.userMaker, PERMISSION.userChecker],
  deputation: [PERMISSION.deputationView, PERMISSION.deputationCreate, PERMISSION.deputationUpdate, PERMISSION.deputationMaker, PERMISSION.deputationChecker],
  los: [PERMISSION.losView, PERMISSION.losCreate, PERMISSION.losUpdate, PERMISSION.losMaker, PERMISSION.losChecker],
  auditAssignment: [PERMISSION.auditassignmentView, PERMISSION.auditassignmentCreate, PERMISSION.auditassignmentUpdate, PERMISSION.auditassignmentMaker, PERMISSION.auditassignmentChecker],
  auditCase: [PERMISSION.auditcaseView, PERMISSION.auditcaseCreate, PERMISSION.auditcaseUpdate, PERMISSION.auditcaseMaker, PERMISSION.auditcaseChecker],
  processAudit: [PERMISSION.processAuditView, PERMISSION.processAuditCreate, PERMISSION.processAuditUpdate, PERMISSION.processAuditMaker, PERMISSION.processAuditChecker],
  vendorUser: [PERMISSION.vendorUserView, PERMISSION.vendorUserCreate, PERMISSION.vendorUserUpdate, PERMISSION.vendorUserMaker, PERMISSION.vendorUserChecker],
  permission: [PERMISSION.permissionView, PERMISSION.permissionCreate, PERMISSION.permissionUpdate, PERMISSION.permissionMaker, PERMISSION.permissionChecker],
  role: [PERMISSION.roleView, PERMISSION.roleCreate, PERMISSION.roleUpdate, PERMISSION.roleMaker, PERMISSION.roleChecker],
  receipt: [PERMISSION.receiptView, PERMISSION.receiptCreate, PERMISSION.receiptUpdate, PERMISSION.receiptMaker, PERMISSION.receiptChecker],
  collateral: [PERMISSION.collateralView, PERMISSION.collateralCreate, PERMISSION.collateralUpdate, PERMISSION.collateralMaker, PERMISSION.collateralChecker],
  cashAndPacket: [PERMISSION.cashPacketView, PERMISSION.cashPacketCreate, PERMISSION.cashPacketUpdate, PERMISSION.cashPacketMaker, PERMISSION.cashPacketChecker],
  partRelease: [PERMISSION.partReleaseView, PERMISSION.partReleaseCreate, PERMISSION.partReleaseUpdate, PERMISSION.partReleaseMaker, PERMISSION.partReleaseChecker],
  topUP: [PERMISSION.topUpView, PERMISSION.topUpCreate, PERMISSION.topUpUpdate, PERMISSION.topUpMaker, PERMISSION.topUpChecker],
  repayment: [PERMISSION.repaymentView, PERMISSION.repaymentCreate, PERMISSION.repaymentUpdate, PERMISSION.repaymentMaker, PERMISSION.repaymentChecker],
  customerCPV: [PERMISSION.cpvView, PERMISSION.cpvUpdate, PERMISSION.cpvChecker],
  cashAudit: [PERMISSION.cashAuditCreate],
  packetAudit: [PERMISSION.packetAuditCreate],
  onlinePayment: [PERMISSION.onlinePaymentView, PERMISSION.onlinePaymentCreate],
  bankingPartnership: [PERMISSION.bankingpartnershipuploaderView, PERMISSION.bankingpartnershipuploaderCreate],
  rekycUploader: [PERMISSION.rekycuploaderView, PERMISSION.rekycuploaderCreate],
  branchGrouping: [PERMISSION.branchgroupingmaker, PERMISSION.branchgroupingchecker],
  metaBase: [PERMISSION.metabaseView],
  leadManagement: [PERMISSION.leadView, PERMISSION.leadCreate, PERMISSION.leadUpdate],
  leadManagementInsurance: [PERMISSION.insuranceView],
  leadershipDashboard: [PERMISSION.leadershipdashboardView],
  leadManagementGlobalAssure: [PERMISSION.globalAssureView],
  assignedCollectionLead: [PERMISSION.assignedCollectionLeadView],
  eCollectInvoice: [PERMISSION.eCollectInvoiceView, PERMISSION.eCollectInvoiceCreate],
  bankDetailsView: [PERMISSION.bankDetailsView],
  mfa: [PERMISSION.mfaView, PERMISSION.mfaCreate],
};

export const SUB_DEPARTMENT = {
  auditGl: 'Audit - GL'
};

export const FEE_ENUM_VALUES = {
  MTM: 'MTM Charges',
  SOA: 'SOA Charges',
  LEGAL: 'Legal Charges',
  OTHER: 'Other Charges',
  COURIER: 'Courier Charges',
  PROCESSING: 'Processing Fee',
  PREAUCTION: 'Pre-Auction Charges',
  POSTAUCTION: 'Post-Auction Charges',
};

export const CHARGES_ENUM_VALUES = {
  STAMPDUTY: 'Stamp Duty',
  STAMPDUTYRJ: 'Stamp Duty Rajasthan',
  INSURANCE: 'Insurance',
  'CASH HANDLING': 'Cash Handling'
};

export const COLENDERENUM = {
  IOBAGRI: 'IOB - AGRI'
};

export const SENDOTPINTERVALSPOLLING = [3000, 6000, 12000, 20000, 30000];
