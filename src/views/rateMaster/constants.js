/* eslint-disable max-len */
import styled from '@emotion/styled';
import NorthIcon from '@mui/icons-material/North';
import SouthIcon from '@mui/icons-material/South';
import { REGEX, IDENTIFIER } from '../../constants';

export const textGroupRawCss = {
  onlyxs: {
    width: '100%',
  },
  xs: {
    width: '100%',
  },
  sm: {
    width: '100%',
  },
  md: {
    width: '60%',
  },
  lg: {
    width: '60%',
  },
  xl: {
    width: '60%',
  }
};

export const WrapperDiv = styled.div`
margin: 20px 0px;
`;
export const RPGReportWrapper = styled.div`
 display: flex;
 align-items: center;
 margin-right: 10px;
`;
export const CustomUpIcon = styled(NorthIcon)`
  color: green;
  font-size: 25px;
  margin-right: 5px;
`;
export const CustomDownIcon = styled(SouthIcon)`
  color: red;
  font-size: 25px;
  margin-right: 5px;
`;
export const rpgDays = [
  { label: '30 days', value: '30' },
  { label: '180 days', value: '180' },
  { label: '360 days', value: '360' },
  { label: 'All time', value: 'all' }
];

export const formConfig = {
  form: [
    {
      title: 'SPOT PRICE',
      variant: 'outlined',
      input: [
        {
          name: 'spotPriceAvg',
          label: 'Last 30 days average Price ',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          gridStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
          textGroupCss: textGroupRawCss,
          validation: {
            isRequired: true,
            requiredMsg: 'Please enter spot price avg',
            pattern: REGEX.NUMBER,
            patternMsg: 'Numeric digits only'
          },
          alignment: {
            xs: 12,
            sm: 12,
            md: 12,
            lg: 12,
            xl: 12
          },
        },
        {
          name: 'spotPriceBBA',
          label: 'BBA',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          validation: {
            isRequired: true,
            requiredMsg: 'Please enter BBA',
            pattern: REGEX.NUMBER,
            patternMsg: 'Numeric digits only'
          }
        },
        {
          name: 'spotPriceMCX',
          type: 'text',
          label: 'MCX',
          identifier: IDENTIFIER.INPUTTEXT,
          validation: {
            isRequired: true,
            requiredMsg: 'Please enter MCX',
            pattern: REGEX.NUMBER,
            patternMsg: 'Numeric digits only'
          }
        },
      ],
      buttonDetails: {
        alignment: 'center',
        name: 'Submit',
        type: 'submit',
        nameReset: 'Reset',
        rowReverse: 'row-reverse',
        resetDetails: {
          spotPriceBBA: null,
          spotPriceMCX: null,
          spotPriceAvg: null
        }
      },
      alignment: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 6,
        xl: 6
      }
    }
  ]
};

