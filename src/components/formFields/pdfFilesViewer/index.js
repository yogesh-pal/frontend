/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Backdrop, CircularProgress } from '@mui/material';
import styled from '@emotion/styled';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import { icons } from '../../icons';
import { Service } from '../../../service';

const ListItemStyled = styled(ListItem)(({ theme }) => ({
  color: theme.input.primary,
  backgroundColor: theme.input.secondary,
  paddingTop: '0px',
  paddingBottom: '0px',
  height: '55px',
  borderRadius: '5px'
}));

const Atag = styled.a`
    text-decoration: underline;
    color: #502A74!important;
  `;

const PdfFileViewer = (props) => {
  const [pdfLink, setPdfLink] = useState(null);
  const {
    register, errors, input, setValue, getValues,
  } = props;

  const setFullUrl = async (path) => {
    Service.get(
      `${process.env.REACT_APP_GET_S3_URL}?module=GOLD&doc=${path}`
    ).then((response) => {
      setPdfLink(response?.data?.data?.full_path);
      // setType('jpeg');
    }).catch((error) => {
      console.log(error);
    });
  };

  useEffect(() => {
    const pdfPath = getValues(input.name);
    setFullUrl(pdfPath);
  }, [getValues(input.name)]);
  return (

    pdfLink ? (
      <ListItemStyled>
        <ListItemAvatar style={{ background: 'dark' }}>
          <Avatar>
            {icons.PictureAsPdfSharpIcon}
          </Avatar>
        </ListItemAvatar>
        <Atag href={pdfLink} target='_blank'>
          {`${input.label}.pdf`}
        </Atag>
      </ListItemStyled>
    ) : (
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open
      >
        <CircularProgress color='inherit' />
      </Backdrop>
    )

  );
};

export default PdfFileViewer;
