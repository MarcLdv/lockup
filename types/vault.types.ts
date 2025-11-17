// Types pour le coffre-fort

export interface VaultItem {
  id: number;
  userId: number;
  pseudo: string;
  url: string;
  passwordEncrypted: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateVaultItemDto {
  pseudo: string;
  url: string;
  passwordEncrypted: string;
}

export interface UpdateVaultItemDto extends Partial<CreateVaultItemDto> {
  id: number;
}
