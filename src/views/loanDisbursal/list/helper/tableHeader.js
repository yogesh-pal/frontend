/* eslint-disable no-underscore-dangle */
import {
  SelectMenuStyle, TextFieldStyled, SelectStyled
} from '../../../../components/styledComponents';

export const columnFields = (popOverComponent) => [
  {
    field: 'customer_id',
    headerName: 'Customer ID',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'first_name',
    headerName: 'First Name',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'last_name',
    headerName: 'Last Name',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'loan_account_no',
    headerName: 'LAN',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'application_no',
    headerName: 'Application Number',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'application_date',
    headerName: 'Application Date',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'stageName',
    headerName: 'Application Stage',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'maker_branch',
    headerName: 'Branch ID',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'documents',
    headerName: 'Documents',
    minWidth: 50,
    sortable: false,
    flex: 1,
    renderCell: popOverComponent
  }
];

export const deviationFieldsColumns = (deviationDetails, setDeviationDetails) => [
  {
    field: 'deviation_type',
    headerName: 'Deviation Parameter',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'primary_checker_role',
    headerName: 'Role',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'checker_remarks',
    headerName: 'Justification *',
    minWidth: 100,
    sortable: false,
    flex: 1,
    editable: true,
    renderCell: (cellValues) => (
      cellValues.row.authorized_checker ? (
        <TextFieldStyled
          key={cellValues.row._id}
          id='filled-basic'
          label='Remarks'
          variant='filled'
          onChange={(e) => {
            const tempDeviation = [...deviationDetails];
            tempDeviation[cellValues.row.index].checker_remarks = e.target.value;
            setDeviationDetails([...tempDeviation]);
          }}
        />
      )
        : <span>{cellValues?.row?.checker_remarks}</span>
    ),
    renderEditCell: (cellValues) => (
      cellValues.row.authorized_checker ? (
        <TextFieldStyled
          key={cellValues.row._id}
          id='filled-basic'
          label='Remarks'
          variant='filled'
          onChange={(e) => {
            const tempDeviation = [...deviationDetails];
            tempDeviation[cellValues.row.index].checker_remarks = e.target.value;
            setDeviationDetails([...tempDeviation]);
          }}
        />
      )
        : <span>{cellValues?.row?.checker_remarks}</span>
    )
  },
  {
    field: 'decision',
    headerName: 'Decision',
    minWidth: 100,
    sortable: false,
    flex: 1,
    renderCell: (cellValues) => (cellValues.row.authorized_checker ? (
      <SelectStyled
        labelId='demo-simple-select-label'
        id='demo-simple-select'
        value={cellValues?.row?.currentStatus}
        label=''
        border='none'
        onChange={(e) => {
          const tempDeviation = [...deviationDetails];
          tempDeviation[cellValues.row.index].currentStatus = e.target.value;
          setDeviationDetails([...tempDeviation]);
        }}
      >
        <SelectMenuStyle value='PENDING'>PENDING</SelectMenuStyle>
        <SelectMenuStyle value='REJECT'>REJECT</SelectMenuStyle>
        <SelectMenuStyle value='APPROVE'>APPROVE</SelectMenuStyle>
      </SelectStyled>
    )
      : <span>{cellValues?.row?.currentStatus}</span>
    )

  },
];

export const deviationFieldsStatusColumns = [
  {
    field: 'deviation_type',
    headerName: 'Deviation Parameter',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'primary_checker_role',
    headerName: 'Role',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'checker_remarks',
    headerName: 'Justification',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'currentStatus',
    headerName: 'Decision',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
];
