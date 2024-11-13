/* eslint-disable no-nested-ternary */
/* eslint-disable max-len */
import { FormControlLabel } from '@mui/material';
import { IDENTIFIER, REGEX, FUNCTION_IDENTIFIER } from '../../constants';
import { icons } from '../../components';
import { HeadingMaster3 } from './styled-components';
import { CheckboxPrimary } from '../../components/styledComponents';

const EditIcon = icons.Edit;

export const ExternalUserformConfig = (branches, branchCodeArray) => {
  const branchNameHandler = (values, callback) => {
    try {
      const branch = branches.filter((ele) => ele.branchCode === values.branch_code);
      callback(branch[0].branchName);
    } catch (e) {
      console.log('Error', e);
    }
  };
  const rmNameHandler = (values, callback) => {
    try {
      callback('jvhbkjnk');
    } catch (e) {
      console.log('Error', e);
    }
  };
  return [
    {
      variant: 'outlined',
      input: [
        {
          name: 'emp_id',
          label: 'Employee ID',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          validation: {
            isRequired: true,
            requiredMsg: 'Please enter employee id',
            pattern: REGEX.ALPHANUMERIC,
            patternMsg: 'Alphanumeric characters only'
          }
        },
        {
          name: 'emp_name',
          type: 'text',
          label: 'Employee Name',
          identifier: IDENTIFIER.INPUTTEXT,
          validation: {
            isRequired: true,
            requiredMsg: 'Please enter empolyee name',
            pattern: REGEX.ALPHABETS,
            patternMsg: 'Alphabetical characters only'
          }
        },
        {
          name: 'branch_code',
          label: 'Branch Code',
          type: 'select',
          identifier: IDENTIFIER.SELECT,
          multiSelect: false,
          option: branchCodeArray,
          validation: {
            isRequired: true,
            requiredMsg: 'Please select branch code.'
          },
        },
        {
          name: 'branch_name',
          label: 'Branch Name',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          disabled: true,
          defaultValue: '',
          customFunction: branchNameHandler,
          functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE,
          functionChangeBaseOn: 'branch_code',
        },
        {
          name: 'functional_designation',
          label: 'Functional Designation',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          validation: {
            isRequired: true,
            requiredMsg: 'Please enter functional designation.'
          },
        },
        {
          name: 'mobile',
          type: 'text',
          label: 'Mobile',
          identifier: IDENTIFIER.INPUTTEXT,
          validation: {
            isRequired: true,
            requiredMsg: 'Please enter mobile number.',
            pattern: REGEX.NUMBER,
            patternMsg: 'Please enter a valid mobile number'
          },
        },
        {
          name: 'email',
          type: 'text',
          label: 'Email',
          identifier: IDENTIFIER.INPUTTEXT,
          validation: {
            isRequired: true,
            requiredMsg: 'Please enter email.',
            pattern: REGEX.EMAIL,
            patternMsg: 'Please enter a valid email '
          },
        },
        {
          name: 'rm1_code',
          type: 'text',
          label: 'RM-1 Code',
          identifier: IDENTIFIER.INPUTTEXT,
          validation: {
            isRequired: true,
            requiredMsg: 'Please enter rm-1 code.'
          },
        },
        {
          name: 'rm1_name',
          type: 'text',
          label: 'RM-1 Name',
          identifier: IDENTIFIER.INPUTTEXT,
          disabled: true,
          defaultValue: '',
          customFunction: rmNameHandler,
          functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE,
          functionChangeBaseOn: 'rm1_code',
        },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          identifier: IDENTIFIER.SELECT,
          multiSelect: false,
          option: ['ACTIVE', 'INACTIVE'],
          validation: {
            isRequired: true,
            requiredMsg: 'Please select status.'
          },
        }
      ],
      buttonDetails: {
        alignment: 'center',
        name: 'Next',
        type: 'submit'
      },
      alignment: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 6,
        xl: 6
      }
    }
  ];
};

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
    field: 'branch_code',
    headerName: 'Branch Code',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'branch_name',
    headerName: 'Branch Name',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'functional_designation',
    headerName: 'Functional Designation',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
];