export const rateMasterColumnFields = (setAglocRPG, setOurMaxRPG, setAlertShow, aglocRPG, ourMaxRPG) => [
  {
    field: 'textData',
    headerName: '',
    sortable: false,
    flex: 1,
  },
  {
    field: 'bba',
    headerName: 'BBA',
    sortable: false,
    align: 'center',
    headerAlign: 'center',
    flex: 0.3,
    type: 'number',
    editable: true,
    valueSetter: ({ row, value }) => {
      if (row.id === 14) {
        if (Number(value) <= 0) {
          setAlertShow({ open: true, msg: 'AGLOC RPG should be greater than 0', alertType: 'error' });
          return { ...row, bba: aglocRPG };
        }
        if (Number(value.toFixed(2)) !== aglocRPG) {
          setOurMaxRPG(0);
          setAglocRPG(Number(value.toFixed(2)));
        }
      }
      if (row.id === 15) {
        if (Number(value) <= 0) {
          setAlertShow({ open: true, msg: 'Our Max RPG should be greater than 0', alertType: 'error' });
          return { ...row, bba: ourMaxRPG };
        }
        if (Number(value.toFixed(2)) > aglocRPG) {
          setAlertShow({ open: true, msg: 'Our Max RPG should be less than or equal to AGLOC RPG', alertType: 'error' });
          return { ...row, bba: '0' };
        }
        // if (Number(value.toFixed(2)) > setRPG75.bba || Number(value.toFixed(2)) > setRPG75.mcx) {
        //   setAlertShow({ open: true, msg: 'Our Max RPG should be less than or equal to RBIs LTV Cap (75%) - RPG', alertType: 'error' });
        //   return { ...row, bba: '0' };
        // }
        setOurMaxRPG(Number(value.toFixed(2)));
      }
      return { ...row, bba: value.toFixed(2) };
    },
    colSpan: ({ row }) => {
      if (row.id > 13 && row.id < 17) {
        return 2;
      }
      return undefined;
    },
    renderCell: ({ row }) => {
      if (row.id === 16) {
        return (
          <>
            {ourMaxRPG >= aglocRPG ? <CustomUpIcon /> : <CustomDownIcon />}
            <div>{(ourMaxRPG - aglocRPG).toFixed(2)}</div>
          </>
        );
      }
      if (row.id === 22) {
        return (
          <>
            {Number(row.bba) >= 0 ? <CustomUpIcon /> : <CustomDownIcon />}
            <div>
              {row.bba}
              %
            </div>
          </>
        );
      }
      return row.bba;
    }
  },
  {
    field: 'mcx',
    headerName: 'MCX',
    sortable: false,
    align: 'center',
    headerAlign: 'center',
    flex: 0.3,
    renderCell: ({ row }) => {
      if (row.id === 22) {
        return (
          <>
            {Number(row.mcx) >= 0 ? <CustomUpIcon /> : <CustomDownIcon />}
            <div>
              {row.mcx}
              %
            </div>
          </>
        );
      }
      return row.mcx;
    }
  }
];

export const setTableData = (data, setRateMasterData, setRateMasterData2, aglocRPG, ourRPG) => {
  setRateMasterData([
    {
      id: 11,
      textData: 'SPOT PRICE',
      bba: data.spot_price_bba,
      mcx: data.spot_price_mcx
    },
    {
      id: 12,
      textData: 'Last 30 days average 22K rate',
      bba: data.avg_price_30_days_bba,
      mcx: data.avg_price_30_days_mcx
    },
    {
      id: 13,
      textData: "RBI's LTV Cap (75%) - RPG",
      bba: data.rpg_75_bba,
      mcx: data.rpg_75_mcx
    },
    {
      id: 14,
      textData: 'AGLOC RPG',
      bba: aglocRPG,
      mcx: null
    },
    {
      id: 15,
      textData: 'Our Max RPG',
      bba: ourRPG,
      mcx: null
    },
    {
      id: 16,
      textData: 'Our RPG over AGLOC RPG',
      bba: null,
      mcx: null
    }
  ]);
  setRateMasterData2([
    {
      id: 21,
      textData: "Yesterday's SPOT Rate",
      bba: data.yesterday_spot_price_bba,
      mcx: data.yesterday_spot_price_mcx
    },
    {
      id: 22,
      textData: '% Change in SPOT price',
      bba: (((data.spot_price_bba - data.yesterday_spot_price_bba) * 100) / (data.yesterday_spot_price_bba)).toFixed(2),
      mcx: (((data.spot_price_mcx - data.yesterday_spot_price_mcx) * 100) / (data.yesterday_spot_price_mcx)).toFixed(2)
    },
    {
      id: 23,
      textData: 'Last 30 days Min 22K rate',
      bba: data.min_price_30_days_bba,
      mcx: data.min_price_30_days_mcx
    },
    {
      id: 24,
      textData: 'Last 30 days Max 22K rate',
      bba: data.max_price_30_days_bba,
      mcx: data.max_price_30_days_mcx
    }
  ]);
};
