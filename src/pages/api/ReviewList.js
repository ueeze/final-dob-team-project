import React, { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../firebase/config' // Firebase 설정 파일 경로를 정확히 지정하세요

function ReviewList() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true)
        const querySnapshot = await getDocs(collection(db, 'reviews'))
        const reviewsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setReviews(reviewsData)
      } catch (error) {
        console.error('리뷰를 가져오는 중 오류 발생:', error)
        setError(error)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [])

  if (loading) return <div>로딩 중...</div>
  if (error) return <div>오류 발생: {error.message}</div>

  return (
    <div>
      <h2>리뷰 목록</h2>
      {reviews.length === 0 ? (
        <p>리뷰가 없습니다.</p>
      ) : (
        reviews.map((review) => (
          <div key={review.id}>
            <p>사용자: {review.userId}</p>
            <p>내용: {review.content}</p>
            <p>평점: {review.rating}</p>
            <p>작성일: {review.timestamp}</p>
            <hr />
          </div>
        ))
      )}
    </div>
  )
}

export default ReviewList