export const allPermissions = [{
  name: 'ROM',
  permissions: [{
    name: 'Customer',
    key: 'customer',
    child: [
      { name: 'Create Customer', key: 'create_customer', checked: false },
      { name: 'View Customer', key: 'view_customer', checked: true },
      { name: 'Update Customer', key: 'update_customer', checked: false },
      { name: 'Delete Customer', key: 'delete_customer', checked: true }
    ]
  },
  {
    name: 'Loan',
    key: 'loan',
    child: [
      { name: 'Add Loan', key: 'add_loan', checked: true },
      { name: 'View Loan', key: 'view_loan', checked: false },
      { name: 'Update Loan', key: 'update_loan', checked: true },
      { name: 'Verify Loan', key: 'verify_loan', checked: false }
    ]
  },
  {
    name: 'Reports',
    key: 'reports',
    child: [
      { name: 'Create Report', key: 'create_report', checked: false },
      { name: 'View Report', key: 'view_report', checked: true },
      { name: 'Update Report', key: 'update_report', checked: true },
      { name: 'Delete Report', key: 'delete_report', checked: false }]
  },
  {
    name: 'Circulars',
    key: 'circulars',
    child: [
      { name: 'Create Circulars', key: 'create_circulars', checked: true },
      { name: 'View Circulars', key: 'view_circulars', checked: false },
      { name: 'Update Circulars', key: 'update_circulars', checked: false },
      { name: 'Delete Circulars', key: 'delete_circulars', checked: true }]
  }]
},
{
  name: 'BOM',
  permissions: []
},
{
  name: 'AOM',
  permissions: []
}
];

export const branchFormConfig = ({ stateDetails, existingUser }) => {
  const stateDetailsHandler = (values, callback) => {
    try {
      const sortedStates = (Object.keys(stateDetails)).sort((a, b) => ((a > b) ? 1 : ((b > a) ? -1 : 0)));
      callback(sortedStates);
    } catch (e) {
      console.log('Error', e);
    }
  };

  const cityDetailsHandler = (values, callback, index, setValue) => {
    try {
      let data = [];
      if (values?.state.length > 0) {
        values?.state.forEach((item) => {
          data = [...data, ...Object.keys(stateDetails[item])];
        });
      }
      const dataBranch = [];
      data.forEach((item) => {
        if (values?.city?.includes(item)) {
          dataBranch.push(item);
        }
      });
      setValue('city', dataBranch);
      const sortedCity = data.sort((a, b) => ((a > b) ? 1 : ((b > a) ? -1 : 0)));
      callback({
        city: sortedCity,
        branch: [],
      });
    } catch (e) {
      console.log('Error', e);
    }
  };

  const branchDetailHandler = (values, callback, index, setValue) => {
    try {
      let data = [];
      if (values?.state.length > 0) {
        values?.state.forEach((state) => {
          values?.city.forEach((city) => {
            if (stateDetails[state] !== undefined
                && stateDetails[state][city] !== undefined) {
              data = [...data, ...stateDetails[state][city]];
            }
          });
        });
      }
      const dataBranch = [];
      data.forEach((item) => {
        if (values.branchCode.includes(item.value)) {
          dataBranch.push(item.value);
        }
      });
      setValue('branchCode', dataBranch);
      const sortedBranch = data.sort((a, b) => ((a.label.toLowerCase() > b.label.toLowerCase()) ? 1 : ((b.label.toLowerCase() > a.label.toLowerCase()) ? -1 : 0)));
      callback(sortedBranch);
    } catch (e) {
      console.log('Error', e);
    }
  };
  return {
    form: [
      {
        variant: 'outlined',
        input: [
          {
            name: 'is_pan_india',
            label: 'PAN India',
            type: 'radio',
            identifier: IDENTIFIER.RADIO,
            inline: true,
            option: ['YES', 'NO'],
            defaultValue: existingUser?.is_pan_india,
            onChange: {
              YES: {
                defaultValue: 'YES',
                disable: {
                  value: true,
                  disableFields: ['state', 'city', 'branchCode'],
                },
                validation: {
                  state: {
                    validation: {
                      isRequired: false,
                    },
                  },
                  city: {
                    validation: {
                      isRequired: false,
                    },
                  },
                  branchCode: {
                    validation: {
                      isRequired: false,
                    },
                  }
                }
              },
              NO: {
                defaultValue: 'NO',
                disable: {
                  value: false,
                  disableFields: ['state', 'city', 'branchCode'],
                },
                validation: {
                  state: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please select state.'
                    }
                  },
                  city: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please select city.'
                    },
                  },
                  branchCode: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please select branch.'
                    },
                  }
                }
              },
            },
          },
          {
            name: 'state',
            label: 'State',
            type: 'select',
            identifier: IDENTIFIER.MULTISELECT,
            multiSelect: true,
            defaultSelectedAll: false,
            option: [],
            customFunction: stateDetailsHandler,
            onChange: {
              resetFields: ['city', 'branchCode']
            },
            functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
            validation: {
              isRequired: true,
              requiredMsg: 'Please select state.'
            },
          },
          {
            name: 'city',
            label: 'City',
            type: 'select',
            identifier: IDENTIFIER.MULTISELECT,
            multiSelect: true,
            defaultSelectedAll: true,
            defaultSelectedAllOnChange: true,
            option: [],
            customFunction: cityDetailsHandler,
            functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
            setValueArr: [
              {
                name: 'branch',
                apiKey: 'branch'
              },
              {
                name: 'city',
                apiKey: 'city'
              }
            ],
            functionChangeBaseOn: 'state',
            validation: {
              isRequired: true,
              requiredMsg: 'Please select city.'
            },
          },
          {
            name: 'branchCode',
            label: 'Branch',
            type: 'select',
            identifier: IDENTIFIER.MULTISELECT,
            multiSelect: true,
            defaultSelectedAll: true,
            defaultSelectedAllOnChange: true,
            option: [],
            customFunction: branchDetailHandler,
            functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE,
            functionChangeBaseOn: 'city',
            validation: {
              isRequired: true,
              requiredMsg: 'Please select branch.'
            },
          }
        ],
        buttonDetails: {
          name: 'Add Branch',
          type: 'submit'
        },
        alignment: {
          xs: 12,
          sm: 12,
          md: 6,
          lg: 6,
          xl: 6
        }
      }
    ]
  };
};

