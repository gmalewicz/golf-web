import { NgModule } from '@angular/core';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';

import { faPlay, faSearchPlus } from '@fortawesome/free-solid-svg-icons';

@NgModule({
  imports: [ FontAwesomeModule ],
  exports: [ FontAwesomeModule ]
})
export class IconsModule {
  constructor(library: FaIconLibrary) {
    // add icons to the library for convenient access in other components
    library.addIcons(faPlay, faSearchPlus);
  }
}
