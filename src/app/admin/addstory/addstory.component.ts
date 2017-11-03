import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

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
  form: FormGroup;
  story: Story;
  localImgSrcs: { file: File, src: string }[];
  controlsReady: boolean;

  constructor(
    private db: BackendDbService,
    private fb: FormBuilder) {
    this.story = new Story();
    this.localImgSrcs = [];
    this.createForm();
    this.bindFormToStory();
    this.controlsReady = true;
  }

  createForm() {
    this.form = this.fb.group(this.initForm());
  }

  initForm() {
    return {
      author: ['', Validators.required],
      locations: this.fb.array([['']]),
      people: this.fb.array([['', Validators.required]]),
      localImageUrls: this.fb.array([['', Validators.required]]),
      sourceUrl: [''],
      paragraphs: this.fb.array([['', Validators.required]]),
    };
  }

  bindFormToStory() {
    this.form.get('author').valueChanges.subscribe((value: string) => {
      this.story.author = value;
    });

    this.form.get('locations').valueChanges.subscribe((value: string[]) => {
      this.story.locations = value;
    });

    this.form.get('people').valueChanges.subscribe((value: string[]) => {
      this.story.people = value;
    });

    this.form.get('localImageUrls').valueChanges.subscribe((value: (Event | string)[]) => {
      this.localImgSrcs = [];
      for (let i = 0; i < value.length; i++) {
        if (typeof value[i] !== 'string') {
          let event = value[i] as Event;
          let index = ~~(<HTMLInputElement>event.target).title; //I could not bind it to data-index, so I used title
          this.readLocalPath(event, index);
        }
      }
      //this.story.localImages is populated on submission, not here
    });

    this.form.get('sourceUrl').valueChanges.subscribe((value: string) => {
      this.story.sourceUrl = value;
    });

    this.form.get('paragraphs').valueChanges.subscribe((value: string[]) => {
      this.story.paragraphs = value;
    });
  }

  readLocalPath(event1: any, index: number) {
    const reader = new FileReader();
    if (event1.target.files && event1.target.files[0]) {
      reader.onload = (event2: any) => {
        this.localImgSrcs[index] = {
          file: fileBlb,
          src: event2.target.result as string
        }
        this.controlsReady = true;
      }
      const fileBlb = event1.target.files[0] as File;
      this.controlsReady = false;
      reader.readAsDataURL(fileBlb); // this calls reader.onload
    }
  }

  isFormReady(): boolean {
    return (this.form.valid && this.controlsReady);
  }

  onAddControl(controlArrayName: string, required: boolean) {
    (this.form.get(controlArrayName) as FormArray)
      .push(this.fb.control('', required ? Validators.required : null));
  }

  onRemoveControl(controlArrayName: string, index: number) {
    (this.form.get(controlArrayName) as FormArray)
      .removeAt(index);
  }

  onSubmit() {
    if (this.isFormReady()) {
      this.story.dateCreated = new Date();
      for (let i = 0; i < this.localImgSrcs.length; i++) {
        if (this.localImgSrcs[i].file) {
          this.story.localImages.push(this.localImgSrcs[i].file);
        }
      }
      this.db.addStory(this.story).subscribe((response: Response) => {
        switch (response.status) {
          case ResponseStatus.uploadingImage:
            //TODO: show bytes transferred to user
            break;
          case ResponseStatus.uploadingPaused:
            //TODO: show uploading paused message
            break;
          case ResponseStatus.uploaded:
            console.log('uploaded. story key: ' + response.item);
            break;
          case ResponseStatus.uploadingImage:
            //TODO: show resonse.message
          default:
            console.log(' unknown status, message: ' + response.message);
        }
      },
        (error: Response) => {
          console.log('Response error: ' + error);
          //TODO: Show error to user
        },
        () => {
          this.form = this.fb.group(this.initForm());
          //TODO: got to all-stories
        }
      );
    }
  }
}