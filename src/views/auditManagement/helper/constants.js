/* eslint-disable no-nested-ternary */
/* eslint-disable max-len */
import moment from 'moment';
import { Grid, FormHelperText, InputAdornment } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import styled from '@emotion/styled';
import {
  NAVIGATION, REGEX, IDENTIFIER, FUNCTION_IDENTIFIER
} from '../../../constants';
import {
  TextFieldStyled, SelectMenuStyle
} from '../../../components/styledComponents';
import { Service } from '../../../service';

const CustomDeleteIcon = styled(DeleteIcon)`
  color: red;
  cursor: pointer;
 `;
export const assignmentTableColumn = [
  {
    field: 'customerId',
    headerName: 'Customer ID',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'applicationNo',
    headerName: 'LAN',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'disb_date',
    headerName: 'Disb Date',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'firstName',
    headerName: 'First Name',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'lastName',
    headerName: 'Last Name',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'branchId',
    headerName: 'Branch ID',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'goldPouchNumber',
    headerName: 'Gold Pouch Number',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'auditStatus',
    headerName: 'Audit Status',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'auditor_type',
    headerName: 'Last Audited By',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'last_audit_type',
    headerName: 'Last Audit Type',
    minWidth: 100,
    sortable: false,
    flex: 1,
  }
];

export const caseTableColumn = [
  {
    field: 'customerId',
    headerName: 'Customer ID',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'applicationNo',
    headerName: 'LAN',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'disb_date',
    headerName: 'Disb Date',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'firstName',
    headerName: 'First Name',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'lastName',
    headerName: 'Last Name',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'branchId',
    headerName: 'Branch ID',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'goldPouchNumber',
    headerName: 'Gold Pouch Number',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'auditType',
    headerName: 'Audit Type',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'auditStatus',
    headerName: 'Audit Status',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'assignedTo',
    headerName: 'Assigned To',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'startDate',
    headerName: 'Start Date',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'endDate',
    headerName: 'End Date',
    minWidth: 100,
    sortable: false,
    flex: 1,
  }
];
export const auditDashboardNavigation = [
  { name: 'Dashboard', url: NAVIGATION.dashboard },
  { name: 'Audit Management', url: NAVIGATION.auditManagement }
];
export const navigationDetails = [
  ...auditDashboardNavigation,
  { name: 'Gold Audit', url: NAVIGATION.goldAudit }
];
export const cashAndPacketNavigationDetails = [
  ...auditDashboardNavigation,
  { name: 'Cash And Packet Audit', url: NAVIGATION.cashAndPacketAudit }
];

export const validation = {
  customer_id: {
    name: 'customer_id',
    validation: {
      isRequired: true,
      requiredMsg: 'Please enter customer ID',
      pattern: REGEX.ALPHANUMERICTRIMSPACE,
      patternMsg: 'Please enter valid customer ID.',
      maxLength: 50,
      maxLenMsg: 'Customer ID should not be more than 50 characters.',
    }
  },
  lan: {
    name: 'lan',
    validation: {
      isRequired: true,
      requiredMsg: 'Please enter customer LAN',
      maxLength: 50,
      maxLenMsg: 'LAN should not be more than 50 characters.',
      minLength: 10,
      minLenMsg: 'LAN should have at least 10 character.',
    }
  }
};

export const togglerGroup = {
  defaultValue: 'customer_id',
  values: [
    {
      name: 'Customer ID',
      value: 'customer_id',
    },
    {
      name: 'LAN',
      value: 'lan',
    }
  ]
};

