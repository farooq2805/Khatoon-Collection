/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// export {};

// declare global {
//   interface Window {
//     Razorpay?: any;
//   }
// }


export {};

declare global {
  interface Window {
    Razorpay: new (options: any) => { open: () => void };
  }
}
