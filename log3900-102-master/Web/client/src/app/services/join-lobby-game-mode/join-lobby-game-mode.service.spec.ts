import { TestBed } from '@angular/core/testing';

import { JoinLobbyGameModeService } from './join-lobby-game-mode.service';

describe('JoinLobbyGameModeService', () => {
  let service: JoinLobbyGameModeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JoinLobbyGameModeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