export const userDetailFormConfig = (employee) => [
  {
    variant: 'outlined',
    input: [
      {
        name: 'emp_code',
        label: 'Employee ID',
        type: 'text',
        disabled: true,
        defaultValue: employee.emp_code,
        identifier: IDENTIFIER.INPUTTEXT
      },
      {
        name: 'emp_name',
        type: 'text',
        label: 'Employee Name',
        disabled: true,
        defaultValue: employee.emp_name,
        identifier: IDENTIFIER.INPUTTEXT
      },
      {
        name: 'branch_code',
        label: 'Branch Code',
        type: 'text',
        disabled: true,
        defaultValue: employee.branch_code,
        identifier: IDENTIFIER.INPUTTEXT
      },
      {
        name: 'branch_name',
        label: 'Branch Name',
        type: 'text',
        disabled: true,
        defaultValue: employee.branch_name,
        identifier: IDENTIFIER.INPUTTEXT
      },
      {
        name: 'functional_designation',
        label: 'Functional Designation',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        disabled: true,
        defaultValue: employee.functional_designation,
      },
      {
        name: 'mobile',
        type: 'text',
        label: 'Mobile',
        identifier: IDENTIFIER.INPUTTEXT,
        disabled: true,
        defaultValue: employee.mobile,
      },
      {
        name: 'email',
        type: 'text',
        label: 'Email',
        identifier: IDENTIFIER.INPUTTEXT,
        disabled: true,
        defaultValue: employee.email,
      },
      {
        name: 'rm1_code',
        type: 'text',
        label: 'RM-1 Code',
        identifier: IDENTIFIER.INPUTTEXT,
        disabled: true,
        defaultValue: employee.rm1_code,
      },
      {
        name: 'rm1_name',
        type: 'text',
        label: 'RM-1 Name',
        identifier: IDENTIFIER.INPUTTEXT,
        disabled: true,
        defaultValue: employee.rm1_name,
      },
      {
        name: 'goldloan_status',
        label: 'Status',
        type: 'select',
        identifier: IDENTIFIER.SELECT,
        multiSelect: false,
        defaultValue: employee.goldloan_status,
        option: ['ACTIVE', 'INACTIVE'],
        validation: {
          isRequired: true,
          requiredMsg: 'Please select status.'
        },
      }
    ],
    buttonDetails: {
      alignment: 'center',
      name: 'Next',
      type: 'submit'
    },
    alignment: {
      xs: 12,
      sm: 12,
      md: 6,
      lg: 6,
      xl: 6
    }
  }
];

