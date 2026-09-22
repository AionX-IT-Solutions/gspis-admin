export interface Vendor {
  id: string
  name: string
  company?: string
  email: string
  phone: string
  category: string
  balance: number
  status: 'active' | 'inactive'
  avatarColor: string
}

export interface Account {
  id: string
  name: string
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense'
  balance: number
}
