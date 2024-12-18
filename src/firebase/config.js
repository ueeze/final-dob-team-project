import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, collection, addDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let app
if (!getApps().length) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

export const auth = getAuth(app)
export const db = getFirestore(app)

// 리뷰 데이터 저장 함수
export async function saveReview(reviewData) {
  try {
    const docRef = await addDoc(collection(db, 'reviews'), reviewData)
    console.log('리뷰가 성공적으로 저장되었습니다. 문서 ID:', docRef.id)
    return docRef.id
  } catch (e) {
    console.error('리뷰 저장 중 오류 발생:', e)
    throw e
  }
}

// 사용 예시
// const review = {
//   userId: "user123",
//   content: "좋은 제품입니다!",
//   rating: 5,
//   timestamp: new Date()
// };
//
// saveReview(review)
//   .then((docId) => console.log("저장된 리뷰 ID:", docId))
//   .catch((error) => console.error("리뷰 저장 실패:", error));
