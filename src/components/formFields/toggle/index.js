import FormControlLabel from '@mui/material/FormControlLabel';
import { IOSSwitch } from '../../styledComponents';

const Toggler = (props) => {
  const {
    register, input
  } = props;

  return (
    <FormControlLabel
      control={<IOSSwitch sx={{ m: 1 }} defaultChecked={input?.default} />}
      label={input?.label}
      labelPlacement={input?.placement}
      {...register(
        input?.name,
        { required: input?.validation?.isRequired, pattern: new RegExp(input?.validation?.pattern) }
      )
      }
    />
  );
};

export default Toggler;
