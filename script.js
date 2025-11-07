// script.js


const API_KEY = "c8df389391mshade9381c8a69b98p1def25jsne98b66085d6d"; 

// Color palette (expanded for use in classes)
const colors = {
    'primary': '#ff6b35',
    'secondary': '#4ecdc4',
    'accent': '#ffd700',
    'bg_primary': '#0f0f23',
    'bg_tertiary': '#16213e',
    'text_primary': '#ffffff',
    'text_muted': '#888888',
    'success': '#4caf50',
    'warning': '#ff9800',
    'error': '#f44336'
};

// DOM Elements cache
const verseEntry = document.getElementById('verse-entry');
const fetchButton = document.getElementById('fetch-button');
const referenceLabel = document.getElementById('reference-label');
const sanskritText = document.getElementById('sanskrit-text');
const englishText = document.getElementById('english-text');
const statusLabel = document.getElementById('status-label');
const popularButtonsContainer = document.getElementById('popular-buttons-container');

// Chapter names for the reference display
const chapterNames = {
    1: "Arjuna's Dilemma", 2: "Sankhya Yoga", 3: "Karma Yoga", 4: "Jnana Yoga",
    5: "Renunciation of Action", 6: "Dhyana Yoga", 7: "Knowledge of the Absolute",
    8: "Attaining the Supreme", 9: "Royal Knowledge", 10: "Divine Manifestations",
    11: "Universal Form", 12: "Devotion", 13: "Nature & Enjoyer", 14: "Three Modes",
    15: "Supreme Person", 16: "Divine & Demonic", 17: "Three Types of Faith", 18: "Renunciation"
};

const popularVerses = [
    { verse: "2.47", description: "Karma Yoga", color: colors.primary },
    { verse: "18.66", description: "Surrender", color: colors.secondary },
    { verse: "9.26", description: "Devotion", color: colors.warning },
    { verse: "4.7", description: "Divine Incarnation", color: colors.success },
    { verse: "2.13", description: "Soul's Journey", color: "#9c27b0" }
];

// --- Utility & UI Functions ---

function updateStatus(message) {
    statusLabel.classList.remove('text-error', 'text-warning');
    statusLabel.classList.add('text-text-muted');
    statusLabel.textContent = message;
}

function showError(message) {
    updateStatus(`⚠️ ${message}`);
    statusLabel.classList.add('text-error');
    referenceLabel.textContent = "Please check your input and try again";
    sanskritText.textContent = "";
    englishText.textContent = "";
    // Display the error pop-up (equivalent to Python's messagebox)
    alert(`Input Error: ${message}`); 
}

function updateInputVisualFeedback() {
    verseEntry.classList.add('border-accent');
    setTimeout(() => {
        // Assuming border-secondary is set in CSS/Tailwind as default border
        verseEntry.classList.remove('border-accent');
    }, 2000);
}

function displayVerse(chapter, verse, sanskrit, english) {
    const chapterName = chapterNames[chapter] || `Chapter ${chapter}`;
    referenceLabel.textContent = `📖 Chapter ${chapter}: ${chapterName} - Verse ${verse}`;
    referenceLabel.classList.remove('text-error');
    
    // Use logical OR for fallback text
    sanskritText.textContent = sanskrit || "Sanskrit text not available";
    englishText.textContent = english || "Translation not available";
}


// --- Live API Fetch Logic (Replacing Simulation) ---

/**
 * FIX: Function rewritten to perform a live fetch from the Bhagavad Gita API.
 */
