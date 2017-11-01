import { Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Observable } from "rxjs/Observable";

import { BackendDbService } from 'app/services/backend-db.service';
import { Response } from 'app/services/backend-db.service';
import { ResponseStatus } from 'app/services/backend-db.service';
import { Story } from "app/models/models";

@Component({
  selector: 'add-story',
  templateUrl: './addstory.component.html',
  styleUrls: ['./addstory.component.css']
})
export class AddStoryComponent {
  story: Story;
  localImages: string[];

  constructor(
    private router: Router,
    private db: BackendDbService,
    private location: Location) {
    this.story = new Story();
    this.story.locations.push('');
    this.story.people.push('');
    this.story.paragraphs.push('');
    this.localImages = [''];
  }

  goBack(): void {
    this.location.back();
  }

  onSubmit(form: NgForm) {
    //perhaps we should be using a promise??
    if (form.submitted && form.valid) {
      this.story.dateCreated = new Date();
      console.log('declaration');
      var observable = this.db.addStory(this.story);
      console.log('before subscription');
      observable.subscribe((response: Response) => {
        console.log('response message: ' + response.message);
        switch(response.status) {
          case ResponseStatus.uploadingImage:
            console.log('bytes transferred: ' + response.item);
          break;
          case ResponseStatus.uploaded:
            console.log('story key: ' + response.item);
            break;
          default:
            console.log('status = ' + response.status);
        }
      },
        (error: Response) => {
          console.log('Response error: ' + error);
        },
      () => {
        console.log('complete, story= ' + this.story.imageUrls.toString());
      });
      // this.db.addStory(this.story).subscribe({
      //   next: result => {
      //     /* if(result.status === "success") {
      //       //this.router.navigateByUrl('/stories');
      //       console.log(result.message);
      //     } else {
      //       console.log("from add story, result is: " + result);
      //     } */
      //     result.message ? console.log(result.message) : null;
      //   },
      //   error: result => {
      //     result.message ? console.log(result.message) : console.log(result);
      //   },
      //   complete: () => {
      //     console.log("uploading story completed!");
      //   }
      // }).unsubscribe();
    }
    console.log('after subscription');
  }

  trackByFn(index: any, item: any) {
    return index;
  }

  readLocalPath(event1: any, index: number) {
    var reader = new FileReader();
    if (event1.target.files && event1.target.files[0]) {
      reader.onload = (event2: any) => {
        this.localImages[index] = event2.target.result;
      }
      reader.readAsDataURL(event1.target.files[0]);
      this.story.localImages[index] = event1.target.files[0];
    }
  }
}