import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, provideHttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { withFetch } from '@angular/common/http'; // Import the withFetch function

@NgModule({
  declarations: [
    
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot([
      { path: '', redirectTo: '/', pathMatch: 'full' }
    ])
  ],
  providers: [
    provideHttpClient(withFetch()) // Enable fetch APIs
  ],
  
})
export class AppModule { }
