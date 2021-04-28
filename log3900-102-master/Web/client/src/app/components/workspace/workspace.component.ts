import { Component, OnInit } from '@angular/core';
import { Color } from 'src/app/classes/color';
import { CoordinatesXY } from 'src/app/classes/coordinates-x-y';
import { WorkspaceService } from 'src/app/services/workspace/workspace.service';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss']
})
export class WorkspaceComponent implements OnInit {
  backgroundColor: Color;

  constructor(protected workspaceService: WorkspaceService) {}

  ngOnInit(): void {
    this.backgroundColor = this.workspaceService.backgroundColor;
  }

  // tslint:disable-next-line: no-any | Reason : unknown typedef of event
  onResize(event: any): void {
    this.workspaceService.size.next(new CoordinatesXY(Math.floor(event.target.offsetWidth), Math.floor(event.target.offsetHeight)));
  }
}