export const assignmentFormConfig = (lanCount, branchId, internalAuditorGrouping, vendorListArray, onCancelHandler, availableAuditType) => {
  const auditorNameHandler = (values, callback, index, setValue) => {
    try {
      if (values?.auditorType === 'Internal') {
        const sortedData = (Object.keys(internalAuditorGrouping)).sort((a, b) => ((a > b) ? 1 : ((b > a) ? -1 : 0)));
        callback({
          internalAuditorSubType: sortedData,
          internalAuditorName: []
        });
      } else {
        const vendorOption = [];
        vendorListArray.map((item) => vendorOption.push({ label: `${item?.vendorName} (${item?.vendorCode})`, value: item?.vendorCode }));
        const sortedData = vendorOption.sort((a, b) => ((a.label.toLowerCase() > b.label.toLowerCase()) ? 1 : ((b.label.toLowerCase() > a.label.toLowerCase()) ? -1 : 0)));
        callback({
          vendorName: sortedData
        });
      }
      setValue('internalAuditorSubType', null);
      setValue('internalAuditorName', null);
      setValue('externalAuditorName', null);
      setValue('vendorName', null);
    } catch (e) {
      console.log('Error', e);
    }
  };
  const auditorSubTypeHandler = (values, callback, index, setValue) => {
    try {
      const auditorOption = [];
      if (values?.internalAuditorSubType) {
        internalAuditorGrouping[values?.internalAuditorSubType].map((item) => auditorOption.push({ label: `${item?.auditorName} (${item?.auditorCode})`, value: item?.auditorCode }));
      }
      callback({
        internalAuditorName: auditorOption
      });
      setValue('internalAuditorName', null);
    } catch (e) {
      console.log('Error', e);
    }
  };
  const vendorNameHandler = async (values, callback, index, setValue) => {
    try {
      const externalAuditorList = [];
      const { data } = await Service.get(`${process.env.REACT_APP_USER_SERVICE}/users/auditor/list?sub_department=Audit - GL&vendor_code=${values?.vendorName}&page=1&page_size=500`);
      if (data?.results && data.results.length) {
        data.results.sort((a, b) => ((a.emp_name.toLowerCase() > b.emp_name.toLowerCase()) ? 1 : ((b.emp_name.toLowerCase() > a.emp_name.toLowerCase()) ? -1 : 0)));
        data.results.forEach((item) => {
          if (item?.goldloan_status) {
            externalAuditorList.push({
              auditorName: item?.emp_name,
              auditorCode: item?.emp_code
            });
          }
        });
      }
      const auditorOption = [];
      externalAuditorList.map((item) => auditorOption.push({ label: `${item?.auditorName} (${item?.auditorCode})`, value: item?.auditorCode }));
      callback({
        externalAuditorName: auditorOption
      });
      setValue('externalAuditorName', null);
    } catch (e) {
      console.log('Error', e);
    }
  };
  const startDateHandler = (values, callback, index, setValue) => {
    setValue('endDate', '');
  };

  // const fullAudit = [{ label: 'Full Audit', value: 'FULL' }];

  // const auditType = [
  //   ...fullAudit,
  //   { label: 'TARE Weight Audit', value: 'TARE' },
  //   { label: 'Gold Verification', value: 'GOLD_VERIFICATION' }
  // ];

  return {
    form: [
      {
        variant: 'outlined',
        input: [
          {
            name: 'lanCount',
            label: 'LAN Count',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            disabled: true,
            defaultValue: lanCount
          },
          {
            name: 'branchId',
            label: 'Branch ID',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            disabled: true,
            defaultValue: branchId
          },
          {
            name: 'auditType',
            label: 'Audit Type',
            type: 'text',
            identifier: IDENTIFIER.SELECT,
            option: [...availableAuditType],
            validation: {
              isRequired: true,
              requiredMsg: 'Please select audit type.'
            },
          },
          {
            name: 'auditorType',
            label: 'Auditor Type',
            type: 'text',
            identifier: IDENTIFIER.SELECT,
            option: ['Internal', 'External'],
            customFunction: auditorNameHandler,
            functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
            functionChangeBaseOn: 'auditorType',
            setValueArr: [
              {
                name: 'internalAuditorSubType',
                apiKey: 'internalAuditorSubType'
              },
              {
                name: 'internalAuditorName',
                apiKey: 'internalAuditorName'
              },
              {
                name: 'vendorName',
                apiKey: 'vendorName'
              }
            ],
            validation: {
              isRequired: true,
              requiredMsg: 'Please select auditor type.'
            },
          },
          {
            name: 'internalAuditorSubType',
            label: 'Auditor Sub-Type',
            type: 'text',
            identifier: IDENTIFIER.SELECT,
            option: [],
            customFunction: auditorSubTypeHandler,
            functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
            functionChangeBaseOn: 'internalAuditorSubType',
            setValueArr: [
              {
                name: 'internalAuditorName',
                apiKey: 'internalAuditorName'
              }
            ],
            condition: {
              type: 'showOnValue',
              baseOn: 'auditorType',
              baseValue: 'Internal'
            },
            validation: {
              isRequired: true,
              requiredMsg: 'Please select auditor sub-type.'
            },
          },
          {
            name: 'internalAuditorName',
            label: 'Auditor Name',
            type: 'text',
            identifier: IDENTIFIER.AUTOCOMPLETE,
            option: [],
            condition: {
              type: 'showOnValue',
              baseOn: 'auditorType',
              baseValue: 'Internal'
            },
            validation: {
              isRequired: true,
              requiredMsg: 'Please select auditor name.'
            },
          },
          {
            name: 'vendorName',
            label: 'Vendor Name',
            type: 'text',
            identifier: IDENTIFIER.SELECT,
            option: [],
            customFunction: vendorNameHandler,
            functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
            functionChangeBaseOn: 'vendorName',
            setValueArr: [
              {
                name: 'externalAuditorName',
                apiKey: 'externalAuditorName'
              }
            ],
            condition: {
              type: 'showOnValue',
              baseOn: 'auditorType',
              baseValue: 'External'
            },
            validation: {
              isRequired: true,
              requiredMsg: 'Please select vendor name.'
            },
          },
          {
            name: 'externalAuditorName',
            label: 'Auditor Name',
            type: 'text',
            identifier: IDENTIFIER.AUTOCOMPLETE,
            option: [],
            condition: {
              type: 'showOnValue',
              baseOn: 'auditorType',
              baseValue: 'External'
            },
            validation: {
              isRequired: true,
              requiredMsg: 'Please select auditor name.'
            },
          },
          {
            name: 'startDate',
            label: 'Start Date',
            type: 'date',
            identifier: IDENTIFIER.DATEPICKER,
            onDateChange: {
              endDate: {
                disablePrevious: true,
                disableNextDays: 14,
              }
            },
            customFunction: startDateHandler,
            functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
            functionChangeBaseOn: 'startDate',
            defaultValue: '',
            isPastDateDisable: true,
            readonly: true,
            greaterDateDisable: moment().add(10, 'days'),
            validation: {
              isRequired: true,
              requiredMsg: 'Please select start date.'
            }
          },
          {
            name: 'endDate',
            label: 'End Date',
            type: 'date',
            identifier: IDENTIFIER.DATEPICKER,
            defaultValue: '',
            readonly: true,
            validation: {
              isRequired: true,
              requiredMsg: 'Please select end date.'
            }
          }
        ],
        alignment: {
          xs: 12,
          sm: 12,
          md: 6,
          lg: 6,
          xl: 6
        },
        buttonDetails: {
          alignment: 'center',
          name: 'Assign',
          type: 'submit',
          isShowCustomButton: {
            name: 'Cancel',
            customFunction: onCancelHandler
          }
        },
      }
    ],
    stepper: {
      isRemovePadding: true
    },
  };
};

