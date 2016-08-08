export function create() {
   return {
      aliases: {
         themes: { western: 0, 'default': 1 },
         flows: { main: 0 },
         widgets: { 'amd:hallo-widget': 0 }
      },
      flows: [ {
         descriptor: {
            name: 'mainz'
         },
         definition: {
            places: {
            }
         }
      } ],
      themes: [
         {
            descriptor: {
               name: 'best.theme'
            },
            assets: {
               'css/theme.css': {
                  url: 'path/to/best/theme.css'
               }
            }
         },
         {
            descriptor: {
               name: 'default.theme'
            },
            assets: {
               'css/theme.css': {
                  url: 'path/to/best/default.css'
               }
            }
         }
      ],
      widgets: [
         {
            descriptor: {
               name: 'some-widget'
            },
            module: {},
            assets: {
               'best.theme': {
                  'css/some-widget.css': { url: 'path/to/best/css' }
               },
               'default.theme': {
                  'some-widget.html': { content: '<blink>182</blink>' },
                  'css/some-widget.css': { url: 'path/to/default/css' },
                  'icon.png': { url: 'path/to/icon' }
               },
               'image.png': { url: 'the/image.png' },
               'messages.json': { content: '{ "myMessage": "hey!" }' },
               'messages.de.json': { url: 'ganz/egal/wo' }
            }
         }
      ]
   };
}
