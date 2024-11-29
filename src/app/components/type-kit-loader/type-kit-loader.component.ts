import {Component, OnInit, Renderer2} from '@angular/core';

@Component({
  selector: 'app-type-kit-loader',
  standalone: true,
  imports: [],
  templateUrl: './type-kit-loader.component.html',
  styleUrl: './type-kit-loader.component.scss'
})
export class TypekitLoaderComponent implements OnInit {
  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    this.loadTypekit();
  }

  loadTypekit(): void {
    const script = this.renderer.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://use.typekit.net/dlz2jhj.js`; // Replace xxxxxxx with your actual kit ID
    script.async = true;

    script.onload = () => {
      this.initializeTypekit();
    };

    script.onerror = () => {
      console.error('Error loading Typekit script.');
    };

    this.renderer.appendChild(document.head, script);
  }

  initializeTypekit(): void {
    const config = {
      kitId: 'dlz2jhj', // Replace with your Typekit Kit ID
      scriptTimeout: 3000,
      async: true,
    };

    const h = document.documentElement;
    h.className += ' wf-loading';

    setTimeout(() => {
      h.className = h.className.replace(/\bwf-loading\b/g, '') + ' wf-inactive';
    }, config.scriptTimeout);

    try {
      (window as any).Typekit.load(config);
    } catch (e) {
      console.error('Error initializing Typekit:', e);
    }
  }
}
