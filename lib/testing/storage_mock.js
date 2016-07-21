export function create() {

   const spy = name => jasmine.createSpy( name );

   const backends = {
      local: {},
      session: {}
   };

   function mockBackend( type ) {
      const store = {};
      return {
         setItem: spy( `${type}.setItem` ).and.callFake( ( k, v ) => { store[ k ] = v; } ),
         getItem: spy( `${type}.getItem` ).and.callFake( k => store[ k ] ),
         removeItem: spy( `${type}.removeItem` ).and.callFake( k => { delete store[ k ]; } )
      };
   }


   function mockStorage( type ) {
      return prefix => {
         if( !backends[ type ][ prefix ] ) {
            backends[ type ][ prefix ] = mockBackend( type );
         }
         return backends[ type ][ prefix ];
      };
   }

   return {
      getLocalStorage: spy( 'getLocalStorage' ).and.callFake( mockStorage( 'local' ) ),
      getSessionStorage: spy( 'getSessionStorage' ).and.callFake( mockStorage( 'session' ) ),
      mockBackends: backends
   };
}
