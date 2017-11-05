import { Injectable, Inject } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { FirebaseApp } from 'angularfire2';
import * as firebase from 'firebase';
import { Observable } from "rxjs/Observable";

import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/concat';
import 'rxjs/add/operator/concatAll';
import 'rxjs/add/operator/take';

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
  private fDb: firebase.database.Database;

  constructor(
    @Inject(FirebaseApp) firebaseApp: firebase.app.App,
    private db: AngularFireDatabase) {
    this.fStorage = firebaseApp.storage();
    this.fDb = firebaseApp.database();
    this.loadedStories = this._loadStories();
  }

  getStories(): Observable<Story[]> {
    return this.loadedStories;
  }

  addStory(story: Story): Observable<Response> {
    let obs = Observable.of(
      this._setStoryId(story),
      this._uploadImages(story),
      this._uploadStory(story));
    return obs.concatAll();
  }

  private _cancelTransaction(story: Story): void {
    //TODO: cancel the upload of any data related to this story
  }

  private _setStoryId(story: Story): Observable<Response> {
    return Observable.create((observer) => {
      story.id = -1;
      let idRef = this.fDb.ref('/stats/lastId');
      idRef.transaction((lastId) => {
        story.id = lastId + 1;
        return lastId + 1;
      }).then((value) => {
        observer.next({
          message: 'story ID assigned',
          status: ResponseStatus.uploadingStory,
          item: story.id
        } as Response);
        observer.complete();
      }).catch((error) => {
        observer.error({
          message: "error getting new id",
          status: ResponseStatus.error,
          item: error
        } as Response);
      });
    });
  }

  private _uploadImages(story: Story): Observable<Response> {
    const fbRef = this.fStorage.ref();
    
    let uploadTasks: Observable<Response>[] = [];
    for (let i = 0; i < story.localImages.length; i++) {
      uploadTasks.push(
        Observable.create((observer) => {
          let fbChild = fbRef.child("storyId_" + story.id + "_image_" + i);
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

    return observableStory;
  }

  private _loadStories(): Observable<Story[]> /* | Observable<Error> */ { //TODO: Find out what type is returned when an error occurs, and what to do about it
    return this.db.list('/stories').valueChanges().map(list => loadStoriesF(list));

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
