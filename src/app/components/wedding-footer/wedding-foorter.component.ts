import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-wedding-foorter',
    imports: [],
    templateUrl: './wedding-foorter.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './wedding-foorter.component.scss'
})
export class WeddingFoorterComponent {
  copyRight = 'CopyRight 2024 AOR ATELIER .All right reserved'
}
