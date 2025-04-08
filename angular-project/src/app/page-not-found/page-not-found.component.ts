import { Component } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.css'
})
export class PageNotFoundComponent {

  constructor(private metaService: Meta){
    this.metaService.updateTag({
      name: 'description',
      content: 'Pravdepodobne ste zadali zlý odkaz alebo stránka bola presunutá!'
    })
    this.metaService.updateTag({
      name: 'robots',
      content: 'noindex, follow' //noindex nech sa neobjavi vo vysledkoch vyhľadávania, follow aby mohol prehliadač nasledovať odkazy a je to pre roboty vyhľadávačov, SEO je search engine optimalization!
    })
  }
}
