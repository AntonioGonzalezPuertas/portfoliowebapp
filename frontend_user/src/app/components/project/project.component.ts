import {  Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonChip, IonIcon, IonAvatar, IonLabel } from '@ionic/angular/standalone';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [CommonModule, IonChip, IonIcon, IonLabel, IonCard,
            IonCardHeader, IonCardTitle, IonCardContent, IonAvatar],
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss'],


})
export class ProjectComponent  implements OnInit {
  @Input() project:any;
  constructor() { }

  ngOnInit() {
  }

  getIcon(technology: string, type:string): string {
    let name = technology.toLowerCase().replace('.','');
    return'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/' + name + '/' + name + '-' + type + '.svg';
  }

  getIconUrl(skillName: string): string {
    const baseUrl = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/';
    const primaryUrl = `${baseUrl}${skillName.toLowerCase().replace('.','')}/${skillName.toLowerCase().replace('.','')}-original.svg`;
    return primaryUrl;
  }
  getProfilePreview(){
    
  }
}
