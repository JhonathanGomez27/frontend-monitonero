import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatTime',
  standalone: true
})
export class FormatTimePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {

    const temp = value.toString().split(':');

    let horario = 'AM';
    let hora = temp[0];

    if(parseInt(temp[0]) > 12){
        hora = (parseInt(temp[0]) - 12).toString();
        horario = 'PM';
    }

    if(parseInt(temp[0]) == 0){
        hora = '12';
    }

    const minutos = temp[1];
    const segundos = temp[2];

    return `${hora}:${minutos}:${segundos} ${horario}`;
  }

}
