import React from 'react';
import { Grid } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import styled from '@emotion/styled';

const CustomItem = styled(Grid)`
background: #f8fafc;
border: 2px dashed #cbd5e1;
justify-content: space-between;
display: flex;
align-items: center;
padding: 15px;
border-radius: 10px;
margin: 3px 0;
`;

const ListItem = ({ fileInfo, handleRemove }) => (
  <CustomItem
    item
    width='100%'
  >
    {fileInfo.name}
    <CloseIcon style={{ cursor: 'pointer' }} onClick={handleRemove} />
  </CustomItem>
);

export default ListItem;
