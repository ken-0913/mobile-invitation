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
      new ImageItem({src: 'https://www.live2d.com/wp-content/themes/cubism_new/assets/img/sample/sample-main.jpg'}),
      new ImageItem({src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQx9TDefaWOaqxEIoL4lfy_aKrHqSL3MUqq_w&s'})

    ];
  }

}
