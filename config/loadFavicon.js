var favicon = document.createElement('link');
favicon.rel = 'icon';
favicon.id = 'dynamicFavicon';
favicon.href = winkstart.config.favicon || 'img/wsLogo.png';
document.getElementsByTagName('head')[0].appendChild(favicon);

