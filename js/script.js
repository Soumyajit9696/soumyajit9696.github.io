
// Preloader (only on index.html / home page)

const preloaderStartedAt = Date.now();
const welcomeWords = ['Welcome', 'स्वागत है', 'স্বাগতম', 'Bienvenue', 'Bienvenido', 'ようこそ'];
const welcomeWord = document.getElementById('welcome-word');
let welcomeIndex = 0;
let welcomeTimer;

const splitGraphemes = (word) => {
    if (window.Intl && Intl.Segmenter) {
        return Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(word), ({ segment }) => segment);
    }
    return Array.from(word);
};
const renderWelcomeWord = (word) => {
    welcomeWord.replaceChildren();
    splitGraphemes(word).forEach((character, index) => {
        const letter = document.createElement('span');
        letter.className = 'welcome-letter';
        letter.textContent = character === ' ' ? '\u00A0' : character;
        letter.style.animationDelay = `${index * 35}ms`;
        welcomeWord.appendChild(letter);
    });
};

if (welcomeWord) {
    renderWelcomeWord(welcomeWords[welcomeIndex]);
    welcomeTimer = setInterval(function(){
        welcomeWord.classList.add('is-leaving');
        setTimeout(function(){
            welcomeIndex = (welcomeIndex + 1) % welcomeWords.length;
            renderWelcomeWord(welcomeWords[welcomeIndex]);
            welcomeWord.classList.remove('is-leaving');
        }, 170);
    }, 700);
}

window.addEventListener('load', function(){
    const preloader = document.querySelector('.preloader');
    if (!preloader) return;

    const remainingWelcomeTime = Math.max(0, 2800 - (Date.now() - preloaderStartedAt));
    setTimeout(function(){
        clearInterval(welcomeTimer);
        preloader.classList.add('opacity-0');
        setTimeout(function(){
            preloader.style.display = 'none';
        }, 1000);
    }, remainingWelcomeTime);
});

// iTyped (only on home page)
if (document.querySelector('.iTyped')) {
    window.ityped.init(document.querySelector('.iTyped'), {
        strings: ["I'm a Physics Graduate", 'I Love Computers', 'I Love Python', 'I Love Linux', 'I Love Condensed Matter Physics'],
        loop: true
    });
}

// Mobile Nav Toggler
const navTogglerBtn = document.querySelector('.nav-toggler'),
    aside = document.querySelector('.aside');

if (navTogglerBtn && aside) {
    navTogglerBtn.addEventListener('click', function() {
        aside.classList.toggle('open');
        navTogglerBtn.classList.toggle('open');
        // Toggle open on all sections so they shift right on mobile
        document.querySelectorAll('.section').forEach(function(section) {
            section.classList.toggle('open');
        });
    });
}

