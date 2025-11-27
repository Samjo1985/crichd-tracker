/* Basic Reset and Setup */
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #0e0e0e; /* Dark theme */
    color: #f0f0f0;
}

header {
    background-color: #333;
    padding: 20px;
    text-align: center;
    border-bottom: 3px solid #007bff;
}

.main-container {
    display: flex; 
    flex-wrap: wrap; /* Allows wrapping on smaller screens */
    max-width: 1400px;
    margin: 20px auto;
    gap: 20px;
    padding: 0 10px;
}

/* Video Player Styling */
.video-player-area {
    flex: 3; 
    min-width: 60%;
}

#video-player-wrapper {
    position: relative;
    width: 100%;
    /* 16:9 Aspect Ratio (9/16 * 100%) */
    padding-bottom: 56.25%; 
    height: 0;
    background-color: #000;
    border-radius: 8px;
    overflow: hidden;
}

#video-embed {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
}

#initial-message {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5em;
    background-color: #1a1a1a;
    z-index: 10;
}

/* Stream List Styling */
.stream-list-area {
    flex: 1; 
    min-width: 300px;
    background-color: #1a1a1a;
    padding: 15px;
    border-radius: 8px;
    border: 1px solid #333;
}

#stream-links {
    list-style: none;
    padding: 0;
}

#stream-links li {
    background-color: #333;
    padding: 15px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s;
    border-radius: 4px;
    font-weight: bold;
}

#stream-links li:hover {
    background-color: #007bff; /* Primary action color */
    color: white;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .main-container {
        flex-direction: column;
    }
    .video-player-area, .stream-list-area {
        min-width: 100%;
    }
}