export const userRoleColumnFields = (editChargeDetailsHandler) => [
  {
    field: 'name',
    headerName: 'Functional Designation',
    sortable: false,
    flex: 1,
  },
  {
    field: 'action',
    headerName: 'Actions',
    sortable: false,
    align: 'center',
    renderCell: (cellValues) => (
      <EditIcon onClick={() => editChargeDetailsHandler(cellValues)} />
    )
  }
];

export const permissionsColumns = (register) => [
  {
    field: 'moduleName',
    headerName: 'PERMISSION',
    headerAlign: 'center',
    align: 'center',
    sortable: false,
    flex: 1,
    renderCell: ({ row }) => (
      <HeadingMaster3>{row.moduleName}</HeadingMaster3>
    )
  },
  {
    field: 'view',
    headerName: 'VIEW',
    flex: 1,
    headerAlign: 'center',
    align: 'center',
    sortable: false,
    renderCell: ({ row }) => (
      row?.view ? (
        <FormControlLabel
          {...register(row.view.id.toString(), {
            onChange: (e) => {
              row.view.isHavepermission = e.target.checked;
            }
          })}
          control={<CheckboxPrimary id={row.view.id} defaultChecked={row.view.isHavepermission} disabled={row.view.disabled} />}
        />
      ) : null
    )
  },
  {
    field: 'create',
    headerName: 'CREATE',
    flex: 1,
    headerAlign: 'center',
    align: 'center',
    sortable: false,
    renderCell: ({ row }) => (
      row?.create ? (
        <FormControlLabel
          {...register(row.create.id.toString(), {
            onChange: (e) => {
              row.create.isHavepermission = e.target.checked;
            }
          })}
          control={<CheckboxPrimary id={row.create.id} defaultChecked={row.create.isHavepermission} disabled={row.create.disabled} />}
        />
      ) : null
    )
  },
  {
    field: 'update',
    headerName: 'UPDATE',
    flex: 1,
    headerAlign: 'center',
    align: 'center',
    sortable: false,
    renderCell: ({ row }) => (
      row?.update ? (
        <FormControlLabel
          {...register(row.update.id.toString(), {
            onChange: (e) => {
              row.update.isHavepermission = e.target.checked;
            }
          })}
          control={<CheckboxPrimary id={row.update.id} defaultChecked={row.update.isHavepermission} disabled={row.update.disabled} />}
        />
      ) : null
    )
  },
  {
    field: 'maker',
    headerName: 'MAKER',
    flex: 1,
    headerAlign: 'center',
    align: 'center',
    sortable: false,
    renderCell: ({ row }) => (
      row?.maker ? (
        <FormControlLabel
          {...register(row.maker.id.toString(), {
            onChange: (e) => {
              row.maker.isHavepermission = e.target.checked;
            }
          })}
          control={<CheckboxPrimary id={row.maker.id} defaultChecked={row.maker.isHavepermission} disabled={row.maker.disabled} />}
        />
      ) : null
    )
  },
  {
    field: 'checker',
    headerName: 'CHECKER',
    flex: 1,
    headerAlign: 'center',
    align: 'center',
    sortable: false,
    renderCell: ({ row }) => (
      row?.checker ? (
        <FormControlLabel
          {...register(row.checker.id.toString(), {
            onChange: (e) => {
              row.checker.isHavepermission = e.target.checked;
            }
          })}
          control={<CheckboxPrimary id={row.checker.id} defaultChecked={row.checker.isHavepermission} disabled={row.checker.disabled} />}
        />
      ) : null
    )
  },
];