// Gallery Item Filter & Lightbox (only on gallery.html)
function initGallery() {
    const filterContainer = document.querySelector('.gallery-filter-bar');
    const galleryGrid = document.getElementById('galleryGrid');
    const galleryLightbox = document.getElementById('galleryLightbox');
    
    if (!filterContainer || !galleryGrid) return;

    // Filter Logic
    const filterBtns = filterContainer.querySelectorAll('.filter-pill');
    let galleryItems = Array.from(galleryGrid.querySelectorAll('.gallery-card'));

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterContainer.querySelector('.active').classList.remove('active');
            this.classList.add('active');

            const filterValue = this.getAttribute('data-filter');
            galleryItems.forEach(item => {
                if (filterValue === 'all' || filterValue === item.getAttribute('data-category')) {
                    item.classList.remove('hide');
                    item.classList.add('show');
                } else {
                    item.classList.remove('show');
                    item.classList.add('hide');
                }
            });
        });
    });

    // Lightbox Logic
    if (galleryLightbox) {
        const glbImg = document.getElementById('glbImg');
        const glbTitle = document.getElementById('glbTitle');
        const glbCounter = document.getElementById('glbCounter');
        const glbClose = document.getElementById('glbClose');
        const glbPrev = document.getElementById('glbPrev');
        const glbNext = document.getElementById('glbNext');
        
        let currentItemIndex = 0;
        let visibleItems = [];

        function updateVisibleItems() {
            visibleItems = Array.from(galleryGrid.querySelectorAll('.gallery-card')).filter(item => !item.classList.contains('hide'));
        }

        function openLightbox(index) {
            updateVisibleItems();
            currentItemIndex = index;
            updateLightboxContent();
            galleryLightbox.classList.add('open');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            galleryLightbox.classList.remove('open');
            document.body.style.overflow = '';
        }

        function updateLightboxContent() {
            if (visibleItems.length === 0) return;
            const item = visibleItems[currentItemIndex];
            const img = item.querySelector('img');
            const title = item.querySelector('h4');
            
            if(img) glbImg.src = img.src;
            glbTitle.textContent = title ? title.textContent : '';
            glbCounter.textContent = `${currentItemIndex + 1} of ${visibleItems.length}`;
        }

        function prevImage() {
            currentItemIndex = (currentItemIndex === 0) ? visibleItems.length - 1 : currentItemIndex - 1;
            updateLightboxContent();
        }

        function nextImage() {
            currentItemIndex = (currentItemIndex === visibleItems.length - 1) ? 0 : currentItemIndex + 1;
            updateLightboxContent();
        }

        // Attach event listener to grid to catch clicks on any card (even dynamically added ones)
        galleryGrid.addEventListener('click', function(e) {
            const card = e.target.closest('.gallery-card');
            if (card) {
                updateVisibleItems();
                const index = visibleItems.indexOf(card);
                if (index > -1) {
                    openLightbox(index);
                }
            }
        });

        glbClose.addEventListener('click', closeLightbox);
        glbPrev.addEventListener('click', prevImage);
        glbNext.addEventListener('click', nextImage);
        
        galleryLightbox.addEventListener('click', function(e) {
            if (e.target.classList.contains('glb-backdrop')) {
                closeLightbox();
            }
        });
    }
}
initGallery();
window.initGallery = initGallery;

// AI Arts Lightbox (only on ai-arts.html)
const aiArtsLightbox = document.querySelector('.ai-arts-lightbox'),
    aiArtsLightboxImg = aiArtsLightbox ? aiArtsLightbox.querySelector('.ai-arts-lightbox-img') : null,
    aiArtsLightboxText = aiArtsLightbox ? aiArtsLightbox.querySelector('.ai-arts-caption-text') : null,
    aiArtsLightboxClose = aiArtsLightbox ? aiArtsLightbox.querySelector('.ai-arts-lightbox-close') : null,
    aiArtsLightboxCounter = aiArtsLightbox ? aiArtsLightbox.querySelector('.ai-arts-caption-counter') : null,
    aiArtsDownloadButton = aiArtsLightbox ? aiArtsLightbox.querySelector('.ai-arts-download-button') : null;

let aiArtsItemIndex = 0;
const aiArtsItems = document.querySelectorAll('.ai-arts-item');
const aiArtsTotalItems = aiArtsItems.length;

if (aiArtsLightbox) {
    for (let i = 0; i < aiArtsTotalItems; i++) {
        aiArtsItems[i].addEventListener('click', function(){
            aiArtsItemIndex = i;
            aiArtsChangeItem();
            aiArtsToggleLightbox();
        });
    }

    function aiArtsToggleLightbox() {
        aiArtsLightbox.classList.toggle('open');
    }

    function aiArtsChangeItem() {
        let imgSrc = aiArtsItems[aiArtsItemIndex].querySelector('.ai-arts-img img').getAttribute('src');
        if(aiArtsLightboxImg) aiArtsLightboxImg.src = imgSrc;
        if(aiArtsLightboxText) aiArtsLightboxText.innerHTML = "";
        if(aiArtsLightboxCounter) aiArtsLightboxCounter.innerHTML = (aiArtsItemIndex + 1) + " of " + aiArtsTotalItems;
        if(aiArtsDownloadButton) aiArtsDownloadButton.href = imgSrc;
    }

    if(aiArtsLightboxClose) {
        aiArtsLightboxClose.addEventListener('click', aiArtsToggleLightbox);
    }
    aiArtsLightbox.addEventListener('click', function(event){
        if(event.target === aiArtsLightbox){
            aiArtsToggleLightbox();
        }
    });
}

// Resources Animation
const resourceItems = document.querySelectorAll('.resource-item');
resourceItems.forEach(item => {
  item.addEventListener('mouseover', () => {
    item.querySelector('.resource').classList.add('animate');
  });
  item.addEventListener('mouseout', () => {
    item.querySelector('.resource').classList.remove('animate');
  });
});
