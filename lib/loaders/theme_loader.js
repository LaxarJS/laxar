export function create( artifactProvider, cssLoader ) {
   return {
      load() {
         artifactProvider.forTheme().assetUrl( 'css/theme.css' ).then( cssLoader.load );
      }
   };
}
