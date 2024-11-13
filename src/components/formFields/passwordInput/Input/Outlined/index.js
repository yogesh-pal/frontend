import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import { icons } from '../../../../icons';

const FilledPassword = (props) => {
  const {
    input,
    values,
    register,
    handleClickShowPassword,
    handleMouseDownPassword
  } = props;
  return (
    <OutlinedInput
      id='filled-adornment-password'
      type={values.showPassword ? 'text' : 'password'}
      {...register(
        input.name,
        { required: input?.validation?.isRequired, pattern: new RegExp(input?.validation?.pattern) }
      )
        }
      endAdornment={
            (
              <InputAdornment position='end'>
                <IconButton
                  aria-label='toggle password visibility'
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge='end'
                >
                  {values.showPassword ? icons.VisibilityOff : icons.Visibility}
                </IconButton>
              </InputAdornment>
            )
        }
      label='Password'
    />
  );
};

export default FilledPassword;