export const AUDITSTATUS = {
  AUDNOTOK1: 'AUDNOTOK1',
  AUDNOTOK2: 'AUDNOTOK2',
  AUDLOWPURITY: 'AUDLOWPURITY'
};

export const auditStatusArray = [
  { label: 'All', value: 'all' },
  { label: 'Assignment Pending', value: 'ASSPEN' },
  { label: 'Audit Pending', value: 'AUDPEN' },
  { label: 'Audit Completed', value: 'AUDCOM' },
  { label: 'Audit Defaulted', value: 'AUDDFT' },
  { label: 'Part Released', value: 'AUDPART' },
  { label: 'Audit Not Ok-1', value: 'AUDNOTOK1' },
  { label: 'Audit Not Ok-2', value: 'AUDNOTOK2' },
  { label: 'Audit Not Ok-R', value: 'AUDNOTOKR' },
  { label: 'Low Purity Cases', value: 'AUDLOWPURITY' },
];

export const auditTypeArray = [
  { label: 'All', value: 'all' },
  { label: 'Full Audit', value: 'FULL' },
  { label: 'TARE Weight Audit', value: 'TARE' },
  { label: 'Gold Verification', value: 'GOLD_VERIFICATION' }
];

export const auditTypeEnum = {
  NA: 'NA',
  FULL: 'Full Audit',
  TARE: 'TARE Weight Audit',
  GOLD_VERIFICATION: 'Gold Verification'
};

export const getAuditStatus = (status) => {
  const index = auditStatusArray.findIndex((item) => item.value === status);
  if (index !== -1) {
    return auditStatusArray[index].label;
  }
  return 'NA';
};

export const purityOptionArray = [
  { label: '22K', value: '22' },
  { label: '21K', value: '21' },
  { label: '20K', value: '20' },
  { label: '19K', value: '19' },
  { label: '18K', value: '18' },
];

export const unacceptablepurityOptionArray = [
  { label: '24K', value: '24' },
  { label: '22K', value: '22' },
  { label: '21K', value: '21' },
  { label: '20K', value: '20' },
  { label: '19K', value: '19' },
  { label: '18K', value: '18' },
];

