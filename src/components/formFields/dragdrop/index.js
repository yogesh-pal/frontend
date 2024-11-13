import React, { useState } from 'react';
import { Button } from '@mui/material';
import fileIcon from '../../../assets/file.jpg';
import fileImg from '../../../assets/File_Img.png';
import './dregdrop.css';

const Drag = () => {
  const [fileList, setFileList] = useState([]);

  const onFileChange = (e) => {
    let newFile = e.target.files;
    if (newFile) {
      const updatedList = [...fileList, ...newFile];
      setFileList(updatedList.map((file) => Object.assign(file, {
        preview: URL.createObjectURL(file)
      })));
    }
    newFile = [];
  };

  const fileRemove = (file) => {
    const updatedList = [...fileList];
    updatedList.splice(fileList.indexOf(file), 1);
    setFileList(updatedList);
  };

  const removeAll = () => {
    setFileList([]);
  };

  return (
    <div className='box'>
      <div className='Dnd'>
        <div className='DndLabel'>
          <img src={fileIcon} alt='' />
          <p>Drag & Drop your files here</p>
        </div>
        <input type='file' onChange={onFileChange} multiple />
      </div>
      {
        fileList.length > 0 ? (
          <div className='DndPreview'>
            <p className='DndreviewTitle'>
              Your Uploaded files
            </p>
            {
              fileList.map((file) => (
                <div key={file.name} className='DndPreviewItem'>
                  <img src={fileImg} alt='' />
                  <div className='DndPreviewItemInfo'>
                    <a href={file.preview} target='_blank' rel='noopener noreferrer'>{file.name}</a>
                    <p>
                      {(file.size) / 1024}
                      {' '}
                      KB
                    </p>
                  </div>
                  <button type='button' className='DndPreviewItemDel' onClick={() => fileRemove(file)}>X</button>
                </div>
              ))
            }
            <Button color='error' variant='contained' onClick={removeAll}>Remove All</Button>
          </div>
        ) : null
      }
    </div>
  );
};

export default Drag;
