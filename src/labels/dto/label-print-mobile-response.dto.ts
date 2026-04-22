export class LabelPrintMobileResponseDto {
  id!: string;
  qrCode!: string;
  status!: 'ACTIVE' | 'EXPIRED' | 'DISCARDED' | 'CONSUMED';
  isExpired!: boolean;
  canConsume!: boolean;
  preparedAt!: string;
  expiresAt!: string;
  message!: string;
  labelItem!: {
    id: string;
    name: string;
    category: {
      id: string;
      name: string;
    };
  };
}