export const spuriousFormFields = (data, register, setValue, errors, itemNumber, handleSpuriousDelete, nonSpuriousFormLength) => {
  const renderError = (name) => {
    if (errors?.[name]) {
      return <FormHelperText error>{errors?.[name].message}</FormHelperText>;
    }
  };

  return (
    <Grid container>
      <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
        <TextFieldStyled
          label='Item Name'
          disabled
          defaultValue={data?.name}
        />
      </Grid>
      <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
        <TextFieldStyled
          label='Count*'
          {...register(`spurious_count_${itemNumber}`, {
            onChange: (e) => setValue(`spurious_count_${itemNumber}`, e.target.value, { shouldValidate: true }),
            required: 'Please enter count',
            min: { value: 1, message: 'Count should be greater than 0' },
            pattern: { value: REGEX.NUMBER, message: 'Please enter numeric digits only' }
          })}
        />
        {renderError(`spurious_count_${itemNumber}`)}
      </Grid>
      <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
        <TextFieldStyled
          label='Total Weight*'
          InputProps={{
            endAdornment: <InputAdornment position='end'>gm</InputAdornment>,
          }}
          {...register(`spurious_totalWeight_${itemNumber}`, {
            onChange: (e) => setValue(`spurious_totalWeight_${itemNumber}`, e.target.value, { shouldValidate: true }),
            required: 'Please enter total weight',
            min: { value: 0.01, message: 'Total weight should be greater than 0' },
            pattern: { value: REGEX.TWODIGITDECIMAL, message: 'Please enter valid two digit decimal value only' }
          })}
        />
        {renderError(`spurious_totalWeight_${itemNumber}`)}
      </Grid>
      <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
        <TextFieldStyled
          label='Beads/Stone Weight'
          InputProps={{
            endAdornment: <InputAdornment position='end'>gm</InputAdornment>,
          }}
          disabled
          defaultValue='0'
        />
      </Grid>
      <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
        <TextFieldStyled
          label='Purity'
          disabled
          defaultValue='0'
        />
      </Grid>
      <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
        <TextFieldStyled
          label='Spurious Flag'
          disabled
          defaultValue='Yes'
        />
      </Grid>
      <Grid item xs={12} sm={5} md={4} lg={3} xl={3} padding='10px'>
        <TextFieldStyled
          label='Bentex*'
          select
          {...register(`bentex_${itemNumber}`, {
            onChange: (e) => {
              setValue(`bentex_${itemNumber}`, e.target.value, { shouldValidate: true });
            },
            required: 'Please select Bentex'
          })}
        >
          <SelectMenuStyle key='yes' value='Yes'>Yes</SelectMenuStyle>
          <SelectMenuStyle key='no' value='No'>No</SelectMenuStyle>
        </TextFieldStyled>
        {renderError(`bentex_${itemNumber}`)}
      </Grid>
      <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
        <TextFieldStyled
          label='Remarks*'
          multiline
          maxRows={3}
          {...register(`spurious_remarks_${itemNumber}`, {
            onChange: (e) => {
              if (e.target.value.trim().length) {
                setValue(`spurious_remarks_${itemNumber}`, e.target.value, { shouldValidate: true });
              } else {
                setValue(`spurious_remarks_${itemNumber}`, null, { shouldValidate: true });
              }
            },
            required: 'Please enter remark',
            maxLength: { value: 1000, message: 'Maximum 1000 characters allowed' }
          })}
        />
        {renderError(`spurious_remarks_${itemNumber}`)}
      </Grid>
      {
        nonSpuriousFormLength || itemNumber > 1 ? (
          <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px' display='flex' alignItems='center'>
            <CustomDeleteIcon onClick={() => handleSpuriousDelete(itemNumber)} />
          </Grid>
        ) : null
      }
    </Grid>
  );
};

export const unacceptableFormFields = (data, register, getValues, setValue, errors, itemNumber, handleUnacceptableDelete, UnacceptableFormLength) => {
  const renderError = (name) => {
    if (errors?.[name]) {
      return <FormHelperText error>{errors?.[name].message}</FormHelperText>;
    }
  };

  return (
    <Grid container>
      <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
        <TextFieldStyled
          label='Item Name'
          disabled
          defaultValue={data?.name}
        />
      </Grid>
      <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
        <TextFieldStyled
          label='Count*'
          {...register(`unacceptable_count_${itemNumber}`, {
            onChange: (e) => setValue(`unacceptable_count_${itemNumber}`, e.target.value, { shouldValidate: true }),
            required: 'Please enter count',
            min: { value: 1, message: 'Count should be greater than 0' },
            pattern: { value: REGEX.NUMBER, message: 'Please enter numeric digits only' }
          })}
        />
        {renderError(`unacceptable_count_${itemNumber}`)}
      </Grid>
      <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
        <TextFieldStyled
          label='Total Weight*'
          InputProps={{
            endAdornment: <InputAdornment position='end'>gm</InputAdornment>,
          }}
          {...register(`unacceptable_totalWeight_${itemNumber}`, {
            onChange: (e) => setValue(`unacceptable_totalWeight_${itemNumber}`, e.target.value, { shouldValidate: true }),
            required: 'Please enter total weight',
            min: { value: 0.01, message: 'Total weight should be greater than 0' },
            pattern: { value: REGEX.TWODIGITDECIMAL, message: 'Please enter valid two digit decimal value only' }
          })}
        />
        {renderError(`unacceptable_totalWeight_${itemNumber}`)}
      </Grid>
      <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
        <TextFieldStyled
          label='Beads/Stone Weight'
          InputProps={{
            endAdornment: <InputAdornment position='end'>gm</InputAdornment>,
          }}
          disabled
          defaultValue='0'
        />
      </Grid>
      <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
        <TextFieldStyled
          label='Purity'
          disabled
          defaultValue='0'
        />
      </Grid>
      <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
        <TextFieldStyled
          label='Unacceptable Flag'
          disabled
          defaultValue='Yes'
        />
      </Grid>
      <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
        <TextFieldStyled
          label='Remarks*'
          multiline
          maxRows={3}
          {...register(`unacceptable_remarks_${itemNumber}`, {
            onChange: (e) => {
              if (e.target.value.trim().length) {
                setValue(`unacceptable_remarks_${itemNumber}`, e.target.value, { shouldValidate: true });
              } else {
                setValue(`unacceptable_remarks_${itemNumber}`, null, { shouldValidate: true });
              }
            },
            required: 'Please enter remark',
            maxLength: { value: 1000, message: 'Maximum 1000 characters allowed' }
          })}
        />
        {renderError(`unacceptable_remarks_${itemNumber}`)}
      </Grid>
      {
        UnacceptableFormLength || itemNumber > 1 ? (
          <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px' display='flex' alignItems='center'>
            <CustomDeleteIcon onClick={() => handleUnacceptableDelete(itemNumber)} />
          </Grid>
        ) : null
      }
    </Grid>
  );
};

