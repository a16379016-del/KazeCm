/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CommissionStatus = '已填單' | '排單中' | '草稿' | '線稿' | '色稿' | '成圖' | '已交付';

export const STATUS_ORDER: CommissionStatus[] = [
  '已填單',
  '排單中',
  '草稿',
  '線稿',
  '色稿',
  '成圖',
  '已交付'
];

export interface CommissionItem {
  category: string;
  subCategory: string;
  price: number;
  characterCount: number;
}

export interface Quote {
  id: string;
  nickname: string;
  contact?: string;
  item: string;
  details: string;
  status: '待回覆' | '已回覆';
  createdAt: any; // Firestore Timestamp
  quoteId: string;
}

export interface Commission {
  id: string;
  nickname: string;
  contact: string;
  title: string;
  items: CommissionItem[];
  price?: number;
  paymentMethod?: string;
  details: string;
  imageUrl?: string;
  status: CommissionStatus;
  createdAt: any; // Firestore Timestamp
  orderId: string;
}

export interface Message {
  id: string;
  commissionId: string;
  sender: 'user' | 'admin';
  text: string;
  timestamp: any;
}

export interface AppSettings {
  isOpen: boolean;
}
