import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';

import 'rxjs/add/operator/switchMap';

import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';

import { Story } from "app/models/models";

@Component({
  selector: 'story-detail',
  templateUrl: './storydetail.component.html',
  styleUrls: ['./storydetail.component.css']
})
export class StoryDetailComponent implements OnInit {
  storyFOO: AngularFireObject<any>;
  story: Story;

  constructor(
    private db: AngularFireDatabase,
    private route: ActivatedRoute,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.story = new Story();
    this.route.params
      .switchMap((params: Params) => this.db.object(params['id']).snapshotChanges())
      .subscribe(response => this.loadStory(response));

    //    this.storyFOO = this.db.object('/story/{id}');//TODO: check how to get ID from URL and how to pass ID to Firebase
    //    this.storyFOO.subscribe(response => this.loadStory(response));
  }

  loadStory(s): void {
    const story: Story = new Story();
    story.id = s.id;
    story.author = s.author;
    story.dateCreated = s.dateCreated;
    story.locations = s.locations;
    story.people = s.people;
    story.timespanModified = s.timespanModified;
    story.sourceUrl = s.sourceUrl;
    story.imageUrls = s.imageUrls;
    story.paragraphs = s.paragraphs;
    this.story = story;
  }

  goBack(): void {
    this.location.back();
  }
}