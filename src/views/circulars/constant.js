import { IDENTIFIER } from '../../constants';

export const businessTypeOptions = [
  { label: 'Security', value: 1 },
  { label: 'Policy', value: 2 },
  { label: 'SOP - Sales', value: 3 },
  { label: 'SOP - Operations', value: 4 },
  { label: 'SOP - Audit', value: 5 },
  { label: 'Risk', value: 6 },
  { label: 'Incentive', value: 7 },
  { label: 'Others', value: 8 }
];

export const formConfig = {
  form: [
    {
      variant: 'outlined',
      input: [
        {
          name: 'business_type',
          label: 'Circular Category',
          defaultValue: '',
          type: 'select',
          identifier: IDENTIFIER.SELECT,
          multiSelect: false,
          option: businessTypeOptions,
          validation: {
            isRequired: true,
            requiredMsg: 'Please select circular category'
          }
        },
        {
          name: 'subject',
          type: 'text',
          label: 'Subject',
          identifier: IDENTIFIER.INPUTTEXT,
          validation: {
            isRequired: true,
            requiredMsg: 'Please enter subject'
          }
        },
        {
          name: 'files',
          type: 'file',
          label: 'Upload Document (Max size 5 MB)',
          isMulti: false,
          defaultValue: null,
          fileType: 'application/pdf',
          identifier: IDENTIFIER.FILE,
          validation: {
            isRequired: true,
            requiredMsg: 'Please upload document',
          },
          fileSize: 5
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
        name: 'Add Circular',
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

export const circularStaticColumns = [
  {
    field: 'circular_number',
    headerName: 'Circular No.',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'subject',
    headerName: 'Subject',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'created_at',
    headerName: 'Uploaded Date',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'business_type',
    headerName: 'Circular Category',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'status',
    headerName: 'Status',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
];
