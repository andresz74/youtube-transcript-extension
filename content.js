// Example: Detect the YouTube video page load and interact with it
if (window.location.host === 'www.youtube.com' && window.location.pathname.includes('watch')) {
    console.log('YouTube Video Page Loaded');
    // You can trigger transcript extraction logic here.
}