async function getGitaVerse(chapter, verse) {
    const url = `https://bhagavad-gita3.p.rapidapi.com/v2/chapters/${chapter}/verses/${verse}/`;
    
    const headers = {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': "bhagavad-gita3.p.rapidapi.com"
    };

    try {
        const response = await fetch(url, { headers: headers });

        if (!response.ok) {
            // Check for 404 specifically (verse not found)
            if (response.status === 404) {
                showError(`Verse ${chapter}.${verse} not found in the Gita. Check the number and try again.`);
            } else {
                showError(`API Error: Failed to fetch verse (Status ${response.status}).`);
            }
            return { sanskrit: null, english: null };
        }

        const verseData = await response.json();
        
        const sanskrit = verseData.text || 'Sanskrit text not available';
        let english = 'Translation not found';
        
        // Match Python logic for extracting English translation
        for (const translation of verseData.translations || []) {
            if (translation.language === 'english' && translation.description) {
                english = translation.description;
                break;
            }
        }
        
        return { sanskrit, english };

    } catch (e) {
        // Handle network/connection issues (like timeout or offline)
        showError(`Network Error: Could not connect to the API service. Check your internet connection.`);
        console.error(e);
        return { sanskrit: null, english: null };
    }
}


// --- Main Application Logic ---

async function fetchVerse() {
    const verseRef = verseEntry.value.trim();

    // 1. Initial Validation
    if (!verseRef) {
        showError("Please enter a verse reference");
        return;
    }

    if (!verseRef.includes('.')) {
        showError("Please use format: chapter.verse (e.g., 2.47)");
        return;
    }

    // 2. State & Loading
    let chapterNum, verseNum;
    try {
        const parts = verseRef.split('.');
        if (parts.length !== 2) throw new Error("Invalid format");

        chapterNum = parseInt(parts[0]);
        verseNum = parseInt(parts[1]);

        if (isNaN(chapterNum) || isNaN(verseNum)) throw new Error("Contains non-numeric parts");
        if (chapterNum < 1 || chapterNum > 18) {
            showError("Chapter must be between 1-18");
            return;
        }

        updateStatus(`🔍 Fetching sacred verse ${chapterNum}.${verseNum}...`);
        
        // Disable button and show loading state
        fetchButton.disabled = true;
        fetchButton.textContent = "⏳ LOADING...";
        fetchButton.classList.remove('bg-primary', 'hover:bg-success');
        fetchButton.classList.add('bg-text-muted');

        // 3. Data Fetch (Live)
        const { sanskrit, english } = await getGitaVerse(chapterNum, verseNum);
        
        // 4. Display Results
        if (sanskrit && english) {
            displayVerse(chapterNum, verseNum, sanskrit, english);
            updateStatus("✨ Divine wisdom received! May it illuminate your path 🙏");
        }
        // Note: If fetch fails, getGitaVerse already calls showError, so no generic else block is needed here.

    } catch (e) {
        console.error(e);
        showError(`Error processing input: ${e.message}`);
    } finally {
        // 5. Restore Button State
        fetchButton.disabled = false;
        fetchButton.textContent = "🔍 FETCH VERSE";
        fetchButton.classList.add('bg-primary', 'hover:bg-success');
        fetchButton.classList.remove('bg-text-muted');
    }
}

function setAndFetchVerse(verse) {
    verseEntry.value = verse;
    fetchVerse();
}


// --- Initialization ---

function initialize() {
    // 1. Create Popular Verse Buttons
    popularVerses.forEach(data => {
        const button = document.createElement('button');
        button.className = `popular-btn text-white popular-btn-${data.verse.replace('.', '-')}`;
        button.style.backgroundColor = data.color;
        button.style.width = '120px';
        button.innerHTML = `${data.verse}<br><span class="text-xs font-normal">${data.description}</span>`;
        
        button.addEventListener('click', () => setAndFetchVerse(data.verse));
        
        // Set specific hover colors
        const hoverClass = data.color === colors.primary ? 'hover:bg-success' : 'hover:bg-bg-tertiary';
        button.classList.add(hoverClass);

        popularButtonsContainer.appendChild(button);
    });

    // 2. Add Event Listeners
    fetchButton.addEventListener('click', fetchVerse);
    
    // Enter key press in the input field
    verseEntry.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            fetchVerse();
        }
    });

    // Visual feedback on input
    verseEntry.addEventListener('input', updateInputVisualFeedback);
    verseEntry.addEventListener('focus', updateInputVisualFeedback); 
}

// Run the initialization function when the page loads

document.addEventListener('DOMContentLoaded', initialize);
