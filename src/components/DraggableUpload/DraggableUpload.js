/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import { Grid } from '@mui/material';
import styled from '@emotion/styled';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PageLoader from '../PageLoader';
import ListItem from './ListItem';

const CustomGrid = styled(Grid)`
margin-bottom: 15px;
width: 100%;
display: flex;
flex-direction: column;
height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-width: 2px;
  border-radius: 1rem;
  border-style: dashed;
  border-color: #cbd5e1;
  // background-color: ;
  padding: 10px 0;
  background-color: ${(props) => ((props.dragActive) ? '#ffffff' : '#f8fafc')};
`;

const FileButton = styled.button`
cursor: pointer;
padding: 0.25rem;
font-size: 1rem;
font-weight: bold;
border: none;
background-color: transparent;
`;

const CustomLabel = styled.label`
margin: 5px 0;
`;

const CustomSpan = styled.span`
color: red;
`;

const ValidationStringGrid = styled(Grid)`
font-size: 13px; 
color: grey;
margin: 5px 0;
`;

const DraggableUpload = (props) => {
  const {
    selectedFile,
    isMulti,
    supportedFiles,
    filePickedorDropped,
    loading,
    handleRemove,
    inputRef
  } = props;
  const [dragActive, setDragActive] = React.useState(false);

  const handleDragEnter = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const { files } = e.dataTransfer;
    const filesArray = isMulti ? [...files] : [files[0]];
    filePickedorDropped(filesArray);
  };

  const handleFileInputChange = (e) => {
    const { files } = e.target;
    const filesArray = isMulti ? [...files] : [files[0]];
    filePickedorDropped(filesArray);
  };

  const handleFileRemoval = (fileInfo) => {
    inputRef.current.value = '';
    handleRemove(fileInfo);
  };

  return (
    <>
      {loading && <PageLoader />}
      <Grid
        container
        padding='0 20px'
        display='flex'
        width='100%'
        justifyContent='space-between'
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CustomGrid
          item
          dragActive={dragActive}

        >
          <input
            type='file'
            id='input-file-upload'
            ref={inputRef}
            onChange={handleFileInputChange}
            multiple={isMulti ?? false}
            style={{ display: 'none' }}
          />
          <Grid item margin='5px 0'>
            <AddCircleOutlineIcon fontSize='large' />
          </Grid>
          <CustomLabel
            id='label-file-upload'
            htmlFor='input-file-upload'
          >
            <div>
              Drop file here or
              <FileButton onClick={() => inputRef.current.click()}>Browse Document</FileButton>
            </div>
          </CustomLabel>
          <ValidationStringGrid item>
            <CustomSpan>*</CustomSpan>
            {`Files supported ${supportedFiles.join(',')}`}
          </ValidationStringGrid>
        </CustomGrid>
        {selectedFile.length > 0 ? selectedFile.map((sfile, ind) => (
          <ListItem key={ind} fileInfo={sfile} handleRemove={() => handleFileRemoval(sfile)} />
        )) : null}
      </Grid>
    </>
  );
};

export default DraggableUpload;
