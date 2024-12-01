import {Component, OnInit} from '@angular/core';
import {Gallery, GalleryItem, GalleryModule, GalleryRef, ImageItem} from 'ng-gallery';
@Component({
  selector: 'app-wedding-gallery',
  standalone: true,
  imports: [GalleryModule],
  templateUrl: './wedding-gallery.component.html',
  styleUrl: './wedding-gallery.component.scss'
})
export class WeddingGalleryComponent implements OnInit {
  images: GalleryItem[] = [];
  ngOnInit() {
    this.images = [
      new ImageItem({src: ''}),
      new ImageItem({src: ''})
    ];
  }

}
