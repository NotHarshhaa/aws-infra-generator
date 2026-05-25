export interface ServiceConfiguratorProps {
  onBackToHome: () => void;
}

export interface FieldError {
  [serviceId: string]: {
    [fieldName: string]: string | undefined;
  };
}
