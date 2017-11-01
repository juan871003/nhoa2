import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllStoriesComponent } from 'app/allstories/allstories.component';
import { StoryDetailComponent } from 'app/storydetail/storydetail.component';
import { LoginComponent } from 'app/admin/login/login.component';
//import { EditStoryComponent } from 'app/admin/editstory/editstory.component';
import { AddStoryComponent } from 'app/admin/addstory/addstory.component';
import { AddStoryReactiveComponent } from 'app/admin/addstory/addstory.reactive.component';

const routes: Routes = [
  { path: '', redirectTo: '/stories', pathMatch: 'full' },
  { path: 'stories',  component: AllStoriesComponent },
  { path: 'story/:id', component: StoryDetailComponent },
  { path: 'login', component: LoginComponent },
  //{ path: 'edit-story/:id', component: EditStoryComponent },
  { path: 'add-story-reactive', component: AddStoryReactiveComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
