/**
 * Imago Imaginis 
 * ----------------------------
 * This is the modal component that we use in our Angular application.
 * It is loaded into other components that require the use of a modal.
 * It has its own styling, events, variables, and HTML templating.
 * Components that load the modal fill the ng-content tags with their own content.
 * https://stackoverflow.com/questions/34513558/angular-2-0-and-modal-dialog
 */
import { Component, Input } from '@angular/core';
@Component({
  selector: 'app-modal',
  template: `
  <div (click)="onContainerClicked($event)" class="modal fade" tabindex="-1" [ngClass]="{'show': visibleAnimate}"
       [ngStyle]="{'display': visible ? 'block' : 'none', 'color': 'black', 'overflow': 'scroll'}">
    <div class="modal-dialog">
    <div id="separator" style="margin-top: 50%"></div>
      <div class="modal-content" style="background: rgba(255, 255, 255, .9)">
        <div class="modal-header">
          <ng-content select=".app-modal-header"></ng-content>
        </div>
        <div class="modal-body">
          <ng-content select=".app-modal-body"></ng-content>
        </div>
        <div class="modal-footer">
          <ng-content select=".app-modal-footer"></ng-content>
        </div>
      </div>
    </div>
  </div>
  `
})
export class ModalComponent {
  @Input() clickOutsideToHide;

  public visible = false;
  public visibleAnimate = false;

  public show(): void {
    this.visible = true;
    setTimeout(() => this.visibleAnimate = true, 100);
  }

  public hide(): void {
    this.visibleAnimate = false;
    setTimeout(() => this.visible = false, 300);
  }

  public onContainerClicked(event: MouseEvent): void {
    if ((<HTMLElement>event.target).classList.contains('modal')) {
      if(this.clickOutsideToHide){
        this.hide();
      }
    }
  }
}