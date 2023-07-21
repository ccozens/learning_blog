export interface ColourData {
    hex: string;
    name: string;
}

export interface Colour extends ColourData {
    rgb: string;
    hsl: string;
    both: string;
}