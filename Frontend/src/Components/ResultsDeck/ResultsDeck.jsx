import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { IoIosHeart, IoIosHeartEmpty } from "react-icons/io";
import './ResultsDeck.css';

const ResultsDeck = ({ onShowHome, onShowDeck, onShowQuiz }) => {
  const location = useLocation();

  const { user } = useUser();             // Get user context from Clerk
  const userId = user ? user.id : null;   // Get the logged-in user's ID
  const [favoritedDecks, setFavoritedDecks] = useState({}); // Track favorite status for each deck
  const { filteredResults } = location.state || { filteredResults: [] };
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [flashcards, setFlashcards] = useState([]);


  useEffect(() => {
    if (filteredResults.length > 0) {
      const firstDeck = filteredResults[0];
      setSelectedDeck(firstDeck);
      getFlashcards(firstDeck);
      getFavoritedDecks(); // Fetch the user's favorited decks
    }
  }, [filteredResults]);

  // Fetch the user's favorited decks
  const getFavoritedDecks = async () => {
    if (userId) {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_HOST}/decks/${userId}/getFavDecks`);
        const favDecks = await response.json();
        const initialFavorites = filteredResults.reduce((acc, deck) => {
          acc[deck._id] = favDecks.includes(deck._id);
          return acc;
        }, {});
        setFavoritedDecks(initialFavorites);
      } catch (error) {
        console.error('Error fetching favorited decks', error);
      }
    }
  };

  const handleDeckSelect = (deck) => {
    setSelectedDeck(deck);
    getFlashcards(deck);
  };

  const getFlashcards = async (deck) => {
    if (deck && deck._id) {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_HOST}/flashcards/deck/${deck._id}/flashcards`);
        const data = await response.json();
        if (response.ok) {
          setFlashcards(data);
        }
      } catch (error) {
        console.error("Error fetching flashcards", error);
      }
    }
  };

  const toggleFavoriteDeck = async (deckID) => {
    try {
      if (!userId) {
        alert('Please log in to add this deck to your favorites.');
        return;
      }

      // Toggle the favorite status locally
      setFavoritedDecks(prev => ({
        ...prev,
        [deckID]: !prev[deckID]
      }));

      // Update the favorited status on the server
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_HOST}/decks/${userId}/favDeck`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deckId: deckID,
        }),
      });

      if (!response.ok) {
        // Revert the state if there's an error
        setFavoritedDecks(prev => ({
          ...prev,
          [deckID]: !prev[deckID]
        }));
      }
    } catch (error) {
      console.error('Error toggling favorite status', error);
      // Revert the state if there's an error
      setFavoritedDecks(prev => ({
        ...prev,
        [deckID]: !prev[deckID]
      }));
    }
  };

  return (
    <div className='search-deck-page'>
      <div className='results-container-deck'>
        <div className='filter-bar-deck'>
          <button className='filter-button-deck' onClick={onShowHome}>All Results</button>
          <button className='filter-button-deck active' onClick={onShowDeck}>Decks</button>
          <button className='filter-button-deck' onClick={onShowQuiz}>Quizzes</button>
        </div>

        <div className='content-grid'>
          {/* Decks Column */}
          <div className='decks-column'>
            <div className='section-header'>
              <h2>Available Decks</h2>
              <span>{filteredResults.length} decks found</span>
            </div>
            <div className='decks-list'>
              {filteredResults.map(deck => (
                <div
                  key={deck._id}
                  className={`deck-card ${selectedDeck?._id === deck._id ? 'active' : ''}`}
                  onClick={() => handleDeckSelect(deck)}
                >
                  <h3>{deck.name}</h3>
                  <div className='deck-meta'>
                    <span>{deck.__v} Cards</span>
                    <span>•</span>
                    <span>Professor: {deck.professor}</span>
                  </div>
                  <button className="add_favorite_deck" onClick={(e) => {
                  e.stopPropagation();
                  toggleFavoriteDeck(deck._id);
                }
                }>
              <IoIosHeart className={`heart-icon-deck ${favoritedDecks[deck._id] ? 'active' : ''}`} />
              </button>            
            </div>
              ))}
            </div>
          </div>

          {/* Preview Column */}
          <div className='preview-column'>
            <div className='section-header'>
              <h2>Preview</h2>
            </div>
            <div className='preview-content'>
              {selectedDeck ? (
                <>
                  <div className='preview-header'>
                    <h3>{selectedDeck.name}</h3>
                    <div className='preview-meta'>
                      <span>{flashcards.length} Cards</span>
                      <span>•</span>
                      <span>Professor: {selectedDeck.professor}</span>
                    </div>
                  </div>
                  <div className='flashcards-list'>
                    {flashcards.map((card, index) => (
                      <div key={index} className='flashcard'>
                        <div className='flashcard-header'>Card {index + 1}</div>
                        <div className='flashcard-content'>
                          <div className='question'>{card.question}</div>
                          <div className='answer'>{card.answer}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className='empty-state'>
                  <p>Select a deck to view its contents</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDeck;