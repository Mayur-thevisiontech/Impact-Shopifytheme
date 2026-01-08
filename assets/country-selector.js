// Demo data for testing - remove in production
window.countryData = [
    {
        name: "United States",
        iso_code: "US", 
        continent: "North America",
        currency: { iso_code: "USD", name: "US Dollar", symbol: "$" }
    },
    {
        name: "Canada",
        iso_code: "CA",
        continent: "North America", 
        currency: { iso_code: "CAD", name: "Canadian Dollar", symbol: "CA$" }
    },
    {
        name: "United Kingdom",
        iso_code: "GB",
        continent: "Europe",
        currency: { iso_code: "GBP", name: "British Pound", symbol: "£" }
    },
    {
        name: "Germany",
        iso_code: "DE",
        continent: "Europe",
        currency: { iso_code: "EUR", name: "Euro", symbol: "€" }
    },
    {
        name: "France",
        iso_code: "FR",
        continent: "Europe",
        currency: { iso_code: "EUR", name: "Euro", symbol: "€" }
    },
    {
        name: "Australia",
        iso_code: "AU",
        continent: "Oceania",
        currency: { iso_code: "AUD", name: "Australian Dollar", symbol: "A$" }
    },
    {
        name: "New Zealand",
        iso_code: "NZ",
        continent: "Oceania",
        currency: { iso_code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" }
    },
    {
        name: "Japan",
        iso_code: "JP",
        continent: "Asia",
        currency: { iso_code: "JPY", name: "Japanese Yen", symbol: "¥" }
    },
    {
        name: "Singapore",
        iso_code: "SG",
        continent: "Asia",
        currency: { iso_code: "SGD", name: "Singapore Dollar", symbol: "S$" }
    },
    {
        name: "Brazil",
        iso_code: "BR",
        continent: "South America",
        currency: { iso_code: "BRL", name: "Brazilian Real", symbol: "R$" }
    }
];

let selectedCountry = null;
let searchTimeout = null;

// Get unique continents from available countries
function getAvailableContinents() {
    const continents = [...new Set(window.countryData.map(country => country.continent))];
    return continents.sort();
}

// Get countries for a specific continent
function getCountriesForContinent(continent) {
    return window.countryData
        .filter(country => country.continent === continent)
        .sort((a, b) => a.name.localeCompare(b.name));
}

// Search countries
function searchCountries(query) {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase().trim();
    return window.countryData
        .filter(country => 
            country.name.toLowerCase().includes(searchTerm) ||
            country.iso_code.toLowerCase().includes(searchTerm) ||
            country.currency.iso_code.toLowerCase().includes(searchTerm) ||
            country.currency.name.toLowerCase().includes(searchTerm)
        )
        .sort((a, b) => {
            // Prioritize matches that start with the search term
            const aStartsWith = a.name.toLowerCase().startsWith(searchTerm);
            const bStartsWith = b.name.toLowerCase().startsWith(searchTerm);
            
            if (aStartsWith && !bStartsWith) return -1;
            if (!aStartsWith && bStartsWith) return 1;
            
            return a.name.localeCompare(b.name);
        });
}

// Highlight search terms in text
function highlightText(text, searchTerm) {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

// Handle search input
function handleSearch() {
    const searchInput = document.getElementById('country-search');
    const clearButton = document.getElementById('clear-search');
    const searchResults = document.getElementById('search-results');
    const accordionSections = document.querySelectorAll('.accordion-section');
    
    const query = searchInput.value.trim();
    
    // Show/hide clear button
    if (query) {
        clearButton.classList.remove('hidden');
    } else {
        clearButton.classList.add('hidden');
    }
    
    // Clear previous timeout
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    // Debounce search
    searchTimeout = setTimeout(() => {
        if (query) {
            // Show search results
            showSearchResults(searchCountries(query), query);
            searchResults.classList.remove('hidden');
            accordionSections.forEach(section => section.style.display = 'none');
        } else {
            // Show accordion
            searchResults.classList.add('hidden');
            accordionSections.forEach(section => section.style.display = 'block');
        }
    }, 200);
}

// Show search results
function showSearchResults(countries, searchTerm) {
    const searchResultsList = document.getElementById('search-results-list');
    
    if (countries.length === 0) {
        searchResultsList.innerHTML = '<div class="no-results">No countries found matching your search.</div>';
        return;
    }
    
    searchResultsList.innerHTML = '';
    
    countries.forEach(country => {
        const countryItem = document.createElement('div');
        countryItem.className = 'country-item';
        
        const highlightedName = highlightText(country.name, searchTerm);
        const highlightedCurrency = highlightText(`${country.currency.symbol} ${country.currency.iso_code}`, searchTerm);
        
        countryItem.innerHTML = `
            <span class="country-name">${highlightedName}</span>
            <span class="country-currency">(${highlightedCurrency})</span>
        `;
        countryItem.onclick = () => selectCountry(country, countryItem);
        searchResultsList.appendChild(countryItem);
    });
}

// Clear search
function clearSearch() {
    const searchInput = document.getElementById('country-search');
    const clearButton = document.getElementById('clear-search');
    const searchResults = document.getElementById('search-results');
    const accordionSections = document.querySelectorAll('.accordion-section');
    
    searchInput.value = '';
    clearButton.classList.add('hidden');
    searchResults.classList.add('hidden');
    accordionSections.forEach(section => section.style.display = 'block');
    
    searchInput.focus();
}

// Open modal
function openModal() {
    document.getElementById('modal-overlay').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    initializeSelector();
    
    // Focus search input after modal opens
    setTimeout(() => {
        document.getElementById('country-search').focus();
    }, 100);
}

// Close modal
function closeModal(event) {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById('modal-overlay').classList.add('hidden');
    document.body.style.overflow = 'auto';
    
    // Reset search when closing
    clearSearch();
}

// Initialize the selector
function initializeSelector() {
    const modalBody = document.getElementById('modal-body');
    const loading = document.getElementById('loading');

    // Check if countryData is available
    if (typeof window.countryData === 'undefined' || window.countryData.length === 0) {
        loading.textContent = 'Error: Country data not available. Please refresh the page.';
        return;
    }

    // Hide loading and build accordion
    loading.style.display = 'none';
    buildAccordion();
    setupSearchListeners();
}

// Setup search event listeners
function setupSearchListeners() {
    const searchInput = document.getElementById('country-search');
    
    searchInput.addEventListener('input', handleSearch);
    searchInput.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            clearSearch();
        }
    });
}