export const acceptableFormFields = (data, register, setValue, getValues, setError, errors, itemNumber, handleAcceptableDelete, acceptableFormLength) => {
  const renderError = (name) => {
    if (errors?.[name]) {
      return <FormHelperText error>{errors?.[name].message}</FormHelperText>;
    }
  };

  return (
    <Grid container>
      <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
        <TextFieldStyled
          label='Item Name*'
          disabled
          defaultValue={data?.name}
        />
      </Grid>
      <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
        <TextFieldStyled
          label='Count*'
          {...register(`acceptable_count_${itemNumber}`, {
            onChange: (e) => setValue(`acceptable_count_${itemNumber}`, e.target.value, { shouldValidate: true }),
            required: 'Please enter count',
            min: { value: 1, message: 'Count should be greater than 0' },
            pattern: { value: REGEX.NUMBER, message: 'Please enter numeric digits only' }
          })}
        />
        {renderError(`acceptable_count_${itemNumber}`)}
      </Grid>
      <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
        <TextFieldStyled
          label='Total Weight*'
          InputProps={{
            endAdornment: <InputAdornment position='end'>gm</InputAdornment>,
          }}
          {...register(`acceptable_totalWeight_${itemNumber}`, {
            onChange: (e) => setValue(`acceptable_totalWeight_${itemNumber}`, e.target.value, { shouldValidate: true }),
            required: 'Please enter total weight',
            min: { value: 0.01, message: 'Total weight should be greater than 0' },
            pattern: { value: REGEX.TWODIGITDECIMAL, message: 'Please enter valid two digit decimal value only' }
          })}
        />
        {renderError(`acceptable_totalWeight_${itemNumber}`)}
      </Grid>
      <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
        <TextFieldStyled
          label='Beads/Stone Weight*'
          InputProps={{
            endAdornment: <InputAdornment position='end'>gm</InputAdornment>,
          }}
          {...register(`acceptable_beads_stone_weight_${itemNumber}`, {
            onChange: (e) => setValue(`acceptable_beads_stone_weight_${itemNumber}`, e.target.value, { shouldValidate: true }),
            required: 'Please enter beads/stone weight (in grams)',
            min: { value: 0.00, message: 'Beads/Stone weight must be greater than or equal to 0' },
            max: { value: parseFloat(getValues(`acceptable_totalWeight_${itemNumber}`)) - 0.01, message: 'Beads/Stone weight can not be greater than or equal to total weight' },
            pattern: { value: REGEX.TWODIGITDECIMAL, message: 'Please enter valid two digit decimal value only' }
          })}
        />
        {renderError(`acceptable_beads_stone_weight_${itemNumber}`)}
      </Grid>
      <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
        <TextFieldStyled
          label='Purity*'
          select
          {...register(`acceptable_purity_${itemNumber}`, { required: 'Please select purity (in carat)' })}
        >
          {purityOptionArray.map((option) => (
            <SelectMenuStyle
              key={option.value}
              value={option.value}
            >
              {option.label}
            </SelectMenuStyle>
          ))}
        </TextFieldStyled>
        {renderError(`acceptable_purity_${itemNumber}`)}
      </Grid>
      <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
        <TextFieldStyled
          label='Unacceptable Flag'
          disabled
          defaultValue='No'
        />
      </Grid>
      <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
        <TextFieldStyled
          label='Remarks*'
          multiline
          maxRows={3}
          {...register(`acceptable_remarks_${itemNumber}`, {
            onChange: (e) => {
              if (e.target.value.trim().length) {
                setValue(`acceptable_remarks_${itemNumber}`, e.target.value, { shouldValidate: true });
              } else {
                setValue(`acceptable_remarks_${itemNumber}`, null, { shouldValidate: true });
              }
            },
            required: 'Please enter remark',
            maxLength: { value: 1000, message: 'Maximum 1000 characters allowed' }
          })}
        />
        {renderError(`acceptable_remarks_${itemNumber}`)}
      </Grid>
      {
        acceptableFormLength || itemNumber > 1 ? (
          <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px' display='flex' alignItems='center'>
            <CustomDeleteIcon onClick={() => handleAcceptableDelete(itemNumber)} />
          </Grid>
        ) : null
      }
    </Grid>
  );
};

