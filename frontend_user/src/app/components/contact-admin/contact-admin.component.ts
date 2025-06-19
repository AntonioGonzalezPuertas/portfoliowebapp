import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import {
  IonButton,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonTextarea,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-contact-admin',
  templateUrl: './contact-admin.component.html',
  styleUrls: ['./contact-admin.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonTextarea,
    IonSelect,
    IonLabel,
    IonItem,
    IonButton,
    IonSelectOption,
  ],
})
export class ContactAdminComponent {
  @Output() sendMessage = new EventEmitter<{
    category: string;
    message: string;
  }>();

  categories = [
    'Demande de support',
    'Demande de verification',
    'Plainte',
    'Suggestion',
    'Autre demande',
  ];

  contactForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      category: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(1)]],
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.sendMessage.emit(this.contactForm.value);
      this.contactForm.reset();
    }
  }
}
