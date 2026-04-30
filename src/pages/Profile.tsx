import { useAuthSource as useAuth } from "@/hooks/useAuthSource";
import { useDataSourceProfile } from "@/hooks/useDataSourceProfile";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ContactInfo } from "@/components/profile/ContactInfo";
import { SocialLinks } from "@/components/profile/SocialLinks";
import { BioSection } from "@/components/profile/BioSection";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user } = useAuth();
  const { profile, isLoading } = useDataSourceProfile();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <Button
          variant="outline"
          onClick={() => navigate("/settings/profile")}
          className="gap-2"
        >
          <Settings className="w-4 h-4" />
          Edit Profile
        </Button>
      </div>

      <ProfileHeader
        displayName={profile?.display_name || user?.name}
        nickname={profile?.nickname}
        email={user?.email}
        avatarUrl={profile?.avatar_url}
        isLoading={isLoading}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ContactInfo
          email={user?.email}
          phone={profile?.phone}
          isLoading={isLoading}
        />
        <SocialLinks
          githubUrl={profile?.github_url}
          twitterUrl={profile?.twitter_url}
          linkedinUrl={profile?.linkedin_url}
          websiteUrl={profile?.website_url}
          isLoading={isLoading}
        />
      </div>

      <BioSection bio={profile?.bio} isLoading={isLoading} />
    </div>
  );
}
