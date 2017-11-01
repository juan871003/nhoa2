import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { environment } from '../environments/environment';

import { BackendDbService } from 'app/services/backend-db.service';

import { AppComponent } from 'app/app.component';
import { AllStoriesComponent } from 'app/allstories/allstories.component';
import { StoryDetailComponent } from 'app/storydetail/storydetail.component'

import { AdminModule } from 'app/admin/admin.module';
import { AppRoutingModule } from 'app/routing/app-routing.module';

@NgModule({
  declarations: [
    AppComponent,
    AllStoriesComponent,
    StoryDetailComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AdminModule,
    AppRoutingModule
  ],
  providers: [ BackendDbService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
