<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Functional Streaming Portal Mockup</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <h1>Education Stream Demo 🎓</h1>
        <p>This script demonstrates the dynamic video embedding required for a streaming site.</p>
    </header>
    
    <div class="main-container">
        <section class="video-player-area">
            <h2 id="stream-title">Select a Stream to Begin</h2>
            <div id="video-player-wrapper">
                <iframe id="video-embed" 
                    src="" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
                <div id="initial-message">
                    Click a stream on the right to load the player.
                </div>
            </div>
        </section>
        
        <aside class="stream-list-area">
            <h2>Available Educational Streams</h2>
            <ul id="stream-links">
                <li data-embed-src="Lw5r_L4Yq4I" data-title="HTML & CSS Basics">Stream 1: Web Dev Intro</li>
                <li data-embed-src="An_f-P-g_W4" data-title="JavaScript Fundamentals">Stream 2: JS Deep Dive</li>
                <li data-embed-src="placeholder" data-title="Placeholder Channel">Stream 3: Dummy Channel</li>
            </ul>
        </aside>
    </div>
    
    <footer>
        <p>Disclaimer: This is for educational demonstration only. Content must be legally licensed.</p>
    </footer>

    <script src="script.js"></script>
</body>
</html>
