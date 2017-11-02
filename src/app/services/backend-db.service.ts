import { Injectable, Inject } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { FirebaseApp } from 'angularfire2';
import * as firebase from 'firebase';
import { Observable } from "rxjs/Observable";

import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/concat';

import { Story } from "app/models/models";

export enum ResponseStatus {
  uploadingImage,
  uploadingStory,
  uploadingPaused,
  error,
  canceled,
  uploaded,
  revertingChanges,
}

export interface Response {
  message: string;
  status: ResponseStatus;
  item: any;
}

@Injectable()
export class BackendDbService {
  private loadedStories: Observable<Story[]>;
  private angularFireList: AngularFireList<any>;
  private fStorage: firebase.storage.Storage;

  constructor(
    @Inject(FirebaseApp) firebaseApp: firebase.app.App,
    private db: AngularFireDatabase) {
    this.fStorage = firebaseApp.storage();
    this.loadedStories = this._loadStories();
  }

  getStories(): Observable<Story[]> {
    return this.loadedStories;
  }

  addStory(story: Story): Observable<Response> {
    return this._uploadImages(story).concat(this._uploadStory(story));
  }

  private _cancelTransaction(story: Story): void {
    //TODO: cancel the upload of any data related to this story
  }

  private _uploadImages(story: Story): Observable<Response> {
    const fbRef = this.fStorage.ref();
    const imageName = story.people.toString().replace(/[^a-z0-9]/gi, '_').toLowerCase();

    let uploadTasks: Observable<Response>[] = [];
    console.log('upload images');
    for (let i = 0; i < story.localImages.length; i++) {
      let fbChild = fbRef.child(imageName + '_' + i);
      uploadTasks.push(
        Observable.create((observer) => {
          console.log('adding photos');
          let task = fbChild.put(story.localImages[i])
          task.on(
            firebase.storage.TaskEvent.STATE_CHANGED,
            (snapshot: firebase.storage.UploadTaskSnapshot) => {
              let response: Response = {
                message: '',
                status: ResponseStatus.uploadingImage,
                item: null
              } as Response;
              switch (snapshot.state) {
                case firebase.storage.TaskState.PAUSED:
                  response.status = ResponseStatus.uploadingPaused;
                  response.message = 'Uploading of image ' + i + ' has been paused';
                  break;
                case firebase.storage.TaskState.RUNNING:
                  response.status = ResponseStatus.uploadingImage;
                  response.message = "image " + i + " uploading";
                  response.item = '' + (snapshot.bytesTransferred / snapshot.totalBytes * 100);
                  break;
                case firebase.storage.TaskState.CANCELED:
                  response.status = ResponseStatus.canceled;
                  response.message = 'Uploading of image ' + i + ' has been cancelled';
                  break;
              }
              observer.next(response);
            },
            (error) => {
              observer.error({
                message: "error uploading image " + i,
                status: ResponseStatus.error,
                item: error
              } as Response);
            },
            () => {
              story.imageUrls.push(task.snapshot.downloadURL);
              observer.complete();
            }
          );
        })
      );
    }
    return Observable.merge(...uploadTasks);
  }

  private _uploadStory(story: Story): Observable<Response> {
    story.timespanModified = Date.now();
    story.dateCreated = story.dateCreated.toString();

    story.id = 1; //modify this to get the latest ID
    let observableId = this.db.list('/stories', ref => ref.orderByChild('id').limitToLast(1)).valueChanges().map((value: Story[]) => {
      story.id = value[0].id++;
      return {
        message: 'story ID assigned',
        status: ResponseStatus.uploadingStory,
        item: story.id
      } as Response;
    });

    //fromPromise is a hot Observable, we need to convert it into a cold Observable
    let observableStory = Observable.create((observer) => {
      let observableHot = Observable.fromPromise(this.db.list('/stories').push(story));
      observableHot.subscribe((tRef: firebase.database.ThenableReference) => {
        observer.next({
          message: 'Story uploaded',
          status: ResponseStatus.uploaded,
          item: tRef.key
        } as Response);
      }, (error) => {
        console.log(error);
        observer.error({
          message: 'Error uploading story',
          status: ResponseStatus.error,
          item: error
        } as Response);
      }, () => {
        observer.complete();
      });
    }) as Observable<Response>;

    return observableId.concat(observableStory);
  }

  private _loadStories(): Observable<Story[]> /* | Observable<Error> */ { //TODO: Find out what type is returned when an error occurs, and what to do about it
    //TODO: change this 'subscribe' to 'map'
    return Observable.create((observer) => {
      this.db.list('/stories').valueChanges().subscribe({
        next: list => observer.next(loadStoriesF(list)),
        error: err => observer.error(err),
        complete: () => observer.complete()
      });
    });

    function loadStoriesF(storiesArray): Story[] {
      const stories: Story[] = [];
      if (storiesArray instanceof Array) {
        storiesArray.forEach(s => {
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
          stories.push(story);
        });
      }
      return stories;
    }
  }
}