export const spuriousReadOnlyFormFields = (data) => (
  <Grid container>
    <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
      <TextFieldStyled
        label='Item Name'
        disabled
        defaultValue={data?.name}
      />
    </Grid>
    <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
      <TextFieldStyled
        label='Count'
        disabled
        defaultValue={data?.item_count}
      />
    </Grid>
    <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
      <TextFieldStyled
        label='Total Weight'
        InputProps={{
          endAdornment: <InputAdornment position='end'>gm</InputAdornment>,
        }}
        disabled
        defaultValue={data?.total_weight_gm}
      />
    </Grid>
    <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
      <TextFieldStyled
        label='Beads/Stone Weight'
        InputProps={{
          endAdornment: <InputAdornment position='end'>gm</InputAdornment>,
        }}
        disabled
        defaultValue='0'
      />
    </Grid>
    <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
      <TextFieldStyled
        label='Purity'
        disabled
        defaultValue='0'
      />
    </Grid>
    <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
      <TextFieldStyled
        label='Spurious Flag'
        disabled
        defaultValue='Yes'
      />
    </Grid>
    <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
      <TextFieldStyled
        label='Bentex'
        disabled
        defaultValue={data?.bentex}
      />
    </Grid>
    <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
      <TextFieldStyled
        label='Remarks'
        multiline
        maxRows={3}
        disabled
        defaultValue={data?.remarks}
      />
    </Grid>
  </Grid>
);

export const unacceptableReadOnlyFormFields = (data) => (
  <Grid container>
    <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
      <TextFieldStyled
        label='Item Name'
        disabled
        defaultValue={data?.name}
      />
    </Grid>
    <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
      <TextFieldStyled
        label='Count'
        disabled
        defaultValue={data?.item_count}
      />
    </Grid>
    <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
      <TextFieldStyled
        label='Total Weight'
        InputProps={{
          endAdornment: <InputAdornment position='end'>gm</InputAdornment>,
        }}
        disabled
        defaultValue={data?.total_weight_gm}
      />
    </Grid>
    <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
      <TextFieldStyled
        label='Beads/Stone Weight'
        InputProps={{
          endAdornment: <InputAdornment position='end'>gm</InputAdornment>,
        }}
        disabled
        defaultValue='0'
      />
    </Grid>
    <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
      <TextFieldStyled
        label='Purity'
        disabled
        defaultValue='0'
      />
    </Grid>
    <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
      <TextFieldStyled
        label='Unacceptable Flag'
        disabled
        defaultValue='Yes'
      />
    </Grid>
    <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
      <TextFieldStyled
        label='Bentex'
        disabled
        defaultValue={data?.bentex}
      />
    </Grid>
    <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
      <TextFieldStyled
        label='Remarks'
        multiline
        maxRows={3}
        disabled
        defaultValue={data?.remarks}
      />
    </Grid>
  </Grid>
);

