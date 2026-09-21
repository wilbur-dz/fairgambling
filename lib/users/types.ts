/** Public profile returned by `GET /api/users/by-username/:username`. */

export type ConnectedCasino = {
  slug: string;
  name: string;
  username: string;
  totalWagered: string;
};

export type UserProfile = {
  username: string;
  memberSince: string;
  totalReviews: number;
  totalWager: number | null;
  totalClaimed: number | null;
  ghostMode: boolean;
  profilePictureUrl: string | null;
  deactivated?: boolean;
  connectedCasinos: ConnectedCasino[];
};
