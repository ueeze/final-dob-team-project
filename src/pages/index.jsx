import Head from 'next/head'
import React, { useState, useEffect, useRef } from 'react'
import { useInfiniteQuery, useQueryClient } from 'react-query'
import ScrollToTop from 'react-scroll-up'
import { Sticky, StickyContainer } from 'react-sticky'
import InfiniteScroll from 'react-infinite-scroll-component'
import { Box, Flex, Input, SimpleGrid, Spacer, Button } from '@chakra-ui/react'
import { ArrowUpIcon } from '@chakra-ui/icons'
import DropDown from '../components/DropDown'
import MovieCard from '../components/MovieCard'
import CustomSpinner from '../components/CustomSpinner'
import { useLocalStorage } from '../hooks/useLocalStorage'
import MobNav from '../components/MobNav'

export default function Home() {
  const [category, setCategory] = useLocalStorage('category', 'popular')
  const [filteredMovies, setFilteredMovies] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [allMovies, setAllMovies] = useState([])
  const inputRef = useRef(null)

  const queryClient = useQueryClient()

  const { data, status, fetchNextPage, hasNextPage } = useInfiniteQuery(
    ['infiniteMovies', category],
    async ({ pageParam = 1 }) =>
      await fetch(`/api/allMovies?category=${category}&page=${pageParam}`).then(
        (result) => result.json()
      ),
    {
      getNextPageParam: (lastPage, pages) => {
        if (pages.length <= 10) {
          return pages.length + 1
        }
      },
    }
  )

  const changeCategory = (selectedCategory) => {
    setCategory(selectedCategory)
    queryClient.invalidateQueries(['infiniteMovies', selectedCategory])
  }

  const searchMovies = () => {
    const searchedMovie = inputRef.current.value
    setSearchInput(searchedMovie)

    if (searchedMovie !== '') {
      const filteredMovies = allMovies.filter((movie) => {
        return movie.title.toLowerCase().includes(searchInput.toLowerCase())
      })
      setFilteredMovies(filteredMovies)
    }
  }

  const fetchAllMovies = async () => {
    try {
      let allMoviesArray = []

      for (let i = 1; i <= 10; i++) {
        const result = await fetch(
          `/api/allMovies?category=${category}&page=${i}`
        )
        const movieData = await result.json()
        allMoviesArray.push(movieData.results)
      }

      setAllMovies(allMoviesArray.flatMap((x) => x))
    } catch (e) {
      throw new Error(e)
    }
  }

  useEffect(() => {
    fetchAllMovies()
  }, [])

  return (
    <>
      <MobNav
        input={searchInput}
        setInput={setSearchInput}
        handleSubmit={(e) => {
          e.preventDefault()
          searchMovies()
        }}
      />
      <Head>
        <title>胡蝶之夢</title>
        <meta name="description" content="胡蝶之夢" />
        <link rel="icon" href="/butterfly.ico" />
        <link
          rel="preload"
          href="/asset/space-ranger-font/SpaceRangerLaserItalic-J7an.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/asset/space-ranger-font/SpaceRanger-EMJl.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
      </Head>
      <StickyContainer>
        <Box height="100%">
          {status === 'loading' ? (
            <CustomSpinner />
          ) : status === 'error' ? (
            <h1
              style={{
                textAlign: 'center',
                marginTop: '20rem',
                fontWeight: 'bold',
              }}
            >
              Error loading movies
            </h1>
          ) : (
            <>
              <Box margin={{ base: '2rem 0', md: '3rem 0' }}>
                <header margin={0} className="title">
                  胡蝶之夢
                </header>
              </Box>
              <Sticky>
                {({ style, isSticky }) => (
                  <Flex
                    style={style}
                    justify="center"
                    align="center"
                    zIndex={1000}
                    background={
                      isSticky ? 'rgba(255, 255, 255, 0.7)' : 'transparent'
                    }
                    transition="background-color 0.3s ease-in-out"
                    sx={{
                      backdropFilter: isSticky ? 'blur(10px)' : 'none',
                    }}
                  >
                    <Flex
                      justify={'center'}
                      width={'100%'}
                      padding={{ base: '1rem', md: '1.25rem' }}
                    >
                      <Input
                        ref={inputRef}
                        onChange={(e) => searchMovies(e.target.value)}
                        placeholder="영화를 검색하세요..."
                        background={'white'}
                        width={{ base: '90%', md: '40rem' }}
                      />
                      <Box padding={{ base: '0 0.25rem', md: '0 0.5rem' }} />
                      <DropDown
                        category={category}
                        changeCategory={changeCategory}
                      />
                    </Flex>
                  </Flex>
                )}
              </Sticky>
              <InfiniteScroll
                next={fetchNextPage}
                hasMore={hasNextPage}
                dataLength={data?.pages.length * 20}
              >
                <SimpleGrid
                  margin={{ base: '3rem 1rem', md: '5rem' }}
                  spacing={{ base: 8, md: 12 }}
                  columns={{ base: 2, md: 5 }}
                >
                  {status === 'loading' ? (
                    <CustomSpinner />
                  ) : status === 'error' ? (
                    <h1
                      style={{
                        textAlign: 'center',
                        marginTop: '20rem',
                        fontWeight: 'bold',
                      }}
                    >
                      Error loading movies
                    </h1>
                  ) : searchInput.length > 2 ? (
                    filteredMovies.map((movie) => (
                      <MovieCard key={movie.id} movie={movie} />
                    ))
                  ) : (
                    data?.pages?.flatMap(
                      (page, i) =>
                        page?.results?.map((movie) => (
                          <MovieCard key={movie.id} movie={movie} />
                        )) || []
                    ) || []
                  )}
                </SimpleGrid>
              </InfiniteScroll>
            </>
          )}
          <ScrollToTop
            showUnder={160}
            style={{
              background: 'white',
              borderRadius: 5,
              boxShadow: '0 0 6px black',
            }}
          >
            <ArrowUpIcon boxSize={10} />
          </ScrollToTop>
        </Box>
      </StickyContainer>
    </>
  )
}
