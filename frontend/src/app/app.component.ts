import { Component } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule]
})
export class AppComponent {
  title = 'CRUD Application';
  users: any[] = [];
  formData: { name: string; email: string } = { name: '', email: '' };
  editing: boolean = false;
  userIdToEdit: number | null = null;
  errorMessage: string = '';

  constructor(private http: HttpClient) {
    this.getUsers();
  }

  getUsers() {
    this.http.get<any[]>('http://localhost:3000/users').subscribe(
      (users) => {
        this.users = users;
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }

  onSubmit() {
    this.errorMessage = ''; // Clear any previous error message

    if (!this.validateForm()) {
      return; // Stop submission if validation fails
    }

    if (this.editing) {
      this.updateUser();
    } else {
      this.addUser();
    }
  }

  validateForm() {
    // Regular expression to allow only alphabetical characters and spaces
    const namePattern = /^[A-Za-z\s]+$/;

    // Check if name is not empty, has a minimum length, and only contains letters and spaces
    if (!this.formData.name || this.formData.name.trim().length < 3) {
      this.errorMessage = 'Name must be at least 3 characters long.';
      return false;
    }

    if (!namePattern.test(this.formData.name)) {
      this.errorMessage = 'Name must contain only alphabetical characters.';
      return false;
    }

    // Check if email is in valid format
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(this.formData.email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return false;
    }

    return true;
  }

  addUser() {
    const existingUser = this.users.find(user => 
      user.name === this.formData.name || user.email === this.formData.email
    );

    if (existingUser) {
      this.errorMessage = 'Name or email already exists.';
      return;
    }

    this.http.post('http://localhost:3000/users', this.formData).subscribe(
      () => {
        this.getUsers();
        this.resetForm();
      },
      (error) => {
        console.error('Error adding user:', error);
      }
    );
  }

  editUser(user: any) {
    this.formData = { name: user.name, email: user.email };
    this.userIdToEdit = user.id;
    this.editing = true;
  }

  updateUser() {
    this.http.put(`http://localhost:3000/users/${this.userIdToEdit}`, this.formData).subscribe(
      () => {
        this.getUsers();
        this.resetForm();
      },
      (error) => {
        console.error('Error updating user:', error);
      }
    );
  }

  deleteUser(id: number) {
    this.http.delete(`http://localhost:3000/users/${id}`).subscribe(
      () => {
        this.getUsers();
      },
      (error) => {
        console.error('Error deleting user:', error);
      }
    );
  }

  resetForm() {
    this.formData = { name: '', email: '' };
    this.editing = false;
    this.userIdToEdit = null;
    this.errorMessage = '';
  }
}
