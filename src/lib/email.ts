import { db } from '@/src/firebase';
import { collection, addDoc } from 'firebase/firestore';

export const sendNotificationEmail = async (subject: string, text: string) => {
  try {
    await addDoc(collection(db, 'mail'), {
      to: 'a16379016@gmail.com',
      message: {
        subject: subject,
        text: text,
      }
    });
  } catch (error) {
    console.error('Failed to send email notification:', error);
  }
};
