
// Preloader

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
// iTyped 

window.ityped.init(document.querySelector('.iTyped'), {
    strings: ["I'm a Physics Graduate", 'I Love Computers', 'I Love Python', 'I Love Linux', 'I Love Condensed Matter Physics'],
    loop: true
});

// Gallery Item Filter

const filterContainer = document.querySelector('.gallery-filter'),
    filterBtns = filterContainer.children,
    totalFilterBtn = filterBtns.length,
    galleryItems = document.querySelectorAll('.gallery-item'),
    totalGalleryItem = galleryItems.length;
    
    for (let i = 0; i < totalFilterBtn; i++) {
        filterBtns[i].addEventListener("click", function(){
            filterContainer.querySelector('.active').classList.remove('active');
            this.classList.add("active");

            const filterValue = this.getAttribute('data-filter');
            for (let k = 0; k < totalGalleryItem; k++) {
                if (filterValue === galleryItems[k].getAttribute('data-category')) {
                    galleryItems[k].classList.remove('hide');
                    galleryItems[k].classList.add('show');
                } else{
                    galleryItems[k].classList.remove('show');
                    galleryItems[k].classList.add('hide');
                }
                if (filterValue === 'all') {
                    galleryItems[k].classList.remove('hide');
                    galleryItems[k].classList.add('show');
                }
            }
        });
    }

// Gallery Lighbox

const lightbox = document.querySelector('.lightbox'),
    lightboxImg = lightbox.querySelector('.lightbox-img'),
    lightboxText = lightbox.querySelector('.caption-text'),
    lightboxClose = lightbox.querySelector('.lightbox-close'),
    lightboxCounter = lightbox.querySelector('.caption-counter');


let itemIndex = 0;

for (let i = 0; i < totalGalleryItem; i++) {
    galleryItems[i].addEventListener('click', function(){
        itemIndex = i;
        changeItem();
        toggleLightbox();
    });
}

function toggleLightbox() {
    lightbox.classList.toggle('open');
}

function changeItem() {
    let imgSrc = galleryItems[itemIndex].querySelector('.gallery-img img').getAttribute('src');
    lightboxImg.src = imgSrc;
    lightboxText.innerHTML = galleryItems[itemIndex].querySelector('h4').innerHTML;
    lightboxCounter.innerHTML = (itemIndex + 1) + " of " + totalGalleryItem;
}

function prevItem() {
    if (itemIndex === 0) {
        itemIndex = totalGalleryItem - 1;
    } else {
        itemIndex--;
    }
    changeItem();
}

function nextItem() {
    if (itemIndex === totalGalleryItem - 1) {
        itemIndex = 0;
    } else {
        itemIndex++;
    }
    changeItem();
}

// close lightbox

lightbox.addEventListener('click', function(event){
    if(event.target === lightboxClose || event.target === lightbox){
        toggleLightbox();
    }
});

// Aside Navbar

const nav = document.querySelector('.nav'),
    navList = nav.querySelectorAll('li'),
    totalNavList = navList.length,
    allSection = document.querySelectorAll('.section'),
    totalSection = allSection.length;

for (let i = 0; i < totalNavList; i++) {
    const a = navList[i].querySelector('a');
    a.addEventListener('click', function(){
        // remove back section class
        removeBackSectionClass();

        for (let j = 0; j < totalNavList; j++) {
            if (navList[j].querySelector('a').classList.contains('active')) {
                // add back section class
                addBackSectionClass(j);
            }
            navList[j].querySelector('a').classList.remove('active');
        }

        this.classList.add('active');

        showSection(this);

        if (window.innerWidth < 1200) {
            asideSectionTogglerBtn();
        }

    });
}

function addBackSectionClass(num) 
{
    allSection[num].classList.add('back-section');
}

function removeBackSectionClass() 
{
    for (let i = 0; i < totalSection; i++) {
        allSection[i].classList.remove('back-section');
    }
}

function updateNav(element) 
{
    for (let i = 0; i < totalNavList; i++) {
        navList[i].querySelector('a').classList.remove('active');
        const target = element.getAttribute('href').split('#')[1];
        if (target === navList[i].querySelector('a').getAttribute('href').split('#')[1]) {
            navList[i].querySelector('a').classList.add('active');
        }
    }
}

document.querySelector('.hire-me').addEventListener('click', function(){
    const sectionIndex = this.getAttribute('data-section-index');
    addBackSectionClass(sectionIndex);
    showSection(this);
    updateNav(this);
    removeBackSectionClass();
});

function showSection(element) 
{
    for (let i = 0; i < totalSection; i++) {
        allSection[i].classList.remove('active');
    }

    const target = element.getAttribute('href').split('#')[1];

    document.querySelector('#'+target).classList.add('active');
}

const navTogglerBtn = document.querySelector('.nav-toggler'),
    aside = document.querySelector('.aside');

navTogglerBtn.addEventListener('click', asideSectionTogglerBtn);

function asideSectionTogglerBtn() 
{
    aside.classList.toggle('open');
    navTogglerBtn.classList.toggle('open');
    for (let i = 0; i < totalSection; i++) {
        allSection[i].classList.toggle('open');
    }
}

// AI Arts Lightbox
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
        if(aiArtsLightboxText) aiArtsLightboxText.innerHTML = ""; // Remove the AI Art name
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
