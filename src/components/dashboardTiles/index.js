import { Card } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useScreenSize } from '../../customHooks';

const CardContainer = styled(Card)(({ theme, screen }) => ({
  background: theme?.background?.secondary,
  height: (screen === 'sm' || screen === 'xs') ? '120px' : '250px',
  width: (screen === 'sm' || screen === 'xs') ? '150px' : '400px',
  padding: (screen === 'sm' || screen === 'xs') ? '5px' : '10px',
  margin: (screen === 'sm' || screen === 'xs') ? '15px 10px' : '40px 20px',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  alignItems: 'center',
  cursor: 'pointer',
  // border: '1px solid purple',
  borderRadius: '20px',
  boxShadow: 'rgb(183 151 193) 0px 1px 4px',
}));

const CardIcon = styled('div')(({ theme, screen }) => ({
  color: theme?.background?.secondary,
  svg: {
    fontSize: (screen === 'sm' || screen === 'xs') ? '50px' : '100px',
    color: theme?.background?.primary,
    borderRadius: '50%',
    backgroundImage: 'linear-gradient(90deg, #d0d4f1 20%, #a560b4 100%)'
  }
}));

const CardText = styled('div')(({ theme, fontSize, screen }) => ({
  color: theme?.text?.primary,
  fontSize: (screen === 'sm' || screen === 'xs') ? (fontSize || '15px') : (fontSize || '30px'),
  textAlign: 'center'
}));

const CardDesign = (props) => {
  const { tab, handleClick, fontSize } = props;
  const screen = useScreenSize();
  return (
    <CardContainer onClick={() => handleClick(tab.route)} screen={screen}>
      <CardIcon screen={screen}>{tab?.icon}</CardIcon>
      <CardText fontSize={fontSize} screen={screen}>{tab?.name}</CardText>
    </CardContainer>
  );
};

export default CardDesign;
