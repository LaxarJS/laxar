export function create() {
   return jasmine.createSpyObj( 'cssLoader', [ 'load' ] );
}
