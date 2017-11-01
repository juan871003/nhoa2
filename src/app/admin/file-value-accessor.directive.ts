import { Directive, ElementRef, HostBinding, HostListener } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { fromEvent } from 'rxjs/observable/fromEvent';
import 'rxjs/add/operator/debounceTime';

@Directive({
  selector: 'input[type=file]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: FileValueAccessorDirective,
      multi: true
    }
  ]
})
export class FileValueAccessorDirective implements ControlValueAccessor {
  onChange;

  @HostListener('change', ['$event']) _handleInput(event) {
    this.onChange(event);
  }

  constructor(private element: ElementRef) {  }

  writeValue(value: any) {
    //const normalizedValue = value == null ? '' : value;
    //this.render.setProperty(this.element.nativeElement, 'value', normalizedValue);
  }

  registerOnChange(fn) {    this.onChange = fn;  }

  registerOnTouched(fn: any) {  }

  nOnDestroy() {  }
}