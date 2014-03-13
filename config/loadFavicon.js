var favicon = document.createElement('link');
favicon.rel = 'icon';
favicon.href = winkstart.config.favicon || 'img/wsLogo.png';
document.getElementsByTagName('head')[0].appendChild(favicon);
