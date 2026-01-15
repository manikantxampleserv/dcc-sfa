/**
 * Test file to verify toast duplicate prevention
 * This can be used for testing the duplicate prevention functionality
 */

import toastService from './toast';

// Test function to demonstrate duplicate prevention
export function testDuplicatePrevention() {
  console.log('Testing toast duplicate prevention...');

  // These should show only one toast
  toastService.error('Network error. Unable to reach the server.');
  toastService.error('Network error. Unable to reach the server.');
  toastService.error('Network error. Unable to reach the server.');

  // This should show a different toast
  setTimeout(() => {
    toastService.error('Different error message');
  }, 1000);

  // After 5 seconds, this should show the network error again
  setTimeout(() => {
    toastService.error('Network error. Unable to reach the server.');
  }, 6000);

  console.log(
    'Test initiated. Check the UI for duplicate prevention behavior.'
  );
}

// Export for manual testing in browser console
if (typeof window !== 'undefined') {
  (window as any).testToastDuplicates = testDuplicatePrevention;
}
