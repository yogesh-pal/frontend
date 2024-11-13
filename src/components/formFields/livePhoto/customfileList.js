import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import styled from '@emotion/styled';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { icons } from '../../icons';

const CustomDeleteIcon = styled(DeleteIcon)(() => ({
  color: '#502A74'
}));

const ListStyled = styled(List)(() => ({
  paddingTop: '0px',
  paddingBottom: '0px',
  border: '1px solid #502a74',
  borderRadius: '4px',
  backgroundColor: '#F5FCFF'
}));

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

const CustomFileList = (props) => {
  const {
    img, removeImg, disabled, input
  } = props;
  const openUrl = (arr) => `/file-preview?url=${btoa(arr?.url)}&type=${btoa(arr?.type)}`;

  return (
    <ListStyled dense={false}>
      {img.map((arr, index) => (
        <ListItemStyled
          secondaryAction={
                  (
                    <IconButton edge='end' aria-label='delete' onClick={() => removeImg(index)} disabled={disabled}>
                      {!disabled && <CustomDeleteIcon />}
                    </IconButton>
                  )
                }
        >
          <ListItemAvatar style={{ background: 'dark' }}>
            <Avatar>
              {arr.type === 'application/pdf' ? icons.PictureAsPdfSharpIcon : icons.MonochromePhotosIcon}
            </Avatar>
          </ListItemAvatar>
          <Atag href={arr?.url ? openUrl(arr) : arr?.url} target='_blank' onClick={input.onClick ? (event) => input.onClick(event, input) : undefined}>
            {arr.name}
          </Atag>
        </ListItemStyled>
      ))}
    </ListStyled>
  );
};

export default CustomFileList;