export const nonSpuriousFormFields = (data, register, setValue, getValues, setError, errors, itemNumber, handleNonSpuriousDelete, spuriousFormLength) => {
  const renderError = (name) => {
    if (errors?.[name]) {
      return <FormHelperText error>{errors?.[name].message}</FormHelperText>;
    }
  };

  return (
    <Grid container>
      <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
        <TextFieldStyled
          label='Item Name*'
          disabled
          defaultValue={data?.name}
        />
      </Grid>
      <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
        <TextFieldStyled
          label='Count*'
          {...register(`nonSpurious_count_${itemNumber}`, {
            onChange: (e) => setValue(`nonSpurious_count_${itemNumber}`, e.target.value, { shouldValidate: true }),
            required: 'Please enter count',
            min: { value: 1, message: 'Count should be greater than 0' },
            pattern: { value: REGEX.NUMBER, message: 'Please enter numeric digits only' }
          })}
        />
        {renderError(`nonSpurious_count_${itemNumber}`)}
      </Grid>
      <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
        <TextFieldStyled
          label='Total Weight*'
          InputProps={{
            endAdornment: <InputAdornment position='end'>gm</InputAdornment>,
          }}
          {...register(`nonSpurious_totalWeight_${itemNumber}`, {
            onChange: (e) => setValue(`nonSpurious_totalWeight_${itemNumber}`, e.target.value, { shouldValidate: true }),
            required: 'Please enter total weight',
            min: { value: 0.01, message: 'Total weight should be greater than 0' },
            pattern: { value: REGEX.TWODIGITDECIMAL, message: 'Please enter valid two digit decimal value only' }
          })}
        />
        {renderError(`nonSpurious_totalWeight_${itemNumber}`)}
      </Grid>
      <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
        <TextFieldStyled
          label='Beads/Stone Weight*'
          InputProps={{
            endAdornment: <InputAdornment position='end'>gm</InputAdornment>,
          }}
          {...register(`nonSpurious_beads_stone_weight_${itemNumber}`, {
            onChange: (e) => setValue(`nonSpurious_beads_stone_weight_${itemNumber}`, e.target.value, { shouldValidate: true }),
            required: 'Please enter beads/stone weight (in grams)',
            min: { value: 0.00, message: 'Beads/Stone weight must be greater than or equal to 0' },
            max: { value: parseFloat(getValues(`nonSpurious_totalWeight_${itemNumber}`)) - 0.01, message: 'Beads/Stone weight can not be greater than or equal to total weight' },
            pattern: { value: REGEX.TWODIGITDECIMAL, message: 'Please enter valid two digit decimal value only' }
          })}
        />
        {renderError(`nonSpurious_beads_stone_weight_${itemNumber}`)}
      </Grid>
      <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
        <TextFieldStyled
          label='Purity*'
          select
          {...register(`nonSpurious_purity_${itemNumber}`, { required: 'Please select purity (in carat)' })}
        >
          {purityOptionArray.map((option) => (
            <SelectMenuStyle
              key={option.value}
              value={option.value}
            >
              {option.label}
            </SelectMenuStyle>
          ))}
        </TextFieldStyled>
        {renderError(`nonSpurious_purity_${itemNumber}`)}
      </Grid>
      <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
        <TextFieldStyled
          label='Spurious Flag'
          disabled
          defaultValue='No'
        />
      </Grid>
      <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
        <TextFieldStyled
          label='Remarks*'
          multiline
          maxRows={3}
          {...register(`nonSpurious_remarks_${itemNumber}`, {
            onChange: (e) => {
              if (e.target.value.trim().length) {
                setValue(`nonSpurious_remarks_${itemNumber}`, e.target.value, { shouldValidate: true });
              } else {
                setValue(`nonSpurious_remarks_${itemNumber}`, null, { shouldValidate: true });
              }
            },
            required: 'Please enter remark',
            maxLength: { value: 1000, message: 'Maximum 1000 characters allowed' }
          })}
        />
        {renderError(`nonSpurious_remarks_${itemNumber}`)}
      </Grid>
      {
        spuriousFormLength || itemNumber > 1 ? (
          <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px' display='flex' alignItems='center'>
            <CustomDeleteIcon onClick={() => handleNonSpuriousDelete(itemNumber)} />
          </Grid>
        ) : null
      }
    </Grid>
  );
};

export const acceptableReadOnlyFormFields = (data) => (
  <Grid container>
    <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
      <TextFieldStyled
        label='Item Name'
        disabled
        defaultValue={data?.name}
      />
    </Grid>
    <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
      <TextFieldStyled
        label='Count'
        disabled
        defaultValue={data?.item_count}
      />
    </Grid>
    <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
      <TextFieldStyled
        label='Total Weight'
        InputProps={{
          endAdornment: <InputAdornment position='end'>gm</InputAdornment>,
        }}
        disabled
        defaultValue={data?.total_weight_gm}
      />
    </Grid>
    <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
      <TextFieldStyled
        label='Beads/Stone Weight'
        InputProps={{
          endAdornment: <InputAdornment position='end'>gm</InputAdornment>,
        }}
        disabled
        defaultValue={data?.stone_weight_gm}
      />
    </Grid>
    <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
      <TextFieldStyled
        label='Purity'
        disabled
        defaultValue={data?.purity}
        select
      >
        {purityOptionArray.map((option) => (
          <SelectMenuStyle
            key={option.value}
            value={option.value}
          >
            {option.label}
          </SelectMenuStyle>
        ))}
      </TextFieldStyled>
    </Grid>
    <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
      <TextFieldStyled
        label='Spurious Flag'
        disabled
        defaultValue='No'
      />
    </Grid>
    <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
      <TextFieldStyled
        label='Bentex'
        disabled
        defaultValue={data?.bentex}
      />
    </Grid>
    <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
      <TextFieldStyled
        label='Remarks'
        multiline
        maxRows={3}
        disabled
        defaultValue={data?.remarks}
      />
    </Grid>
  </Grid>
);

