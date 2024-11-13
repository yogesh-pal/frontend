import IconButton from '@mui/material/IconButton';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import styled from '@emotion/styled';
import { icons } from '../../../../icons';

const InputStyled = styled(Input)(({ theme }) => ({
  '&:before': {
    borderColor: theme.input.primary
  },
  '&.Mui-focused': {
    borderColor: `${theme.input.primary} !important`
  },
}));
const FilledPassword = (props) => {
  const {
    input,
    values,
    register,
    handleClickShowPassword,
    handleMouseDownPassword
  } = props;
  return (
    <InputStyled
      id='standard-adornment-password'
      type={values.showPassword ? 'text' : 'password'}
      {...register(
        input.name,
        { required: input?.validation?.isRequired, pattern: new RegExp(input?.validation?.pattern) }
      )}
      endAdornment={(
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
        )}
      label='Password'
    />
  );
};

export default FilledPassword;
