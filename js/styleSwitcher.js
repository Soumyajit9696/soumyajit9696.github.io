const links = document.querySelectorAll('.alternate-style'),
    totalLinks = links.length;

function setActiveStyle(color)
{
    localStorage.setItem('soumyajit_color', color);
    const colorMap = {
        'pink': '#ec1839',
        'blue': '#2196f3',
        'orange': '#fa5b0f',
        'yellow': '#ffb400',
        'green': '#72b626'
    };
    if (colorMap[color]) {
        document.documentElement.style.setProperty('--skin-color', colorMap[color]);
    }
}

// body skin
const bodySkin = document.querySelectorAll('.body-skin'),
    totalBodySkin = bodySkin.length;

for (let i = 0; i < totalBodySkin; i++) {
    bodySkin[i].addEventListener('change', function(){
        if(this.value === 'dark'){
            document.body.className = 'dark';
            localStorage.setItem('soumyajit_skin', 'dark');
        } else {
            document.body.className = '';
            localStorage.setItem('soumyajit_skin', 'light');
        }
    });
}

const toggleSwitcher = document.querySelector('.toggle-style-switcher');
if (toggleSwitcher) {
    toggleSwitcher.addEventListener('click', () => {
        document.querySelector('.style-switcher').classList.toggle('open');
    });
}

// === APPLY SAVED SETTINGS ON LOAD ===

// Apply skin immediately
const savedSkin = localStorage.getItem('soumyajit_skin');
if (savedSkin === 'dark') {
    document.body.className = 'dark';
} else if (savedSkin === 'light') {
    document.body.className = '';
}

// Apply color immediately
const savedColor = localStorage.getItem('soumyajit_color');
if (savedColor) {
    setActiveStyle(savedColor);
}

// Sync UI radio buttons when DOM is fully ready
window.addEventListener('DOMContentLoaded', () => {
    if (savedSkin === 'dark') {
        const darkRadio = document.querySelector('.body-skin[value="dark"]');
        if (darkRadio) darkRadio.checked = true;
    } else if (savedSkin === 'light') {
        const lightRadio = document.querySelector('.body-skin[value="light"]');
        if (lightRadio) lightRadio.checked = true;
    }
});