export const nonSpuriousReadOnlyFormFields = (data) => (
  <Grid container>
    <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
      <TextFieldStyled
        label='Item Name'
        disabled
        defaultValue={data?.name}
      />
    </Grid>
    <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
      <TextFieldStyled
        label='Count'
        disabled
        defaultValue={data?.item_count}
      />
    </Grid>
    <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
      <TextFieldStyled
        label='Total Weight'
        InputProps={{
          endAdornment: <InputAdornment position='end'>gm</InputAdornment>,
        }}
        disabled
        defaultValue={data?.total_weight_gm}
      />
    </Grid>
    <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
      <TextFieldStyled
        label='Beads/Stone Weight'
        InputProps={{
          endAdornment: <InputAdornment position='end'>gm</InputAdornment>,
        }}
        disabled
        defaultValue={data?.stone_weight_gm}
      />
    </Grid>
    <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
      <TextFieldStyled
        label='Purity'
        disabled
        defaultValue={data?.purity}
        select
      >
        {purityOptionArray.map((option) => (
          <SelectMenuStyle
            key={option.value}
            value={option.value}
          >
            {option.label}
          </SelectMenuStyle>
        ))}
      </TextFieldStyled>
    </Grid>
    <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
      <TextFieldStyled
        label='Spurious Flag'
        disabled
        defaultValue='No'
      />
    </Grid>
    <Grid item xl={3} lg={3} md={12} sm={12} xs={12} padding='10px'>
      <TextFieldStyled
        label='Remarks'
        multiline
        maxRows={3}
        disabled
        defaultValue={data?.remarks}
      />
    </Grid>
  </Grid>
);

export const detailsCorrectFormConfig = (data) => ({
  form: [
    {
      variant: 'outlined',
      input: [
        {
          name: 'itemName',
          label: 'Item Name',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          disabled: true,
          defaultValue: data?.name
        },
        {
          name: 'count',
          label: 'Count',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          validation: {
            isRequired: true,
            requiredMsg: 'Please enter count',
            min: 1,
            minMsg: 'Count should be greater than 0',
            pattern: REGEX.NUMBER,
            patternMsg: 'Please enter numeric digits only'
          }
        },
        {
          name: 'totalWeight',
          label: 'Total Weight',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          InputProps: {
            text: 'gm',
            possition: 'end'
          },
          validation: {
            isRequired: true,
            requiredMsg: 'Please enter total weight',
            min: 0.01,
            minMsg: 'Total weight should be greater than 0',
            pattern: REGEX.TWODIGITDECIMAL,
            patternMsg: 'Please enter valid two digit decimal value only'
          }
        }
      ],
      alignment: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 6,
        xl: 6
      },
      buttonDetails: {
        alignment: 'center',
        name: 'Submit',
        type: 'submit'
      },
    }
  ],
  stepper: {
    isRemovePadding: true
  },
});

export const handleConfirmationonSubmit = (data, spuriousArray, nonSpuriousArray) => {
  let isConfirm = false;
  let dataToCompare = {
    item_count: data?.item_count,
    total_weight_gm: data?.total_weight_gm
  };
  if (data?.are_details_incorrect) {
    dataToCompare = {
      item_count: data?.auditor_findings.item_count,
      total_weight_gm: data?.auditor_findings.total_weight_gm
    };
  }
  const newFindings = {
    item_count: 0,
    total_weight_gm: 0,
    stone_weight_gm: 0
  };
  spuriousArray.forEach((item) => {
    newFindings.item_count += item.item_count;
    newFindings.total_weight_gm += item.total_weight_gm;
  });
  nonSpuriousArray.forEach((item) => {
    newFindings.item_count += item.item_count;
    newFindings.total_weight_gm += item.total_weight_gm;
    newFindings.stone_weight_gm += item.stone_weight_gm;
  });
  if ((newFindings.item_count > dataToCompare?.item_count) && (newFindings.total_weight_gm > dataToCompare?.total_weight_gm) && (newFindings.stone_weight_gm > dataToCompare?.total_weight_gm)) {
    isConfirm = window.confirm('You have put Count, Total Weight and Beads/Stone Weight more than the original Count and Total Weight.\nAre you sure you want to submit the Collateral Details?');
  } else if ((newFindings.item_count > dataToCompare?.item_count) && (newFindings.total_weight_gm > dataToCompare?.total_weight_gm)) {
    isConfirm = window.confirm('You have put Count and Total Weight more than the original Count and Total Weight.\nAre you sure you want to submit the Collateral Details?');
  } else if ((newFindings.item_count > dataToCompare?.item_count) && (newFindings.stone_weight_gm > dataToCompare?.total_weight_gm)) {
    isConfirm = window.confirm('You have put Count and Beads/Stone Weight more than the original Count and Total Weight.\nAre you sure you want to submit the Collateral Details?');
  } else if ((newFindings.item_count > dataToCompare?.item_count)) {
    isConfirm = window.confirm('You have put Count more than the original Count.\nAre you sure you want to submit the Collateral Details?');
  } else if ((newFindings.total_weight_gm > dataToCompare?.total_weight_gm)) {
    isConfirm = window.confirm('You have put Total Weight more than the original Total Weight.\nAre you sure you want to submit the Collateral Details?');
  } else if (newFindings.stone_weight_gm > dataToCompare?.total_weight_gm) {
    isConfirm = window.confirm('You have put Beads/Stone Weight more than the original Beads/Stone Weight.\nAre you sure you want to submit the Collateral Details?');
  } else {
    isConfirm = window.confirm('Are you sure you want to submit the Collateral Details?');
  }
  return isConfirm;
};
