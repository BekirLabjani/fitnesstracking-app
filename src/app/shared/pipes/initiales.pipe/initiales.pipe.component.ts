import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'initials', // So rufen wir sie später auf: | initials
  standalone: true  // Wichtig: Damit wir sie direkt importieren können
})
export class InitialsPipe implements PipeTransform {

  transform(name: string | undefined | null): string {
    // 1. Wenn kein Name da ist, nichts anzeigen
    if (!name) return '';

    // 2. Namen zerlegen (z.B. "Bekir Labjani" -> ["Bekir", "Labjani"])
    const parts = name.trim().split(' ');

    // 3. Wenn nur ein Name da ist (z.B. "Bekir"), nimm den ersten Buchstaben
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    // 4. Sonst: Erster Buchstabe vom Vor- und Nachnamen
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }

}