import { EventColor } from 'calendar-utils';

export class Constants{
    public static colors: Record<string, EventColor> = {
        red: {
          primary: '#ad2121',
          secondary: '#fce1e4',
        },
        blue: {
          primary: '#1e90ff',
          secondary: '#D1E8FF',
        },
        yellow: {
          primary: '#e3bc08',
          secondary: '#FDF1BA',
        },
        green: {
          primary: '#77b973',
          secondary: '#e8fde7',
        },
        orange: {
          primary: '#ff9c68',
          secondary: '#ffe0d0'
        },
        purple: {
          primary:'#dfb2f4',
          secondary: '#f1dbfb'
        },
        pink: {
          primary: '#FF82FA',
          secondary: '#FFDBFA',
        },
    };

    public static getColorbyName(colorName: string): EventColor {
      switch (colorName) {
        case 'red':
          return Constants.colors['red'];
        case 'blue':
          return Constants.colors['blue'];
        case 'yellow':
          return Constants.colors['yellow'];
        case 'green':
          return Constants.colors['green'];
        case 'orange':
          return Constants.colors['orange'];
        case 'purple':
          return Constants.colors['purple'];
        case 'pink':
          return Constants.colors['pink'];
        default:
          return Constants.colors['blue'];
      }
    }
}