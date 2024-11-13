import { IDENTIFIER } from '../../../../constants';

export const userColumnFields = [
  {
    field: 'emp_code',
    headerName: 'Employee Code',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'emp_name',
    headerName: 'Employee Name',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'hrms_branch_code',
    headerName: 'HRMS Branch Code',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'branch_code',
    headerName: 'Current Branch Code',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'status',
    headerName: 'Employee Status',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
];

export const makerDetailFormConfig = (employee) => [
  {
    name: 'emp_code',
    label: 'Employee ID',
    defaultValue: employee.emp_code,
    identifier: IDENTIFIER.INPUTTEXT
  },
  {
    name: 'emp_name',
    label: 'Employee Name',
    defaultValue: employee.emp_name,
    identifier: IDENTIFIER.INPUTTEXT
  },
  {
    name: 'functional_designation',
    label: 'Functional Designation',
    identifier: IDENTIFIER.INPUTTEXT,
    defaultValue: employee.functional_designation,
  },
  {
    name: 'mobile',
    label: 'Mobile',
    identifier: IDENTIFIER.INPUTTEXT,
    defaultValue: employee.mobile,
  },
  {
    name: 'hrms_branch_code1',
    label: 'HRMS Branch Code',
    identifier: IDENTIFIER.INPUTTEXT,
    defaultValue: employee.hrms_branch_code,
  },
  {
    name: 'hrms_branch_name1',
    label: 'HRMS Branch Name',
    identifier: IDENTIFIER.INPUTTEXT,
    defaultValue: employee.hrms_branch_name,
  },
  {
    name: 'email',
    label: 'Email',
    identifier: IDENTIFIER.INPUTTEXT,
    defaultValue: employee.email,
  },
  {
    name: 'rm1_code',
    label: 'RM-1 Code',
    identifier: IDENTIFIER.INPUTTEXT,
    defaultValue: employee.rm1_code,
  },
  {
    name: 'rm1_name',
    label: 'RM-1 Name',
    identifier: IDENTIFIER.INPUTTEXT,
    defaultValue: employee.rm1_name,
  },
  {
    name: 'goldloan_status',
    label: 'Employee Status',
    identifier: IDENTIFIER.INPUTTEXT,
    defaultValue: employee.goldloan_status
  }
];

export const checkerDetailFormConfig = (employee) => [
  {
    name: 'emp_code',
    label: 'Employee ID',
    defaultValue: employee.emp_code,
    identifier: IDENTIFIER.INPUTTEXT
  },
  {
    name: 'emp_name',
    label: 'Employee Name',
    defaultValue: employee.name,
    identifier: IDENTIFIER.INPUTTEXT
  },
  {
    name: 'functional_designation',
    label: 'Functional Designation',
    identifier: IDENTIFIER.INPUTTEXT,
    defaultValue: employee?.uid?.functional_designation,
  },
  {
    name: 'mobile',
    label: 'Mobile',
    identifier: IDENTIFIER.INPUTTEXT,
    defaultValue: employee?.uid?.mobile,
  },
  {
    name: 'hrms_branch_code',
    label: 'HRMS Branch Code',
    identifier: IDENTIFIER.INPUTTEXT,
    defaultValue: employee.hrms_branch_code,
  },
  {
    name: 'hrms_branch_name',
    label: 'HRMS Branch Name',
    identifier: IDENTIFIER.INPUTTEXT,
    defaultValue: employee.hrms_branch_name,
  },
  {
    name: 'email',
    label: 'Email',
    identifier: IDENTIFIER.INPUTTEXT,
    defaultValue: employee.email,
  },
  {
    name: 'rm1_code',
    label: 'RM-1 Code',
    identifier: IDENTIFIER.INPUTTEXT,
    defaultValue: employee?.uid?.rm1_code,
  },
  {
    name: 'rm1_name',
    label: 'RM-1 Name',
    identifier: IDENTIFIER.INPUTTEXT,
    defaultValue: employee?.uid?.rm1_name,
  },
  {
    name: 'status',
    label: 'Deputation Status',
    identifier: IDENTIFIER.INPUTTEXT,
    defaultValue: employee.status
  }
];

export const deputationCasesColumnFields = [
  {
    field: 'emp_code',
    headerName: 'Employee Code',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'name',
    headerName: 'Employee Name',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'hrms_branch_code',
    headerName: 'HRMS Branch Code',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'current_branch_code',
    headerName: 'Current Branch Code',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'branch_code',
    headerName: 'Deputation Branch Code',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'type',
    headerName: 'Type',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'status',
    headerName: 'Deputation Status',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
];

export const deputationStatus = [
  { label: 'All', value: 'ALL' },
  { label: 'Open', value: 'OPEN' },
  { label: 'Approved', value: 'APPV' },
  { label: 'Rejected', value: 'REJC' },
  { label: 'Auto Rejected', value: 'AREJ' },
  { label: 'Manual Closed', value: 'MCLS' },
  { label: 'Auto Closed', value: 'ACLS' }
];
