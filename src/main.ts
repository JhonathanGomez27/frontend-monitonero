fetch('/assets/config.json')
  .then(response => response.json())
  .then(config => {
    window['appConfig'] = config;
    import('./bootstrap').then(module => module.bootstrap());
  })
;
