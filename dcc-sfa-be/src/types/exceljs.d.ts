import 'exceljs';

declare module 'exceljs' {
  interface Worksheet {
    dataValidations: {
      add: (
        range: string,
        rules: {
          type: string;
          allowBlank?: boolean;
          formulae: string[];
          showErrorMessage?: boolean;
          errorTitle?: string;
          error?: string;
        }
      ) => void;
    };
  }
}
