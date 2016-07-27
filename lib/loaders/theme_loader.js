export function create( artifactProvider, cssLoader ) {
   return {
      load() {
         artifactProvider.forTheme().assetUrlForTheme( 'css/theme.css' ).then( cssLoader.load );
      }
   };
}
