// Base URL for embedding YouTube videos (can be replaced with any legal embed format)
const EMBED_BASE_URL = "https://www.youtube.com/embed/"; 

// Get the key elements from the HTML
const streamList = document.getElementById('stream-links');
const videoEmbed = document.getElementById('video-embed');
const streamTitleHeader = document.getElementById('stream-title');
const initialMessage = document.getElementById('initial-message');

/**
 * Handles the click event on a stream link.
 * Updates the video player and hides the initial message.
 * @param {Event} event - The click event object.
 */
function changeStream(event) {
    // Ensure the click was on an <li> element
    const listItem = event.target.closest('li');
    if (!listItem) return; 

    // 1. Get the source data from the list item
    const videoId = listItem.getAttribute('data-embed-src');
    const streamTitle = listItem.getAttribute('data-title');

    // 2. Construct the full embed URL
    let fullEmbedUrl = '';

    if (videoId === 'placeholder') {
        // Handle a non-video placeholder stream
        fullEmbedUrl = '';
        videoEmbed.src = '';
        initialMessage.style.display = 'flex'; // Show the message again
        initialMessage.innerHTML = '⚠️ **Stream Unavailable:** This is a placeholder channel.';
        streamTitleHeader.textContent = streamTitle;
        return;
    }
    
    // For functional streams, construct the URL with autoplay and controls enabled
    fullEmbedUrl = `${EMBED_BASE_URL}${videoId}?autoplay=1&controls=1`;

    // 3. Update the video player
    videoEmbed.src = fullEmbedUrl;

    // 4. Update the stream title displayed above the player
    streamTitleHeader.textContent = streamTitle;

    // 5. Hide the initial message once a stream is loaded
    initialMessage.style.display = 'none'; 
}

// Attach the main event listener to the list container
streamList.addEventListener('click', changeStream);

// Initially clear the iframe source so it doesn't load a blank player 
// until a user clicks a link.
document.addEventListener('DOMContentLoaded', () => {
    videoEmbed.src = '';
});

console.log("Portal script loaded. Click a stream link to test dynamic embedding.");
