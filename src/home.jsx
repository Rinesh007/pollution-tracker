import React, { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "./style.css";

const Home = () => {
  const [news, setNews] = useState([]);
  const [visibleNewsCount, setVisibleNewsCount] = useState(10);
  const sliderRef = useRef();
  const [inputValue, setInputValue] = useState("");
  const navigate = useNavigate();
  const isScrolling = useRef(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(
          "https://newsapi.org/v2/everything?q=air+pollution&apiKey=84ea0dc3b5b64218b6791ff5414bf938"
        );
        setNews(response.data.articles);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching the news:", error);
      }
    };

    fetchNews();
  }, []);

  const handleScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 5) {
        setVisibleNewsCount((prevCount) => Math.min(prevCount + 5, 200));
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      navigate("/main", { state: { userInput: inputValue } });
    }
  };

  const slideLeft = () => {
    if (sliderRef.current && !isScrolling.current) {
      isScrolling.current = true;
      sliderRef.current.scrollBy({
        left: -300,
        behavior: "smooth",
      });
      setTimeout(() => {
        isScrolling.current = false;
      }, 300); // Match duration with scroll animation duration
    }
  };

  const slideRight = () => {
    if (sliderRef.current && !isScrolling.current) {
      isScrolling.current = true;
      sliderRef.current.scrollBy({
        left: 300,
        behavior: "smooth",
      });
      setTimeout(() => {
        isScrolling.current = false;
      }, 300);
    }
  };

  return (
    <div className="container">
      <center>
        <h1 className="topic">HealthyAir Guide </h1>
      </center>

      <div className="search-container">
        <div className="search-wrapper">
          <FontAwesomeIcon className="search-icon" icon={faMagnifyingGlass} />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            className="search-input"
            placeholder="Enter your city"
          />
        </div>
      </div>

      <div className="news-container">
        {news.length > 0 ? (
          <>
            <button className="slide-btn left-btn" onClick={slideLeft}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <div
              className="news-slider"
              ref={sliderRef}
              onScroll={handleScroll}
            >
              {news.slice(0, visibleNewsCount).map((article, index) => (
                <div className="news-item" key={index}>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img className="news-image" src={article.urlToImage} />
                    <div className="content-news">
                      <h3>{article.title}</h3>
                      <p>{article.description}</p>
                      <p>{new Date(article.publishedAt).toLocaleString()}</p>
                      <p> - {article.source.name}</p>
                    </div>
                  </a>
                </div>
              ))}
            </div>
            <button className="slide-btn right-btn" onClick={slideRight}>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </>
        ) : (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading news...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
