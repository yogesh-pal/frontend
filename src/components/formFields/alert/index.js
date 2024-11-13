import { Alert, AlertTitle } from '@mui/material';
import { AlertPrimary } from '../../styledComponents';

const alert = (type, message) => (
  <AlertPrimary>
    <Alert severity={type}>
      <AlertTitle>{type}</AlertTitle>
      {message}
    </Alert>
  </AlertPrimary>
);

const AlertText = (props) => {
  const { type, message } = props;

  return (
    alert(type, message)
  );
};

export default AlertText;
