import { TestBed } from '@angular/core/testing';

import { ChannelPanelService } from './channel-panel.service';

describe('ChannelPanelService', () => {
  let service: ChannelPanelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChannelPanelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
