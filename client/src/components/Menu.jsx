import React, { useState, useRef, useEffect } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import './Menu.css';
import { useGameLogicContext, useSearchContext, useBoardContext } from '../hooks/contextHooks'; // Corrected import
import HowToPlay from './HowToPlay';
import About from './About';

function Menu(props) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [showHowToPlay, setShowHowToPlay] = useState(false); 
    const [showAbout, setShowAbout] = useState(false); 
    const menuRef = useRef(null);

    // Destructure from GameLogicContext for game logic and auth
    const { 
        resetGame: resetGameLogic, 
        isLoggedIn, 
        login, 
        logout, 
        register 
    } = useGameLogicContext(); 

    // Destructure from SearchContext for search-related actions
    const { 
        toggleShowAllSearchable: toggleShowAllSearchableSearch 
    } = useSearchContext();

    const { nodes } = useBoardContext(); 
    const { gameStarted, startActors } = useGameLogicContext(); 

    const handleMenuToggle = () => {
        setMenuOpen(prev => !prev);
        if (showHowToPlay) setShowHowToPlay(false); 
        if (showAbout) setShowAbout(false); 
    };

    const handleLogin = () => {
        console.log('Login action triggered');
        if (login) login(); 
        setMenuOpen(false);
    };

    const handleLogout = () => {
        console.log('Logout action triggered');
        if (logout) logout(); 
        setMenuOpen(false);
    };

    const handleRegister = () => {
        console.log('Register action triggered');
        if (register) register(); 
        setMenuOpen(false);
    };

    const handleHowToPlay = () => {
        setShowHowToPlay(prev => !prev); 
        setMenuOpen(false); 
    };

    const handleLeaderboard = () => {
        console.log('Leaderboard action triggered');
        setMenuOpen(false);
    };

    const handleChallengeMode = () => {
        console.log('Challenge Mode action triggered');
        setMenuOpen(false);
    };

    const handleAbout = () => {
        setShowAbout(prev => !prev); 
        setMenuOpen(false); 
    };

    const handleNewGame = () => {
        if (resetGameLogic) resetGameLogic(); 
        setMenuOpen(false);
    };

    const handleCheatSheet = () => {
        if (toggleShowAllSearchableSearch) toggleShowAllSearchableSearch(nodes, gameStarted, startActors);
        setMenuOpen(false);
    };
    
    const handleSettings = () => {
        console.log('Settings action triggered');
        setMenuOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        if (menuOpen || showHowToPlay || showAbout) { 
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuOpen, showHowToPlay, showAbout]);

    const closeHowToPlay = () => {
        setShowHowToPlay(false);
    };

    const closeAbout = () => {
        setShowAbout(false);
    };

    return (
        <> 
            <div className="menu-container" ref={menuRef}>
                <button className="menu-button" onClick={handleMenuToggle}>
                    <MenuIcon fontSize="large" /> 
                    <span style={{ marginLeft: '8px' }}>Menu</span>
                </button>

                {menuOpen && (
                    <div className="menu-dropdown">
                        {isLoggedIn === undefined || !isLoggedIn ? (
                            <>
                                <button onClick={handleLogin} className="menu-item">Login</button>
                                <button onClick={handleRegister} className="menu-item">Register</button>
                            </>
                        ) : (
                            <button onClick={handleLogout} className="menu-item">Logout</button>
                        )}

                        {props.parentName === 'StartScreen' && (
                            <>
                            <button onClick={handleChallengeMode} className="menu-item">Challenge Mode</button>
                            <button onClick={handleLeaderboard} className="menu-item">Leaderboard</button>
                            <button onClick={handleAbout} className="menu-item">About</button>
                            </>)}
                        {props.parentName === 'BoardHeader' && (
                            <>
                            <button onClick={handleNewGame} className="menu-item">New Game</button>
                            <button onClick={handleLeaderboard} className="menu-item">Leaderboard</button>
                            <button onClick={handleHowToPlay} className="menu-item">How to Play</button>
                            <button onClick={handleCheatSheet} className="menu-item">Cheat Sheet</button>
                            </>)}
                        <button onClick={handleSettings} className="menu-item">Settings</button>
                    </div>
                )}
            </div>
            {showHowToPlay && <HowToPlay onClose={closeHowToPlay} />}
            {showAbout && <About onClose={closeAbout}/>}
        </>
    );
}
export default Menu;