import React from 'react';
import {
  Grid
} from '@mui/material';
import TextField from '@mui/material/TextField';
import styled from '@emotion/styled';
import {
  TextFieldStyled, AutoCompleteStyled
} from '../../../components/styledComponents';

const Li = styled.li`
    color: #502a74;
    &:hover{
      background-color: #502a741a !important;
    }
  `;

const FormProccessAudit = ({
  branchCodes,
  selectedBranch,
  name,
  empCode,
  branchName,
  branchDetails,
  setBranchName
}) => (
  <Grid container spacing={2} padding='0 20px 20px 20px'>
    <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>

      <AutoCompleteStyled
        disablePortal
        disableClearable
        id='demo-simple-select-label'
        options={branchCodes}
        defaultValue={selectedBranch}
        onChange={(event, value) => {
          setBranchName({
            name: branchDetails[value],
            branchCode: value
          });
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label='Branch ID'
          />
        )}
        renderOption={(props, option) => (
          <Li
            {...props}
          >
            {option}
          </Li>
        )}
      />

    </Grid>
    <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
      <TextFieldStyled
        id='outlined-basic'
        label='Branch Name'
        variant='outlined'
        value={branchName?.name ?? ' '}
        disabled
      />
    </Grid>
    <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
      <TextFieldStyled
        id='outlined-basic'
        label='Auditor Name'
        variant='outlined'
        defaultValue={name ?? ' '}
        disabled
      />
    </Grid>
    <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
      <TextFieldStyled
        id='outlined-basic'
        label='Auditor Employee Code'
        variant='outlined'
        defaultValue={empCode ?? ' '}
        disabled
      />
    </Grid>
  </Grid>
);

export default React.memo(FormProccessAudit);
