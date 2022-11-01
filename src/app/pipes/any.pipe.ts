import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'any',
})
export class AnyPipe implements PipeTransform {
  transform = (value: any) => value as any;
}
