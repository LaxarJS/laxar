export function create( artifactProvider, cssLoader ) {
   return {
      load() {
         const themeProvider = artifactProvider.forTheme();
         themeProvider.descriptor( descriptor =>
            themeProvider.assetUrl( descriptor.styleSource || 'css/theme.css' ).then( cssLoader.load )
         );
      }
   };
}
