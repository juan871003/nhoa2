import { Component } from '@angular/core';
//import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import { BackendDbService } from 'app/services/backend-db.service';
import { Story } from "app/models/models";

@Component({
    selector: 'all-stories',
    templateUrl: './allstories.component.html',
    styleUrls: ['./allstories.component.css']
})
export class AllStoriesComponent {
    stories: Story[];
    constructor(dbSvc: BackendDbService) {
        this.stories = [];
        
        dbSvc.getStories().subscribe(data => this.stories = data);
    }
}