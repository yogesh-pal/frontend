import {
  NAVIGATION,
} from '../../../constants';

export const uploaderDashboardNavigation = [
  { name: 'Dashboard', url: NAVIGATION.dashboard },
  { name: 'Uploader', url: NAVIGATION.uploader }
];

export const bankingPartnershipNavigation = [
  ...uploaderDashboardNavigation,
  { name: 'Banking Partnership', url: NAVIGATION.bankingpartnershipUploader }
];

export const rekycUploaderNavigation = [
  ...uploaderDashboardNavigation,
  { name: 'Re-KYC Upload', url: NAVIGATION.rekycUploader }
];
