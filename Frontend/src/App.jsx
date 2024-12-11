import React, { useState, useEffect } from 'react';
import Navbar from './Components/Navbar/Navbar'
import Hero from './Components/Hero/Hero'
import AboutUs from './Components/About Us/AboutUs'
import AboutUs2 from './Components/AboutUs2/AboutUs2'
import Title from './Components/Title/Title'
import SignUp from './Components/SignUp/SignUp'
import Footer from './Components/Footer/Footer'
import AboutTitle from './Components/AboutTitle/AboutTitle'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import About from './pages/AboutPage/About';
import Dashboard from './pages/DashboardPage/Dashboard';
import Quiz from './pages/QuizPage/Quiz';
import Results from './pages/QuizPage/Results';
import SearchResults from './pages/SearchResultsPage/SearchResults';


const App = () => {
  const { user } = useUser();

  useEffect(() => {
    const fetchUser = async () => {        
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_API_HOST}/users/${user.id}`);

            if (!response.ok) {
                throw new Error(`Error fetching user: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            console.log("User data fetched successfully:", data); // Log the parsed data
        } catch (err) {
            console.error("Error fetching user data:", err); // Log errors
            setError(err.message);
        }
    };

    if (user) {
        fetchUser(); // Fetch user data when Clerk user is available
    }
  }, [user]);

  return (
    <Router>
      <div>
        <Navbar />
        <Routes> {/* Home Page */}
          <Route path="/" element={
            <>
              <Hero />
              <div className='container'>
              <AboutTitle />
              <AboutUs />
              <AboutUs2 />
              <SignedOut>
                <Title subtitle="Sign Up" title="Become a Mate" />
                <SignUp />
              </SignedOut>
              </div>
            </>
          } />
          {/* About Page */}
          <Route path="/about" element={<About />} />
          {/* Dashboard Page */}
          <Route path="/dashboard/*" element={<Dashboard />} />

          <Route path="*" element={<Navigate to="/" />} /> {/* Redirect unknown routes */}
          
          {/* Quiz and Results Pages */}
          <Route path="/quiz/:quizId" element={<Quiz />} />
          <Route path="/results/:attemptId" element={<Results />} />
          
          {/* Search Results Page */}
          <Route path="/searchresults" element={<SearchResults />} />
        </Routes>
        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;