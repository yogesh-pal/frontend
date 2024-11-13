/* eslint-disable max-len */
import moment from 'moment';
import { isEqual } from 'lodash';
import styled from '@emotion/styled';
import InfoIcon from '@mui/icons-material/Info';
import React from 'react';
import {
  TableCell, TableRow, FormControlLabel,
  InputAdornment, Grid
} from '@mui/material';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import {
  CheckboxPrimary, TextFieldStyled, CenterContainer
} from '../../../../components/styledComponents';
import { formulaOfCashHandlingCharge } from '../../../loanDisbursal/loanCreation/helper';
import PreventScroll from '../../../../components/preventScroll';

const CustomInfoIcon = styled(InfoIcon)`
  color: #502A74;
  cursor: pointer;
  margin-left: 20px;
 `;

const amountFormat = Intl.NumberFormat('en-IN');

const TableRows = (props) => {
  const {
    item, index, setTableData, setCheckedRows, register, tableData, setValue,
    onRebateDialogOpen, calculateRebateData, handleForeclosureAmount, config
  } = props;

  return (
    <TableRow key={item.lan}>
      <TableCell align='center'>
        <FormControlLabel
          style={{ margin: '0px' }}
          onChange={() => {
            // if (item.foreclosureAmount === 'NA' && !item.checked) {
            //   return handleForeclosureAmount(item, index);
            // }
            if (!item.checked) {
              return handleForeclosureAmount(item, index);
            }
            // if (!item.foreclosureAmount !== 'NA' && !item.checked) {
            //   tableData[index].checked = true;
            //   tableData[index].error = true;
            // } else if (item.checked === true) {
            //   tableData[index].checked = false;
            //   tableData[index].error = false;
            //   setValue(`amount_${index}`, null);
            //   tableData[index].rebateRate = null;
            //   tableData[index].interestSettledEndDate = null;
            // }
            tableData[index].checked = false;
            tableData[index].error = false;
            setValue(`amount_${index}`, null);
            tableData[index].rebateRate = null;
            tableData[index].interestSettledEndDate = null;
            const updatedRows = [...tableData];
            setTableData(updatedRows);
            setCheckedRows(updatedRows.filter((ele) => ele.checked));
          }}
          control={<CheckboxPrimary id={index} checked={item.checked} />}
        />
      </TableCell>
      <TableCell align='center'>{item.id}</TableCell>
      <TableCell align='center'>{item?.lan}</TableCell>
      <TableCell align='center'>{item?.name}</TableCell>
      <TableCell align='center'>
        {item?.dueAmount !== 'NA' ? amountFormat.format(Math.ceil(item?.dueAmount)) : item?.dueAmount}
      </TableCell>
      <TableCell align='center'>{item?.dpd}</TableCell>
      <TableCell align='center'>
        {item?.foreclosureAmount !== 'NA' ? amountFormat.format(Math.ceil(item?.foreclosureAmount)) : item?.foreclosureAmount}
      </TableCell>
      <TableCell>
        {item.checked
          ? (
            <>
              <CenterContainer>
                <PreventScroll
                  placeholder='Amount'
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>,
                  }}
                  type='number'
                  {...register(`amount_${index}`, {
                    onBlur: (e) => {
                      const integerAmount = e.target.value.split('.')[0];
                      const amount = integerAmount.replace(/[^0-9"]/g, '');
                      if (amount) {
                        setValue(`amount_${index}`, Number(amount), { shouldValidate: true });
                      } else {
                        setValue(`amount_${index}`, null, { shouldValidate: true });
                      }
                      const updatedRows = [...tableData];
                      const amountTobepaid = Number(amount);
                      let { colender } = item;
                      if (!item.colender) {
                        // eslint-disable-next-line no-underscore-dangle
                        colender = config._default;
                      }
                      const cashHandlingCharge = formulaOfCashHandlingCharge(amountTobepaid, colender, config);
                      // Math.max(10, Math.ceil(amountTobepaid * 0.0025));
                      updatedRows[index].amount = Number(amount);
                      updatedRows[index].cashHandlingCharge = cashHandlingCharge;
                      if (Number(e.target.value)) {
                        updatedRows[index].error = false;
                      } else {
                        updatedRows[index].error = true;
                      }
                      calculateRebateData(index, item);
                      setTableData(updatedRows);
                      setCheckedRows(updatedRows.filter((ele) => ele.checked));
                    },
                    min: { value: 1 }
                  })}
                  error={item.error}
                />
                <CustomInfoIcon onClick={() => onRebateDialogOpen(index, item)} />
              </CenterContainer>
              {item.interestSettledEndDate ? (
                <CenterContainer padding='20px 0px 0px 0px'>
                  <Grid padding='0px 10px 0px 0px'>
                    <TextFieldStyled
                      label='Rebate (%)'
                      disabled
                      value={item.rebateRate}
                    />
                  </Grid>
                  <Grid padding='0px 0px 0px 10px'>
                    <TextFieldStyled
                      label='Interest Coverage Date'
                      disabled
                      value={(item.interestSettledEndDate === 'NA' || moment(item.interestSettledEndDate, 'YYYYMMDD').isBefore(moment('20220101', 'YYYYMMDD'))) ? 'NA' : moment(item.interestSettledEndDate, 'YYYYMMDD').format('DD/MM/YYYY')}
                    />
                  </Grid>
                </CenterContainer>
              ) : null}
            </>
          ) : (
            <PreventScroll
              placeholder='Amount'
              type='number'
              InputProps={{
                startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>,
              }}
              value=''
              disabled
            />
          )}
      </TableCell>
    </TableRow>
  );
};
export default React.memo(TableRows, (prevProps, nextProps) => isEqual(prevProps.item, nextProps.item));
