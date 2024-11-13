import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import styled from '@emotion/styled';
import DeleteIcon from '@mui/icons-material/Delete';
import { icons } from '../../icons';

export const CustomDeleteIcon = styled(DeleteIcon)(() => ({
  color: '#d85151'
}));

const ListStyled = styled(List)(() => ({
  paddingTop: '0px',
  paddingBottom: '0px'
}));

const ListItemStyled = styled(ListItem)(({ theme }) => ({
  color: theme.input.primary,
  backgroundColor: theme.input.secondary,
  paddingTop: '0px',
  paddingBottom: '0px',
  height: '57px',
  borderRadius: '5px'
}));

const Atag = styled.a`
  text-decoration: none;
  color: #502A74!important;
`;

const CustomFileList = (props) => {
  const { img, removeImg, disabled } = props;
  return (
    <ListStyled dense={false}>
      {img.map((arr, index) => {
        let fileName = arr[1];
        const name = arr[1].split('.');
        if (name[0].length > 25) {
          if (name.length > 1) {
            fileName = `${name[0].slice(0, 25)}.....${name[name.length - 1]}`;
          } else {
            fileName = name[0].slice(0, 25);
          }
        }
        return (
          <ListItemStyled
            secondaryAction={
                  (
                    <IconButton edge='end' aria-label='delete' onClick={() => removeImg(index)}>
                      {!disabled && <CustomDeleteIcon />}
                    </IconButton>
                  )
                }
          >
            <ListItemAvatar>
              <Avatar>{icons.PictureAsPdfSharpIcon}</Avatar>
            </ListItemAvatar>
            <Atag href={arr[0]} target='_blank'>
              <ListItemText
                primary={fileName}
              />
            </Atag>
          </ListItemStyled>
        );
      })}
    </ListStyled>
  );
};

export default CustomFileList;
