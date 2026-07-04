// Shared JSON value type — used for free-form fields such as audit-log metadata.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
