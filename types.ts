export interface UploadedFile {
    file: File;
    previewUrl: string;
}

export enum GenerationStatus {
    IDLE = 'IDLE',
    LOADING = 'LOADING',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR'
}

export interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}