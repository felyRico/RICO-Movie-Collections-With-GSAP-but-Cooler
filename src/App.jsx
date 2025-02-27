import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import gsap from 'gsap';
import './App.css';

function App() {
  const [searchTerm, setSearchTerm] = useState('FLCL');
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchButtonRef = useRef(null);
  const moviesContainerRef = useRef(null);

  gsap.defaults({ duration: 0.2, ease: 'power2.out' });

  const fetchMovies = async (query) => {
    if (!query.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Empty Search',
        text: 'Please enter a movie name to search.',
      });
      setMovies([]);
      return;
    }
    try {
      setIsLoading(true);
      Swal.fire({
        title: 'Loading...',
        text: 'Fetching movies...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      const response = await axios.get(
        'https://imdb.iamidiotareyoutoo.com/search',
        { params: { q: query } }
      );
      Swal.close();
      let moviesData = [];
      if (response.data && Array.isArray(response.data.description)) {
        moviesData = response.data.description;
      }
      if (moviesData.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'No Movies Found',
          text: `No movies were found for "${query}".`,
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Movies Loaded',
          text: `Successfully fetched movies for "${query}".`,
          timer: 1500,
          showConfirmButton: false,
        });
      }
      setMovies(moviesData);
    } catch (error) {
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Error fetching movies',
        text:
          error.response?.data?.message ||
          'An unexpected error occurred. Please try again.',
      });
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies(searchTerm);
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (moviesContainerRef.current) {
        const cards = moviesContainerRef.current.querySelectorAll('.movie-card');
        gsap.set(cards, { y: -50, opacity: 0 });
        gsap.to(cards, {
          duration: 1,
          y: 0,
          opacity: 1,
          ease: 'elastic.out',
          stagger: 0.2,
        });

        cards.forEach((card) => {
          card.addEventListener('mouseenter', () => {
            if (gsap.isTweening(card)) gsap.killTweensOf(card);
            gsap.to(card, { scale: 1.05, });
          });
          card.addEventListener('mouseleave', () => {
            if (gsap.isTweening(card)) gsap.killTweensOf(card);
            gsap.to(card, { scale: 1 });
          });
        });
      }
    }, moviesContainerRef);

    return () => ctx.revert();
  }, [movies]);

  const handleMouseEnter = () => {
    if (gsap.isTweening(searchButtonRef.current))
      gsap.killTweensOf(searchButtonRef.current);
    gsap.to(searchButtonRef.current, { scale: 1.2 });
  };

  const handleMouseLeave = () => {
    if (gsap.isTweening(searchButtonRef.current))
      gsap.killTweensOf(searchButtonRef.current);
    gsap.to(searchButtonRef.current, { scale: 1 });
  };

  const handleButtonClick = () => {
    if (gsap.isTweening(searchButtonRef.current))
      gsap.killTweensOf(searchButtonRef.current);
    const tl = gsap.timeline();
    tl.to(searchButtonRef.current, { scale: 0.7, duration: 0.1 })
      .to(searchButtonRef.current, { scale: 1 });
    handleSearch();
  };

  const handleSearch = () => {
    fetchMovies(searchTerm);
  };

  const fallbackImage = 'https://th.bing.com/th?id=OIP.io28tGJjh4Xvw3zyzsJamwAAAA&w=200&h=200&c=12&rs=1&p=0&o=6&dpr=1.5&pid=23.1';

  return (
    <div className="container">
      <h1 className="header">Movie Collection</h1>
      <div className="search-container">
        <input
          type="text"
          placeholder="FLCL"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          ref={searchButtonRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleButtonClick}
        >
          Search
        </button>
      </div>
      {isLoading && <p className="loading-text">Loading movies...</p>}
      <div className="movies" ref={moviesContainerRef}>
        {Array.isArray(movies) &&
          movies.map((movie, index) => (
            <div key={movie['#IMDB_ID'] || index} className="movie-card">
              <img
                src={movie['#IMG_POSTER'] || fallbackImage}
                alt={movie['#TITLE']}
                className="movie-image"
              />
              <div className="movie-info">
                <h2>{movie['#TITLE']}</h2>
                <p>Year: {movie['#YEAR']}</p>
                <p>Rank: {movie['#RANK']}</p>
                <p>Actors: {movie['#ACTORS'] || 'N/A'}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default App;