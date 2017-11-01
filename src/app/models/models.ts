export class Story {
    id: number;
    author: string;
    dateCreated: Date | string; //FireBase doesn't support Date types, it needs to be converted to string before uploading.
    locations: string[];
    people: string[];
    timespanModified: number;
    sourceUrl: string;
    imageUrls: string[];
    localImages: File[];
    paragraphs: string[];

    constructor() {
        this.dateCreated = new Date();
        this.timespanModified = Date.now();
        this.imageUrls = [];
        this.paragraphs = [];
        this.locations = [];
        this.people = [];
        this.localImages = [];
    }
}