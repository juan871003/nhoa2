import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { AngularFireAuth } from 'angularfire2/auth';

import { LoginComponent } from 'app/admin/login/login.component';
import { EditStoryComponent } from 'app/admin/editstory/editstory.component';
import { AddStoryComponent } from 'app/admin/addstory/addstory.component';
import { FileValueAccessorDirective } from 'app/admin/file-value-accessor.directive';

@NgModule({
  imports: [ CommonModule, RouterModule, FormsModule, ReactiveFormsModule ],
  exports: [ LoginComponent, EditStoryComponent, AddStoryComponent ],
  declarations: [ LoginComponent, EditStoryComponent, AddStoryComponent, FileValueAccessorDirective ],
  providers: [ AngularFireAuth ]
})
export class AdminModule { }