// Build accordion structure
function buildAccordion() {
    const modalBody = document.getElementById('modal-body');
    const continents = getAvailableContinents();
    
    // Find existing accordion sections or create container
    let accordionContainer = modalBody.querySelector('.accordion-container');
    if (!accordionContainer) {
        accordionContainer = document.createElement('div');
        accordionContainer.className = 'accordion-container';
        modalBody.appendChild(accordionContainer);
    }

    accordionContainer.innerHTML = '';

    continents.forEach(continent => {
        const countries = getCountriesForContinent(continent);
        
        // Create accordion section
        const section = document.createElement('div');
        section.className = 'accordion-section';

        // Create accordion header
        const header = document.createElement('button');
        header.className = 'accordion-header';
        header.innerHTML = `
            <span>${continent}</span>
            <span class="accordion-icon">▼</span>
        `;
        header.onclick = () => toggleAccordion(header);

        // Create accordion content
        const content = document.createElement('div');
        content.className = 'accordion-content';

        const countryList = document.createElement('div');
        countryList.className = 'country-list';

        countries.forEach(country => {
            const countryItem = document.createElement('div');
            countryItem.className = 'country-item';
            countryItem.innerHTML = `
                <span class="country-name">${country.name}</span>
                <span class="country-currency">(${country.currency.symbol} ${country.currency.iso_code})</span>
            `;
            countryItem.onclick = () => selectCountry(country, countryItem);
            countryList.appendChild(countryItem);
        });

        content.appendChild(countryList);
        section.appendChild(header);
        section.appendChild(content);
        accordionContainer.appendChild(section);
    });
}

// Toggle accordion section
function toggleAccordion(header) {
    const content = header.nextElementSibling;
    const icon = header.querySelector('.accordion-icon');
    
    // Close all other sections
    document.querySelectorAll('.accordion-header').forEach(h => {
        if (h !== header) {
            h.classList.remove('active');
            h.nextElementSibling.classList.remove('active');
        }
    });

    // Toggle current section
    header.classList.toggle('active');
    content.classList.toggle('active');
}

// Handle country selection
function selectCountry(country, element) {
    selectedCountry = country;

    // Update UI to show selection
    document.querySelectorAll('.country-item').forEach(item => {
        item.classList.remove('selected');
    });
    element.classList.add('selected');

    // Change store currency after a short delay
    setTimeout(() => {
        changeStoreCurrency(country);
    }, 300);
}

// Change store currency - Shopify integration
function changeStoreCurrency(country) {
    console.log(`Changing currency to: ${country.currency.iso_code} for country: ${country.iso_code}`);
    
    // Method 1: Using Shopify's localization form (Recommended)
    if (document.querySelector('form[action*="localization"]')) {
        submitLocalizationForm(country);
    } else {
        // Method 2: URL parameter approach
        updateCurrencyViaURL(country);
    }
}

// Method 1: Submit Shopify localization form
function submitLocalizationForm(country) {
    // Create or update localization form
    let form = document.querySelector('form[action*="localization"]');
    
    if (!form) {
        form = document.createElement('form');
        form.method = 'post';
        form.action = window.routes?.cart_update_url || '/cart/update';
        form.style.display = 'none';
        document.body.appendChild(form);
    }

    // Add/update country input
    let countryInput = form.querySelector('input[name="country_code"]');
    if (!countryInput) {
        countryInput = document.createElement('input');
        countryInput.type = 'hidden';
        countryInput.name = 'country_code';
        form.appendChild(countryInput);
    }
    countryInput.value = country.iso_code;

    // Add/update currency input
    let currencyInput = form.querySelector('input[name="currency_code"]');
    if (!currencyInput) {
        currencyInput = document.createElement('input');
        currencyInput.type = 'hidden';
        currencyInput.name = 'currency_code';
        form.appendChild(currencyInput);
    }
    currencyInput.value = country.currency.iso_code;

    // Add return URL
    let returnInput = form.querySelector('input[name="return_to"]');
    if (!returnInput) {
        returnInput = document.createElement('input');
        returnInput.type = 'hidden';
        returnInput.name = 'return_to';
        form.appendChild(returnInput);
    }
    returnInput.value = window.location.pathname + window.location.search;

    // Submit the form
    form.submit();
}

// Method 2: URL parameter approach (fallback)
function updateCurrencyViaURL(country) {
    const url = new URL(window.location);
    url.searchParams.set('currency', country.currency.iso_code);
    url.searchParams.set('country', country.iso_code);
    
    // Redirect to update the store
    window.location.href = url.toString();
}

// Handle escape key to close modal
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('modal-overlay');
        if (!modal.classList.contains('hidden')) {
            closeModal();
        }
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Auto-open modal for demo - remove in production
    // setTimeout(openModal, 1000);
});
