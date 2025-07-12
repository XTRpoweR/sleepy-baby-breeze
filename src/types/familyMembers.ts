
export interface FamilyMember {
  id: string;
  user_id: string;
  baby_id: string;
  role: string;
  status: string;
  permissions: any;
  invited_at: string | null;
  joined_at: string | null;
  invited_by: string | null;
  email?: string;
  full_name?: string;
}

export interface FamilyInvitation {
  id: string;
  baby_id: string;
  email: string;
  role: string;
  status: string;
  invited_by: string;
  expires_at: string;
  invitation_token: string;
  permissions: any;
  created_at: string;
  updated_at: string;
}
