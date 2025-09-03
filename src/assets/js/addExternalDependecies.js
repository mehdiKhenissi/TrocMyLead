export function addExternalDependecies(href, type, target) {
    let file = null;
    if(type === 'javascript'){
        file = document.createElement('script');
        file.src = href;
    }
    else{
        file = document.createElement('link');
        file.rel = 'stylesheet';
        file.href = href;
    }
    
    if (target === 'head') {
      document.head.appendChild(file);
    } else if (target === 'footer') {
      document.body.appendChild(file);
    }
  }