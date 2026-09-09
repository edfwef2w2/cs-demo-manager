import type { CameraRow } from 'csdm/node/database/cameras/cameras-table';
import type { CommentRow } from 'csdm/node/database/comments/comment-table';
import type { PlayerCommentTable } from 'csdm/node/database/comments/player-comments-table';
import type { RoundCommentTable } from 'csdm/node/database/comments/round-comments-table';
import type { DemoPathRow } from 'csdm/node/database/demos/demo-path-table';
import type { DownloadHistoryTable } from 'csdm/node/database/download-history/download-history-table';
import type { FaceitAccountRow } from 'csdm/node/database/faceit-account/faceit-account-row';
import type { FaceitMatchPlayerRow } from 'csdm/node/database/faceit-matches/faceit-match-player-table';
import type { FaceitMatchRow } from 'csdm/node/database/faceit-matches/faceit-match-table';
import type { FaceitMatchTeamRow } from 'csdm/node/database/faceit-matches/faceit-match-team-table';
import type { FiveEPlayAccountRow } from 'csdm/node/database/5play-account/5eplay-account-row';
import type { MapRow } from 'csdm/node/database/maps/map-table';
import type { RenownAccountRow } from 'csdm/node/database/renown-account/renown-account-row';
import type { IgnoredSteamAccountRow } from 'csdm/node/database/steam-accounts/ignored-steam-account-table';
import type { SteamAccountOverridesTable } from 'csdm/node/database/steam-accounts/steam-account-overrides-table';
import type { SteamAccountTable } from 'csdm/node/database/steam-accounts/steam-account-table';
import type { ChecksumTagRow } from 'csdm/node/database/tags/checksum-tag-table';
import type { RoundTagRow } from 'csdm/node/database/tags/round-tag-table';
import type { SteamAccountTagRow } from 'csdm/node/database/tags/steam-account-tag-table';
import type { TagRow } from 'csdm/node/database/tags/tag-table';
import type { TimestampName } from 'csdm/node/database/timestamps/timestamp-name';

type FaceitMatchDocument = {
  match: FaceitMatchRow;
  players: FaceitMatchPlayerRow[];
  teams: FaceitMatchTeamRow[];
};

export type Catalogs = {
  tags: TagRow[];
  maps: MapRow[];
  cameras: CameraRow[];
  comments: CommentRow[];
  playerComments: PlayerCommentTable[];
  roundComments: RoundCommentTable[];
  checksumTags: ChecksumTagRow[];
  roundTags: RoundTagRow[];
  steamAccountTags: SteamAccountTagRow[];
  steamAccounts: SteamAccountTable[];
  steamAccountOverrides: SteamAccountOverridesTable[];
  ignoredSteamAccounts: IgnoredSteamAccountRow[];
  faceitAccounts: FaceitAccountRow[];
  faceitMatches: FaceitMatchDocument[];
  fiveEPlayAccounts: FiveEPlayAccountRow[];
  renownAccounts: RenownAccountRow[];
  downloadHistory: DownloadHistoryTable[];
  timestamps: Partial<Record<TimestampName, string>>;
  demoPaths: DemoPathRow[];
};

export function createEmptyCatalogs(): Catalogs {
  return {
    tags: [],
    maps: [],
    cameras: [],
    comments: [],
    playerComments: [],
    roundComments: [],
    checksumTags: [],
    roundTags: [],
    steamAccountTags: [],
    steamAccounts: [],
    steamAccountOverrides: [],
    ignoredSteamAccounts: [],
    faceitAccounts: [],
    faceitMatches: [],
    fiveEPlayAccounts: [],
    renownAccounts: [],
    downloadHistory: [],
    timestamps: {},
    demoPaths: [],
  };
}

export function reviveCatalogDates(catalogs: Catalogs) {
  for (const account of catalogs.steamAccounts) {
    account.last_ban_date = account.last_ban_date ? new Date(account.last_ban_date) : null;
    account.creation_date = account.creation_date ? new Date(account.creation_date) : null;
    account.created_at = new Date(account.created_at);
    account.updated_at = new Date(account.updated_at);
  }

  for (const history of catalogs.downloadHistory) {
    history.downloaded_at = new Date(history.downloaded_at);
  }

  for (const document of catalogs.faceitMatches) {
    document.match.date = new Date(document.match.date);
  }
}
