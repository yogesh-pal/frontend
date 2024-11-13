import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import styled from '@emotion/styled';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';

const CustomDeleteIcon = styled(DeleteIcon)(() => ({
  color: '#502A74'
}));

const ListStyled = styled(List)(({ theme }) => ({
  marginTop: '10px',
  paddingTop: '0px',
  paddingBottom: '0px',
  backgroundColor: theme.input.secondary,
  borderRadius: '5px'
}));

const ListItemStyled = styled(ListItem)(() => ({
  paddingTop: '0px',
  paddingBottom: '0px',
}));

const Atag = styled.a`
  padding: 5px 0px;
  text-decoration: underline;
  color: #502A74!important;
`;

const CustomFileList = (props) => {
  const {
    img, removeImg, disabled, input
  } = props;
  console.log('propsprops', props);
  const openUrl = (arr) => {
    console.log('Array section', arr);
    return `/file-preview?url=${btoa(arr?.url)}&type=${btoa(arr?.type)}`;
  };

  return (
    <ListStyled dense={false}>
      {Object.keys(img)?.map((item) => (
        <ListItemStyled
          secondaryAction={
                  (
                    <IconButton edge='end' aria-label='delete' onClick={() => removeImg(item)}>
                      {!disabled && <CustomDeleteIcon />}
                    </IconButton>
                  )
                }
        >
          <Atag href={img[item]?.url ? openUrl(img[item]) : img[item]?.url} target='_blank' onClick={input.onClick ? (event) => input.onClick(event, input) : undefined}>
            {item}
          </Atag>
        </ListItemStyled>
      ))}
    </ListStyled>
  );
};

export default CustomFileList;